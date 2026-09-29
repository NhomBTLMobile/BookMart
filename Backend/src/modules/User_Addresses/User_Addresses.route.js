import { Router } from 'express'
import { getAll, getById, create, update, remove } from './user_addresses.controller.js'
import { authMiddleware } from '../../middleware/auth.middleware.js'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: UserAddresses
 *   description: Quản lý user_addresses
 */


/**
 * @swagger
 * /user_addresses:
 *   get:
 *     tags: [UserAddresses]
 *     summary: Lấy danh sách user_addresses
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
 *     tags: [UserAddresses]
 *     summary: Tạo user_addresses mới
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
 *               label:
 *                 type: string
 *               recipient_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               province_id:
 *                 type: integer
 *               province_name:
 *                 type: string
 *               district_id:
 *                 type: integer
 *               district_name:
 *                 type: string
 *               ward_code:
 *                 type: string
 *               ward_name:
 *                 type: string
 *               street_address:
 *                 type: string
 *               is_default:
 *                 type: boolean
 */
router.get('/', authMiddleware, getAll)
router.post('/', authMiddleware, create)

/**
 * @swagger
 * /user_addresses/{id}:
 *   get:
 *     tags: [UserAddresses]
 *     summary: Lấy user_addresses theo ID
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
 *     tags: [UserAddresses]
 *     summary: Cập nhật user_addresses
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
 *               label:
 *                 type: string
 *               recipient_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               province_id:
 *                 type: integer
 *               province_name:
 *                 type: string
 *               district_id:
 *                 type: integer
 *               district_name:
 *                 type: string
 *               ward_code:
 *                 type: string
 *               ward_name:
 *                 type: string
 *               street_address:
 *                 type: string
 *               is_default:
 *                 type: boolean
 *   delete:
 *     tags: [UserAddresses]
 *     summary: Xóa user_addresses
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
