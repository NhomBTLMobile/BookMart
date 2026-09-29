import { Router } from 'express'
import { getAll, getById, create, update, remove, getFeaturedBooks, getNewBooks, getBestsellerBooks, getBookDetails, searchBooks } from './books.controller.js'
import { authMiddleware, requireRole } from '../../middleware/auth.middleware.js'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: Quản lý books
 */

/**
 * @swagger
 * /books/home/featured:
 *   get:
 *     tags: [Books]
 *     summary: Lấy danh sách sách nổi bật
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/home/featured', getFeaturedBooks)

/**
 * @swagger
 * /books/home/new:
 *   get:
 *     tags: [Books]
 *     summary: Lấy danh sách sách mới
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/home/new', getNewBooks)

/**
 * @swagger
 * /books/home/bestsellers:
 *   get:
 *     tags: [Books]
 *     summary: Lấy danh sách sách bán chạy
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/home/bestsellers', getBestsellerBooks)

/**
 * @swagger
 * /books/search/advanced:
 *   get:
 *     tags: [Books]
 *     summary: Tìm kiếm và lọc sách
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/search/advanced', searchBooks)

/**
 * @swagger
 * /books/{id}/details:
 *   get:
 *     tags: [Books]
 *     summary: Lấy chi tiết sách đầy đủ
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/:id/details', getBookDetails)

/**
 * @swagger
 * /books:
 *   get:
 *     tags: [Books]
 *     summary: Lấy danh sách books
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
 *     tags: [Books]
 *     summary: Tạo books mới (Chỉ Admin/Staff)
 *     security:
 *       - bearerAuth: []
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
 *               title:
 *                 type: string
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *               publisher_id:
 *                 type: integer
 *               format:
 *                 type: string
 *               isbn:
 *                 type: string
 *               barcode:
 *                 type: string
 *               warehouse_location:
 *                 type: string
 *               stock_qty:
 *                 type: integer
 *               original_price:
 *                 type: number
 *               sale_price:
 *                 type: number
 *               sold_count:
 *                 type: integer
 *               weight_grams:
 *                 type: integer
 *               length_cm:
 *                 type: integer
 *               width_cm:
 *                 type: integer
 *               height_cm:
 *                 type: integer
 *               copyright_holder:
 *                 type: string
 *               license_end_date:
 *                 type: string
 *               avg_rating:
 *                 type: number
 *               review_count:
 *                 type: integer
 *               is_active:
 *                 type: boolean
 */
router.get('/', getAll)
router.post('/', authMiddleware, requireRole('admin', 'staff'), create)

/**
 * @swagger
 * /books/{id}:
 *   get:
 *     tags: [Books]
 *     summary: Lấy books theo ID
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
 *     tags: [Books]
 *     summary: Cập nhật books (Chỉ Admin/Staff)
 *     security:
 *       - bearerAuth: []
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
 *               title:
 *                 type: string
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *               publisher_id:
 *                 type: integer
 *               format:
 *                 type: string
 *               isbn:
 *                 type: string
 *               barcode:
 *                 type: string
 *               warehouse_location:
 *                 type: string
 *               stock_qty:
 *                 type: integer
 *               original_price:
 *                 type: number
 *               sale_price:
 *                 type: number
 *               sold_count:
 *                 type: integer
 *               weight_grams:
 *                 type: integer
 *               length_cm:
 *                 type: integer
 *               width_cm:
 *                 type: integer
 *               height_cm:
 *                 type: integer
 *               copyright_holder:
 *                 type: string
 *               license_end_date:
 *                 type: string
 *               avg_rating:
 *                 type: number
 *               review_count:
 *                 type: integer
 *               is_active:
 *                 type: boolean
 *   delete:
 *     tags: [Books]
 *     summary: Xóa books (Chỉ Admin/Staff)
 *     security:
 *       - bearerAuth: []
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
router.get('/:id', getById)
router.put('/:id', authMiddleware, requireRole('admin', 'staff'), update)
router.delete('/:id', authMiddleware, requireRole('admin', 'staff'), remove)

export default router
