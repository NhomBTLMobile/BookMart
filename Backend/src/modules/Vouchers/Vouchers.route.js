import { Router } from 'express'
import { getAll, getById, create, update, remove } from './Vouchers.controller.js'
import { authMiddleware } from '../../middleware/auth.middleware.js'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Vouchers
 *   description: Quản lý Vouchers
 */


/**
 * @swagger
 * /Vouchers:
 *   get:
 *     tags: [Vouchers]
 *     summary: Lấy danh sách Vouchers
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
 *     tags: [Vouchers]
 *     summary: Tạo Vouchers mới
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
 *               code:
 *                 type: string
 *               discount_type:
 *                 type: string
 *               discount_value:
 *                 type: integer
 *               min_order_value:
 *                 type: integer
 *               max_discount_amount:
 *                 type: integer
 *               usage_limit:
 *                 type: integer
 *               used_count:
 *                 type: integer
 *               start_date:
 *                 type: string
 *               end_date:
 *                 type: string
 */
router.get('/', authMiddleware, getAll)
router.post('/', authMiddleware, create)

/**
 * @swagger
 * /Vouchers/{id}:
 *   get:
 *     tags: [Vouchers]
 *     summary: Lấy Vouchers theo ID
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
 *     tags: [Vouchers]
 *     summary: Cập nhật Vouchers
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
 *               code:
 *                 type: string
 *               discount_type:
 *                 type: string
 *               discount_value:
 *                 type: integer
 *               min_order_value:
 *                 type: integer
 *               max_discount_amount:
 *                 type: integer
 *               usage_limit:
 *                 type: integer
 *               used_count:
 *                 type: integer
 *               start_date:
 *                 type: string
 *               end_date:
 *                 type: string
 *   delete:
 *     tags: [Vouchers]
 *     summary: Xóa Vouchers
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
