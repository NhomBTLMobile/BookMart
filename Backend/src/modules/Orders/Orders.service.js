import { OrdersRepository } from './orders.repository.js'
import { ShippingOrdersRepository } from '../shipping_orders/shipping_orders.repository.js'
import { createGHNOrder } from '../../utils/ghn.js'

const repo = new OrdersRepository()
const shippingRepo = new ShippingOrdersRepository()

export class OrdersService {
  async getAll(query) {
    return repo.findAll(query)
  }

  async getById(id) {
    const item = await repo.findById(id)
    if (!item) {
      const err = new Error('Không tìm thấy orders')
      err.status = 404
      throw err
    }
    return item
  }

  async create(data) {
    return repo.create(data)
  }

  async update(id, data) {
    await this.getById(id) // throws 404 if not found
    return repo.update(id, data)
  }

  async delete(id) {
    await this.getById(id)
    return repo.delete(id)
  }

  async createGHNShipping(orderId, shippingInfo) {
    const order = await this.getById(orderId);
    if (!order) {
      const err = new Error("Không tìm thấy đơn hàng"); err.status = 404; throw err;
    }
    if (order.order_status !== 'confirmed') {
      const err = new Error("Chỉ có thể tạo đơn GHN cho đơn hàng đã xác nhận"); err.status = 400; throw err;
    }

    const { weight, length, width, height } = shippingInfo;
    
    // Parse shipping snapshot
    let snapshot = {};
    if (typeof order.shipping_snapshot === 'string') {
      try { snapshot = JSON.parse(order.shipping_snapshot); } catch (e) { }
    } else {
      snapshot = order.shipping_snapshot || {};
    }

    const items = order.items.map(i => ({
      name: i.item_name,
      quantity: i.quantity,
      price: parseInt(i.unit_price, 10),
      weight: Math.round(weight / order.items.length) || 100
    }));

    const isCOD = String(order.payment_method).toLowerCase() === 'cod' && String(order.payment_status).toLowerCase() !== 'paid';
    const codAmount = isCOD ? parseInt(order.total_amount, 10) : 0;

    const ghnPayload = {
      payment_type_id: 1, // 1: Shop/Người gửi trả phí vận chuyển (thường là mặc định với TMĐT)
      cod_amount: codAmount,

      note: "CHÚ Ý HÀNG DỄ VỠ",
      required_note: "CHOXEMHANGKHONGTHU",
      to_name: snapshot.recipient_name || snapshot.full_name || order.customer_name || "Khách Hàng",
      to_phone: snapshot.phone || order.customer_phone || "0999999999",
      to_address: snapshot.street_address || snapshot.full_address || "Địa chỉ mặc định",
      to_ward_code: snapshot.ward_code ? String(snapshot.ward_code) : undefined,
      to_district_id: snapshot.district_id ? parseInt(snapshot.district_id, 10) : undefined,
      
      from_name: "BookMart Store",
      from_phone: "0987654321",
      from_address: "123 Đường Sách",
      from_ward_name: "Phường An Khánh",
      from_district_name: "Thành Phố Thủ Đức",
      from_province_name: "Hồ Chí Minh",

      weight: parseInt(weight, 10) || 500,
      length: parseInt(length, 10) || 20,
      width: parseInt(width, 10) || 20,
      height: parseInt(height, 10) || 10,
      service_type_id: 2,
      items: items
    };

    // Gọi API GHN
    const ghnRes = await createGHNOrder(ghnPayload);
    const orderCode = ghnRes?.data?.order_code;
    const fee = ghnRes?.data?.total_fee || 0;
    const expectedDelivery = ghnRes?.data?.expected_delivery_time;

    if (!orderCode) {
      const err = new Error("GHN không trả về mã vận đơn"); err.status = 400; throw err;
    }

    // Lưu vào db shipping_orders
    const shippingRecord = await shippingRepo.create({
      order_id: orderId,
      provider_order_id: orderCode,
      tracking_code: orderCode,
      shipping_status: 'ready_to_pick',
      fee: fee,
      expected_date: expectedDelivery ? new Date(expectedDelivery) : new Date(Date.now() + 3*24*60*60*1000)
    });

    // Cập nhật trạng thái đơn hàng
    await repo.update(orderId, { order_status: 'packing' });

    return {
      message: "Tạo đơn giao hàng thành công",
      ghn_order_code: orderCode,
      tracking_code: orderCode,
      shipping: shippingRecord
    };
  }

  async handleGHNWebhook(webhookData) {
    // GHN sẽ POST vào API này mỗi khi trạng thái giao hàng thay đổi
    // webhookData thường chứa { OrderCode, Status, Fee, ... }
    const { OrderCode, Status } = webhookData;
    if (!OrderCode || !Status) return;

    // Tìm đơn hàng vận chuyển theo OrderCode
    const shippingRecord = await shippingRepo.findByTrackingCode(OrderCode);
    if (!shippingRecord) return;

    const orderId = shippingRecord.order_id;
    
    // Cập nhật trạng thái GHN nội bộ (vd: ready_to_pick, delivering, delivered, returned...)
    await shippingRepo.update(shippingRecord.id, { shipping_status: Status });

    // Ánh xạ trạng thái GHN sang trạng thái Order của hệ thống BookMart
    let newOrderStatus = null;
    let newPaymentStatus = null;

    switch (Status) {
      case 'delivering':
        newOrderStatus = 'shipping';
        break;
      case 'delivered':
        newOrderStatus = 'delivered';
        // Nếu là COD và đã giao thành công -> tức là shipper đã thu tiền
        const order = await this.getById(orderId);
        if (String(order.payment_method).toLowerCase() === 'cod') {
          newPaymentStatus = 'paid';
        }
        break;
      case 'return':
      case 'returned':
        newOrderStatus = 'cancelled'; // hoặc 'returned' nếu có
        break;
      case 'cancel':
        newOrderStatus = 'cancelled';
        break;
    }

    const updates = {};
    if (newOrderStatus) updates.order_status = newOrderStatus;
    if (newPaymentStatus) updates.payment_status = newPaymentStatus;

    if (Object.keys(updates).length > 0) {
      await repo.update(orderId, updates);
    }
  }

}
