import { Router } from 'express'
import { getAll, getById, create, update, remove } from './book_feature_vectors.controller.js'
import { authMiddleware } from '../../middleware/auth.middleware.js'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: BookFeatureVectors
 *   description: Quản lý book_feature_vectors
 */


/**
 * @swagger
 * /book_feature_vectors:
 *   get:
 *     tags: [BookFeatureVectors]
 *     summary: Lấy danh sách book_feature_vectors
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
 *     tags: [BookFeatureVectors]
 *     summary: Tạo book_feature_vectors mới
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
 *               category_vector:
 *                 type: object
 *               author_vector:
 *                 type: object
 *               format_vector:
 *                 type: object
 *               combined_vector:
 *                 type: object
 */
router.get('/', authMiddleware, getAll)
router.post('/', authMiddleware, create)

/**
 * @swagger
 * /book_feature_vectors/{id}:
 *   get:
 *     tags: [BookFeatureVectors]
 *     summary: Lấy book_feature_vectors theo ID
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
 *     tags: [BookFeatureVectors]
 *     summary: Cập nhật book_feature_vectors
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
 *               category_vector:
 *                 type: object
 *               author_vector:
 *                 type: object
 *               format_vector:
 *                 type: object
 *               combined_vector:
 *                 type: object
 *   delete:
 *     tags: [BookFeatureVectors]
 *     summary: Xóa book_feature_vectors
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
