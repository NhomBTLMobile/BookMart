import { WishlistsRepository } from './wishlists.repository.js'

const repo = new WishlistsRepository()

export class WishlistsService {
  async getByUserId(userId) {
    return repo.findByUserId(userId)
  }

  async toggle(userId, bookId) {
    const exists = await repo.checkExists(userId, bookId)
    
    if (exists) {
      await repo.remove(userId, bookId)
      return { message: 'Đã xóa khỏi danh sách yêu thích', data: { is_liked: false } }
    } else {
      await repo.add(userId, bookId)
      return { message: 'Đã thêm vào danh sách yêu thích', data: { is_liked: true } }
    }
  }
}
