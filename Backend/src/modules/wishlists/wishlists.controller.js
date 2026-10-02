import { WishlistsService } from './wishlists.service.js'
import { sendSuccess, sendError } from '../../utils/response.js'

const service = new WishlistsService()

export const getMyWishlist = async (req, res, next) => {
  try {
    const data = await service.getByUserId(req.user.id)
    sendSuccess(res, 'Lấy danh sách yêu thích thành công', data)
  } catch (err) { next(err) }
}

export const toggleWishlist = async (req, res, next) => {
  try {
    const { book_id } = req.body
    if (!book_id) return sendError(res, 'Thiếu book_id', 400)
    
    const result = await service.toggle(req.user.id, book_id)
    sendSuccess(res, result.message, result.data)
  } catch (err) { next(err) }
}
