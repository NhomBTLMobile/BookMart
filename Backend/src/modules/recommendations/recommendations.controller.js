import { RecommendationsService } from './recommendations.service.js'
import { sendSuccess } from '../../utils/response.js'

const service = new RecommendationsService()

/**
 * Lấy danh sách các sách tương tự (Gợi ý sản phẩm cho chi tiết sách)
 */
export const getSimilarBooks = async (req, res, next) => {
  try {
    const bookId = req.params.bookId
    const limit = parseInt(req.query.limit) || 10
    const data = await service.getSimilarBooks(bookId, limit)
    sendSuccess(res, 'Lấy danh sách sách gợi ý thành công', data)
  } catch (err) { 
    next(err) 
  }
}

/**
 * Endpoint admin: Tự động chạy lại thuật toán tạo Vectors cho tất cả sách
 */
export const generateVectors = async (req, res, next) => {
  try {
    const data = await service.generateAllVectors()
    sendSuccess(res, 'Tạo vectors thành công', data)
  } catch (err) { 
    next(err) 
  }
}
