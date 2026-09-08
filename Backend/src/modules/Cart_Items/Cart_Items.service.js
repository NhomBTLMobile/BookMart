import { Cart_ItemsRepository } from './Cart_Items.repository.js'

const repo = new Cart_ItemsRepository()

export class Cart_ItemsService {
  async getAll(query) {
    return repo.findAll(query)
  }

  async getById(id) {
    const item = await repo.findById(id)
    if (!item) {
      const err = new Error('Không tìm thấy Cart_Items')
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

}
