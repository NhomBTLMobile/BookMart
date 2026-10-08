import * as dashboardService from './dashboard.service.js'
import { logger } from '../../utils/logger.js'

export const getStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query
    const stats = await dashboardService.getStats({ startDate, endDate })
    res.json({ success: true, data: stats })
  } catch (error) {
    logger.error('Error in getStats: ' + error.message)
    next(error)
  }
}

export const getRevenueChart = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query
    const data = await dashboardService.getRevenueChart({ startDate, endDate })
    res.json({ success: true, data })
  } catch (error) {
    logger.error('Error in getRevenueChart: ' + error.message)
    next(error)
  }
}

export const getTopBooks = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query
    const data = await dashboardService.getTopBooks({ startDate, endDate })
    res.json({ success: true, data })
  } catch (error) {
    logger.error('Error in getTopBooks: ' + error.message)
    next(error)
  }
}

export const getRecentOrders = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query
    const data = await dashboardService.getRecentOrders({ startDate, endDate })
    res.json({ success: true, data })
  } catch (error) {
    logger.error('Error in getRecentOrders: ' + error.message)
    next(error)
  }
}

export const getExportData = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query
    const data = await dashboardService.getExportReportData({ startDate, endDate })
    res.json({ success: true, data })
  } catch (error) {
    logger.error('Error in getExportData: ' + error.message)
    next(error)
  }
}
