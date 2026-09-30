import { Router } from 'express'
import * as dashboardController from './dashboard.controller.js'
// import { authMiddleware, adminMiddleware } from '../../middleware/auth.middleware.js' // Assuming these exist, but for now we might skip or use if they are available

const router = Router()

// router.use(authMiddleware, adminMiddleware) // Enable if auth is required for admin

router.get('/stats', dashboardController.getStats)
router.get('/revenue-chart', dashboardController.getRevenueChart)
router.get('/top-books', dashboardController.getTopBooks)
router.get('/recent-orders', dashboardController.getRecentOrders)

export default router
