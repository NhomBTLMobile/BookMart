import { sequelize } from '../../config/database.js'

export const getStats = async () => {
  const [revenueResult] = await sequelize.query(`
    SELECT COALESCE(SUM(total_amount), 0) as total_revenue
    FROM orders
    WHERE order_status != 'cancelled'
  `)

  const [ordersResult] = await sequelize.query(`
    SELECT COUNT(*) as total_orders
    FROM orders
    WHERE order_status != 'cancelled'
  `)

  const [usersResult] = await sequelize.query(`
    SELECT COUNT(*) as new_users
    FROM users
    WHERE created_at >= date_trunc('month', CURRENT_DATE)
  `)

  const [booksSoldResult] = await sequelize.query(`
    SELECT COALESCE(SUM(oi.quantity), 0) as total_books_sold
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE o.order_status != 'cancelled'
  `)

  return {
    totalRevenue: parseFloat(revenueResult[0].total_revenue) || 0,
    totalOrders: parseInt(ordersResult[0].total_orders, 10) || 0,
    newUsers: parseInt(usersResult[0].new_users, 10) || 0,
    totalBooksSold: parseInt(booksSoldResult[0].total_books_sold, 10) || 0,
  }
}

export const getRevenueChart = async () => {
  // Returns revenue grouped by date for the last 30 days
  const [results] = await sequelize.query(`
    SELECT 
      TO_CHAR(DATE(created_at), 'YYYY-MM-DD') as date,
      COALESCE(SUM(total_amount), 0) as revenue
    FROM orders
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      AND order_status != 'cancelled'
    GROUP BY DATE(created_at)
    ORDER BY DATE(created_at) ASC
  `)

  return results.map(row => ({
    date: row.date,
    revenue: parseFloat(row.revenue) || 0
  }))
}

export const getTopBooks = async () => {
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
    WHERE o.order_status != 'cancelled'
    GROUP BY b.id, b.title, b.sale_price, b.sold_count
    ORDER BY total_quantity DESC
    LIMIT 5
  `)
  return results
}

export const getRecentOrders = async () => {
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
    ORDER BY o.created_at DESC
    LIMIT 10
  `)

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
