import { Router } from 'express'
import { getSimilarBooks, generateVectors } from './recommendations.controller.js'
import { authMiddleware, requireRole } from '../../middleware/auth.middleware.js'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Recommendations
 *   description: API Gợi ý sản phẩm (Machine Learning)
 */

/**
 * @swagger
 * /recommendations/books/{bookId}/similar:
 *   get:
 *     tags: [Recommendations]
 *     summary: Gợi ý sách tương tự dựa trên Content-Based Filtering (Cosine Similarity)
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/books/:bookId/similar', getSimilarBooks)

/**
 * @swagger
 * /recommendations/admin/generate-vectors:
 *   post:
 *     tags: [Recommendations]
 *     summary: Chạy thuật toán tạo Feature Vectors cho tất cả sách (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 */
router.post('/admin/generate-vectors', authMiddleware, requireRole('admin'), generateVectors)

export default router
