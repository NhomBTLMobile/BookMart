import { Router } from 'express'
import { getAll, getById, create, update, remove } from './vouchers.controller.js'
import { authMiddleware } from '../../middleware/auth.middleware.js'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Vouchers
 *   description: Quản lý vouchers
 */


/**
 * @swagger
 * /vouchers:
 *   get:
 *     tags: [Vouchers]
 *     summary: Lấy danh sách vouchers
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
 *     summary: Tạo vouchers mới
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
 *               type:
 *                 type: string
 *               value:
 *                 type: number
 *               max_discount:
 *                 type: number
 *               min_order_value:
 *                 type: number
 *               usage_limit:
 *                 type: integer
 *               used_count:
 *                 type: integer
 *               ends_at:
 *                 type: string
 *               is_active:
 *                 type: boolean
 */
router.get('/', authMiddleware, getAll)
router.post('/', authMiddleware, create)

/**
 * @swagger
 * /vouchers/{id}:
 *   get:
 *     tags: [Vouchers]
 *     summary: Lấy vouchers theo ID
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
 *     summary: Cập nhật vouchers
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
 *               type:
 *                 type: string
 *               value:
 *                 type: number
 *               max_discount:
 *                 type: number
 *               min_order_value:
 *                 type: number
 *               usage_limit:
 *                 type: integer
 *               used_count:
 *                 type: integer
 *               ends_at:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *   delete:
 *     tags: [Vouchers]
 *     summary: Xóa vouchers
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
