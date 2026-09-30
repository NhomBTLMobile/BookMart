import * as dashboardService from './dashboard.service.js'
import { logger } from '../../utils/logger.js'

export const getStats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getStats()
    res.json({ success: true, data: stats })
  } catch (error) {
    logger.error('Error in getStats: ' + error.message)
    next(error)
  }
}

export const getRevenueChart = async (req, res, next) => {
  try {
    const data = await dashboardService.getRevenueChart()
    res.json({ success: true, data })
  } catch (error) {
    logger.error('Error in getRevenueChart: ' + error.message)
    next(error)
  }
}

export const getTopBooks = async (req, res, next) => {
  try {
    const data = await dashboardService.getTopBooks()
    res.json({ success: true, data })
  } catch (error) {
    logger.error('Error in getTopBooks: ' + error.message)
    next(error)
  }
}

export const getRecentOrders = async (req, res, next) => {
  try {
    const data = await dashboardService.getRecentOrders()
    res.json({ success: true, data })
  } catch (error) {
    logger.error('Error in getRecentOrders: ' + error.message)
    next(error)
  }
}
