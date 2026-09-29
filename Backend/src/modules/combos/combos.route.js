import { Router } from 'express'
import { getAll, getById, create, update, remove } from './combos.controller.js'
import { authMiddleware } from '../../middleware/auth.middleware.js'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Combos
 *   description: Quản lý combos
 */


/**
 * @swagger
 * /combos:
 *   get:
 *     tags: [Combos]
 *     summary: Lấy danh sách combos
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
 *     tags: [Combos]
 *     summary: Tạo combos mới
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
 *               name:
 *                 type: string
 *               cover_image_url:
 *                 type: string
 *               original_total:
 *                 type: number
 *               combo_price:
 *                 type: number
 *               stock_qty:
 *                 type: integer
 *               is_active:
 *                 type: boolean
 *               ends_at:
 *                 type: string
 */
router.get('/', authMiddleware, getAll)
router.post('/', authMiddleware, create)

/**
 * @swagger
 * /combos/{id}:
 *   get:
 *     tags: [Combos]
 *     summary: Lấy combos theo ID
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
 *     tags: [Combos]
 *     summary: Cập nhật combos
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
 *               name:
 *                 type: string
 *               cover_image_url:
 *                 type: string
 *               original_total:
 *                 type: number
 *               combo_price:
 *                 type: number
 *               stock_qty:
 *                 type: integer
 *               is_active:
 *                 type: boolean
 *               ends_at:
 *                 type: string
 *   delete:
 *     tags: [Combos]
 *     summary: Xóa combos
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
