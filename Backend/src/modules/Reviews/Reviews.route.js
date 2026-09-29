import { Router } from 'express'
import { getAll, getById, create, update, remove } from './reviews.controller.js'
import { authMiddleware } from '../../middleware/auth.middleware.js'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Quản lý reviews
 */


/**
 * @swagger
 * /reviews:
 *   get:
 *     tags: [Reviews]
 *     summary: Lấy danh sách reviews
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
 *     tags: [Reviews]
 *     summary: Tạo reviews mới
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
 *               book_id:
 *                 type: string
 *               user_id:
 *                 type: string
 *               order_item_id:
 *                 type: string
 *               rating:
 *                 type: integer
 *               body:
 *                 type: string
 *               is_verified:
 *                 type: boolean
 */
router.get('/', authMiddleware, getAll)
router.post('/', authMiddleware, create)

/**
 * @swagger
 * /reviews/{id}:
 *   get:
 *     tags: [Reviews]
 *     summary: Lấy reviews theo ID
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
 *     tags: [Reviews]
 *     summary: Cập nhật reviews
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
 *               book_id:
 *                 type: string
 *               user_id:
 *                 type: string
 *               order_item_id:
 *                 type: string
 *               rating:
 *                 type: integer
 *               body:
 *                 type: string
 *               is_verified:
 *                 type: boolean
 *   delete:
 *     tags: [Reviews]
 *     summary: Xóa reviews
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
