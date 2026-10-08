import { sequelize } from '../../config/database.js'

export const getStats = async ({ startDate, endDate } = {}) => {
  let dateFilterOrder = ''
  let dateFilterUser = ''
  let replacements = {}

  if (startDate && endDate) {
    dateFilterOrder = `AND o.created_at >= :startDate AND o.created_at <= :endDate`
    dateFilterUser = `AND created_at >= :startDate AND created_at <= :endDate`
    replacements = { startDate, endDate: endDate + ' 23:59:59' }
  } else {
    dateFilterUser = `AND created_at >= date_trunc('month', CURRENT_DATE)`
  }

  const [revenueResult] = await sequelize.query(`
    SELECT COALESCE(SUM(o.total_amount), 0) as total_revenue
    FROM orders o
    WHERE o.order_status != 'cancelled' ${dateFilterOrder}
  `, { replacements })

  const [ordersResult] = await sequelize.query(`
    SELECT COUNT(*) as total_orders
    FROM orders o
    WHERE o.order_status != 'cancelled' ${dateFilterOrder}
  `, { replacements })

  const [usersResult] = await sequelize.query(`
    SELECT COUNT(*) as new_users
    FROM users
    WHERE 1=1 ${dateFilterUser}
  `, { replacements })

  const [booksSoldResult] = await sequelize.query(`
    SELECT COALESCE(SUM(oi.quantity), 0) as total_books_sold
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE o.order_status != 'cancelled' ${dateFilterOrder}
  `, { replacements })

  return {
    totalRevenue: parseFloat(revenueResult[0].total_revenue) || 0,
    totalOrders: parseInt(ordersResult[0].total_orders, 10) || 0,
    newUsers: parseInt(usersResult[0].new_users, 10) || 0,
    totalBooksSold: parseInt(booksSoldResult[0].total_books_sold, 10) || 0,
  }
}

export const getRevenueChart = async ({ startDate, endDate } = {}) => {
  let dateFilter = `o.created_at >= CURRENT_DATE - INTERVAL '30 days'`
  let replacements = {}
  
  if (startDate && endDate) {
    dateFilter = `o.created_at >= :startDate AND o.created_at <= :endDate`
    replacements = { startDate, endDate: endDate + ' 23:59:59' }
  }

  const [results] = await sequelize.query(`
    SELECT 
      TO_CHAR(DATE(o.created_at), 'YYYY-MM-DD') as date,
      COALESCE(SUM(o.total_amount), 0) as revenue
    FROM orders o
    WHERE ${dateFilter}
      AND o.order_status != 'cancelled'
    GROUP BY DATE(o.created_at)
    ORDER BY DATE(o.created_at) ASC
  `, { replacements })

  return results.map(row => ({
    date: row.date,
    revenue: parseFloat(row.revenue) || 0
  }))
}

export const getTopBooks = async ({ startDate, endDate } = {}) => {
  let dateFilter = ''
  let replacements = {}
  
  if (startDate && endDate) {
    dateFilter = `AND o.created_at >= :startDate AND o.created_at <= :endDate`
    replacements = { startDate, endDate: endDate + ' 23:59:59' }
  }

  // Top 5 best selling books
  const [results] = await sequelize.query(`
    SELECT 
      b.id,
      b.title,
      b.sale_price,
      b.sold_count,
      (SELECT image_url FROM book_images WHERE book_id = b.id ORDER BY sort_order ASC LIMIT 1) as image_url,
      COALESCE(SUM(oi.quantity), 0) as total_quantity
    FROM books b
    JOIN order_items oi ON b.id = oi.book_id
    JOIN orders o ON oi.order_id = o.id
    WHERE o.order_status != 'cancelled' ${dateFilter}
    GROUP BY b.id, b.title, b.sale_price, b.sold_count
    ORDER BY total_quantity DESC
    LIMIT 10
  `, { replacements })
  return results
}

export const getRecentOrders = async ({ startDate, endDate } = {}) => {
  let dateFilter = ''
  let replacements = {}
  
  if (startDate && endDate) {
    dateFilter = `WHERE o.created_at >= :startDate AND o.created_at <= :endDate`
    replacements = { startDate, endDate: endDate + ' 23:59:59' }
  }

  // 10 most recent orders with items and shipping details
  const [orders] = await sequelize.query(`
    SELECT 
      o.id,
      o.order_code,
      o.subtotal,
      o.shipping_fee,
      o.discount_amount,
      o.total_amount,
      o.payment_method,
      o.payment_status,
      o.order_status,
      o.shipping_snapshot,
      o.created_at,
      u.full_name as customer_name,
      u.email as customer_email,
      u.phone as customer_phone
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    ${dateFilter}
    ORDER BY o.created_at DESC
    LIMIT 50
  `, { replacements })

  for (const ord of orders) {
    const [items] = await sequelize.query(`
      SELECT item_name, unit_price, quantity, total_price
      FROM order_items
      WHERE order_id = :orderId
    `, { replacements: { orderId: ord.id } })
    ord.items = items || []
  }

  return orders
}

export const getExportReportData = async ({ startDate, endDate } = {}) => {
  let dateFilter = ''
  let replacements = {}
  
  if (startDate && endDate) {
    dateFilter = `WHERE o.created_at >= :startDate AND o.created_at <= :endDate`
    replacements = { startDate, endDate: endDate + ' 23:59:59' }
  }

  // 1. Lấy tất cả đơn hàng chi tiết
  const [orders] = await sequelize.query(`
    SELECT 
      o.order_code,
      u.full_name as customer_name,
      u.phone as customer_phone,
      TO_CHAR(o.created_at, 'DD/MM/YYYY HH24:MI') as order_date,
      o.payment_method,
      o.order_status,
      o.subtotal,
      o.shipping_fee,
      o.discount_amount,
      o.total_amount
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    ${dateFilter}
    ORDER BY o.created_at DESC
  `, { replacements })

  // 2. Lấy danh sách sách bán ra chi tiết
  const [books] = await sequelize.query(`
    SELECT 
      b.isbn as book_code,
      b.title,
      c.name as category,
      b.sale_price,
      SUM(oi.quantity) as qty_sold,
      SUM(oi.total_price) as total_revenue
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    JOIN books b ON oi.book_id = b.id
    LEFT JOIN book_categories bc ON b.id = bc.book_id AND bc.is_primary = true
    LEFT JOIN categories c ON bc.category_id = c.id
    ${dateFilter} AND o.order_status = 'delivered'
    GROUP BY b.isbn, b.title, c.name, b.sale_price
    ORDER BY qty_sold DESC
  `, { replacements })

  return {
    orders,
    books
  }
}
