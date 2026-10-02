import { Router } from 'express'
import { getMyWishlist, toggleWishlist } from './wishlists.controller.js'
import { authMiddleware } from '../../middleware/auth.middleware.js'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Wishlists
 *   description: Quản lý sách yêu thích
 */

/**
 * @swagger
 * /wishlists:
 *   get:
 *     tags: [Wishlists]
 *     summary: Lấy danh sách sách yêu thích của user
 *     responses:
 *       200:
 *         description: Thành công
 *   post:
 *     tags: [Wishlists]
 *     summary: Thêm hoặc xóa sách khỏi wishlist (Toggle)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               book_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/', authMiddleware, getMyWishlist)
router.post('/', authMiddleware, toggleWishlist)

export default router
