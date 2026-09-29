import { Router } from 'express'
import { getAll, getById, create, update, remove } from './user_oauth_providers.controller.js'
import { authMiddleware } from '../../middleware/auth.middleware.js'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: UserOauthProviders
 *   description: Quản lý user_oauth_providers
 */


/**
 * @swagger
 * /user_oauth_providers:
 *   get:
 *     tags: [UserOauthProviders]
 *     summary: Lấy danh sách user_oauth_providers
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
 *     tags: [UserOauthProviders]
 *     summary: Tạo user_oauth_providers mới
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
 *               provider:
 *                 type: string
 *               provider_uid:
 *                 type: string
 *               access_token:
 *                 type: string
 */
router.get('/', authMiddleware, getAll)
router.post('/', authMiddleware, create)

/**
 * @swagger
 * /user_oauth_providers/{id}:
 *   get:
 *     tags: [UserOauthProviders]
 *     summary: Lấy user_oauth_providers theo ID
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
 *     tags: [UserOauthProviders]
 *     summary: Cập nhật user_oauth_providers
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
 *               provider:
 *                 type: string
 *               provider_uid:
 *                 type: string
 *               access_token:
 *                 type: string
 *   delete:
 *     tags: [UserOauthProviders]
 *     summary: Xóa user_oauth_providers
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
