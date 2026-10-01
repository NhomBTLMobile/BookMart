const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('bookmart', 'postgres', 'Vuong2005', { 
    host: 'localhost', 
    dialect: 'postgres', 
    logging: false 
});

async function run() { 
    try { 
        const [shippings] = await sequelize.query(`SELECT tracking_code FROM shipping_orders WHERE order_id = '22222222-2222-2222-2222-222222222222'`); 
        
        if (!shippings.length) {
            console.log('Chưa tìm thấy mã vận đơn GHN, bạn đã tạo đơn GHN cho mã này chưa?');
            return process.exit(0);
        }
        
        const trackingCode = shippings[0].tracking_code; 
        console.log('Mã Vận Đơn GHN thật là:', trackingCode); 
        
        const res = await fetch('http://localhost:3000/api/v1/orders/ghn-webhook', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ OrderCode: trackingCode, Status: 'delivered' }) 
        }); 
        
        if (res.ok) {
            console.log('✅ Đã giả lập Webhook thành công! Hãy kiểm tra Database!'); 
        } else {
            console.log('❌ Webhook lỗi:', res.status);
        }
        process.exit(0); 
    } catch(e) { 
        console.error(e); 
        process.exit(1); 
    } 
} 

run();
