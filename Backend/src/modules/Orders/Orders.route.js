import { Router } from 'express'
import { getAll, getById, create, update, remove } from './Orders.controller.js'
import { authMiddleware } from '../../middleware/auth.middleware.js'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Quản lý Orders
 */


/**
 * @swagger
 * /Orders:
 *   get:
 *     tags: [Orders]
 *     summary: Lấy danh sách Orders
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
 *     tags: [Orders]
 *     summary: Tạo Orders mới
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
 *               user_id:
 *                 type: string
 *               address_id:
 *                 type: string
 *               voucher_id:
 *                 type: string
 *               total_price:
 *                 type: integer
 *               discount_price:
 *                 type: integer
 *               final_price:
 *                 type: integer
 *               payment_method:
 *                 type: string
 *               payment_status:
 *                 type: string
 *               order_status:
 *                 type: string
 *               vnpay_tran_no:
 *                 type: string
 */
router.get('/', authMiddleware, getAll)
router.post('/', authMiddleware, create)

/**
 * @swagger
 * /Orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Lấy Orders theo ID
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
 *     tags: [Orders]
 *     summary: Cập nhật Orders
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
 *               user_id:
 *                 type: string
 *               address_id:
 *                 type: string
 *               voucher_id:
 *                 type: string
 *               total_price:
 *                 type: integer
 *               discount_price:
 *                 type: integer
 *               final_price:
 *                 type: integer
 *               payment_method:
 *                 type: string
 *               payment_status:
 *                 type: string
 *               order_status:
 *                 type: string
 *               vnpay_tran_no:
 *                 type: string
 *   delete:
 *     tags: [Orders]
 *     summary: Xóa Orders
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
