import { BooksRepository } from './books.repository.js'

const repo = new BooksRepository()

export class BooksService {
  async getAll(query) {
    return repo.findAll(query)
  }

  async getById(id) {
    const item = await repo.findById(id)
    if (!item) {
      const err = new Error('Không tìm thấy books')
      err.status = 404
      throw err
    }
    return item
  }

  async create(data) {
    return repo.create(data)
  }

  async update(id, data) {
    await this.getById(id) // throws 404 if not found
    return repo.update(id, data)
  }

  async delete(id) {
    await this.getById(id)
    return repo.delete(id)
  }

  async getFeaturedBooks(limit) {
    return repo.findFeatured({ limit })
  }

  async getNewBooks(limit) {
    return repo.findNew({ limit })
  }

  async getBestsellerBooks(limit) {
    return repo.findBestsellers({ limit })
  }

  async getBookDetails(id) {
    const item = await repo.findDetails(id)
    if (!item) {
      const err = new Error('Không tìm thấy books')
      err.status = 404
      throw err
    }
    return item
  }

  async searchAdvanced(filters) {
    return repo.searchAdvanced(filters)
  }

}
