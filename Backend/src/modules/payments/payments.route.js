import { Router } from 'express'
import { getAll, getById, create, update, remove, createVnpayUrl, vnpayReturn, vnpayIpn } from './payments.controller.js'
import { authMiddleware } from '../../middleware/auth.middleware.js'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Quản lý payments
 */


/**
 * @swagger
 * /payments:
 *   get:
 *     tags: [Payments]
 *     summary: Lấy danh sách payments
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
 *     tags: [Payments]
 *     summary: Tạo payments mới
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
 *               method:
 *                 type: string
 *               amount:
 *                 type: number
 *               status:
 *                 type: string
 *               gateway_txn_id:
 *                 type: string
 *               gateway_ref:
 *                 type: string
 *               gateway_response:
 *                 type: object
 *               paid_at:
 *                 type: string
 */
router.get('/', authMiddleware, getAll)
router.post('/', authMiddleware, create)

/**
 * @swagger
 * /payments/{id}:
 *   get:
 *     tags: [Payments]
 *     summary: Lấy payments theo ID
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
 *     tags: [Payments]
 *     summary: Cập nhật payments
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
 *               method:
 *                 type: string
 *               amount:
 *                 type: number
 *               status:
 *                 type: string
 *               gateway_txn_id:
 *                 type: string
 *               gateway_ref:
 *                 type: string
 *               gateway_response:
 *                 type: object
 *               paid_at:
 *                 type: string
 *   delete:
 *     tags: [Payments]
 *     summary: Xóa payments
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

router.post('/vnpay/create_url', authMiddleware, createVnpayUrl)
router.get('/vnpay/vnpay_return', vnpayReturn)
router.get('/vnpay/vnpay_ipn', vnpayIpn)

export default router
