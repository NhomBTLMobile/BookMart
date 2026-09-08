import { Router } from 'express'
import { getAll, getById, create, update, remove } from './User_Addresses.controller.js'
import { authMiddleware } from '../../middleware/auth.middleware.js'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: User_Addresses
 *   description: Quản lý User_Addresses
 */


/**
 * @swagger
 * /User_Addresses:
 *   get:
 *     tags: [User_Addresses]
 *     summary: Lấy danh sách User_Addresses
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
 *     tags: [User_Addresses]
 *     summary: Tạo User_Addresses mới
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
 *               receiver_name:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               address_detail:
 *                 type: string
 *               is_default:
 *                 type: boolean
 */
router.get('/', authMiddleware, getAll)
router.post('/', authMiddleware, create)

/**
 * @swagger
 * /User_Addresses/{id}:
 *   get:
 *     tags: [User_Addresses]
 *     summary: Lấy User_Addresses theo ID
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
 *     tags: [User_Addresses]
 *     summary: Cập nhật User_Addresses
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
 *               receiver_name:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               address_detail:
 *                 type: string
 *               is_default:
 *                 type: boolean
 *   delete:
 *     tags: [User_Addresses]
 *     summary: Xóa User_Addresses
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
