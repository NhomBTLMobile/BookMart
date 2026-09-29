import Books from '../modules/books/books.model.js'
import BookImages from '../modules/book_images/book_images.model.js'
import Authors from '../modules/authors/authors.model.js'
import BookAuthors from '../modules/book_authors/book_authors.model.js'
import Categories from '../modules/categories/categories.model.js'
import BookCategories from '../modules/book_categories/book_categories.model.js'
import Publishers from '../modules/publishers/publishers.model.js'

export function setupAssociations() {
  // Books & BookImages (1-N)
  Books.hasMany(BookImages, { foreignKey: 'book_id', as: 'images' })
  BookImages.belongsTo(Books, { foreignKey: 'book_id' })

  // Books & Authors (N-N)
  Books.belongsToMany(Authors, {
    through: BookAuthors,
    foreignKey: 'book_id',
    otherKey: 'author_id',
    as: 'authors'
  })
  Authors.belongsToMany(Books, {
    through: BookAuthors,
    foreignKey: 'author_id',
    otherKey: 'book_id',
    as: 'books'
  })

  // Books & Categories (N-N)
  Books.belongsToMany(Categories, {
    through: BookCategories,
    foreignKey: 'book_id',
    otherKey: 'category_id',
    as: 'categories'
  })
  Categories.belongsToMany(Books, {
    through: BookCategories,
    foreignKey: 'category_id',
    otherKey: 'book_id',
    as: 'books'
  })

  // Books & Publishers (1-N)
  Publishers.hasMany(Books, { foreignKey: 'publisher_id', as: 'books' })
  Books.belongsTo(Publishers, { foreignKey: 'publisher_id', as: 'publisher' })
}
