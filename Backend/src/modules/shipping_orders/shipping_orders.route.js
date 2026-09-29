import { Router } from 'express'
import { getAll, getById, create, update, remove } from './shipping_orders.controller.js'
import { authMiddleware } from '../../middleware/auth.middleware.js'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: ShippingOrders
 *   description: Quản lý shipping_orders
 */


/**
 * @swagger
 * /shipping_orders:
 *   get:
 *     tags: [ShippingOrders]
 *     summary: Lấy danh sách shipping_orders
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *     responses:
 *       200:
 *         description: Thành công
 *   post:
 *     tags: [ShippingOrders]
 *     summary: Tạo shipping_orders mới
 *     responses:
 *       201:
 *         description: Đã tạo thành công
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               order_id:
 *                 type: string
 *               provider_order_id:
 *                 type: string
 *               tracking_code:
 *                 type: string
 *               shipping_status:
 *                 type: string
 *               fee:
 *                 type: number
 *               expected_date:
 *                 type: string
 */
router.get('/', authMiddleware, getAll)
router.post('/', authMiddleware, create)

/**
 * @swagger
 * /shipping_orders/{id}:
 *   get:
 *     tags: [ShippingOrders]
 *     summary: Lấy shipping_orders theo ID
 *     responses:
 *       200:
 *         description: Thành công
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *   put:
 *     tags: [ShippingOrders]
 *     summary: Cập nhật shipping_orders
 *     responses:
 *       200:
 *         description: Thành công
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               order_id:
 *                 type: string
 *               provider_order_id:
 *                 type: string
 *               tracking_code:
 *                 type: string
 *               shipping_status:
 *                 type: string
 *               fee:
 *                 type: number
 *               expected_date:
 *                 type: string
 *   delete:
 *     tags: [ShippingOrders]
 *     summary: Xóa shipping_orders
 *     responses:
 *       200:
 *         description: Thành công
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/:id', authMiddleware, getById)
router.put('/:id', authMiddleware, update)
router.delete('/:id', authMiddleware, remove)

export default router
