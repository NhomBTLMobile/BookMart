import { Router } from 'express'
import { getAll, getById, create, update, remove } from './loyalty_points_ledger.controller.js'
import { authMiddleware } from '../../middleware/auth.middleware.js'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: LoyaltyPointsLedger
 *   description: Quản lý loyalty_points_ledger
 */


/**
 * @swagger
 * /loyalty_points_ledger:
 *   get:
 *     tags: [LoyaltyPointsLedger]
 *     summary: Lấy danh sách loyalty_points_ledger
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
 *     tags: [LoyaltyPointsLedger]
 *     summary: Tạo loyalty_points_ledger mới
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
 *               delta:
 *                 type: integer
 *               balance_after:
 *                 type: integer
 *               type:
 *                 type: string
 *               ref_id:
 *                 type: string
 */
router.get('/', authMiddleware, getAll)
router.post('/', authMiddleware, create)

/**
 * @swagger
 * /loyalty_points_ledger/{id}:
 *   get:
 *     tags: [LoyaltyPointsLedger]
 *     summary: Lấy loyalty_points_ledger theo ID
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
 *     tags: [LoyaltyPointsLedger]
 *     summary: Cập nhật loyalty_points_ledger
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
 *               delta:
 *                 type: integer
 *               balance_after:
 *                 type: integer
 *               type:
 *                 type: string
 *               ref_id:
 *                 type: string
 *   delete:
 *     tags: [LoyaltyPointsLedger]
 *     summary: Xóa loyalty_points_ledger
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
