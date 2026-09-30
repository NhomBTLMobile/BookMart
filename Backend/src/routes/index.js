import { Router } from 'express'
import authorsRouter from '../modules/authors/authors.route.js'
import bookAuthorsRouter from '../modules/book_authors/book_authors.route.js'
import bookCategoriesRouter from '../modules/book_categories/book_categories.route.js'
import bookFeatureVectorsRouter from '../modules/book_feature_vectors/book_feature_vectors.route.js'
import bookImagesRouter from '../modules/book_images/book_images.route.js'
import booksRouter from '../modules/books/books.route.js'
import cartItemsRouter from '../modules/cart_items/cart_items.route.js'
import categoriesRouter from '../modules/categories/categories.route.js'
import comboBooksRouter from '../modules/combo_books/combo_books.route.js'
import combosRouter from '../modules/combos/combos.route.js'
import loyaltyPointsLedgerRouter from '../modules/loyalty_points_ledger/loyalty_points_ledger.route.js'
import orderItemsRouter from '../modules/order_items/order_items.route.js'
import ordersRouter from '../modules/orders/orders.route.js'
import paymentsRouter from '../modules/payments/payments.route.js'
import publishersRouter from '../modules/publishers/publishers.route.js'
import reviewsRouter from '../modules/reviews/reviews.route.js'
import shippingOrdersRouter from '../modules/shipping_orders/shipping_orders.route.js'
import userAddressesRouter from '../modules/user_addresses/user_addresses.route.js'
import userOauthProvidersRouter from '../modules/user_oauth_providers/user_oauth_providers.route.js'
import userVouchersRouter from '../modules/user_vouchers/user_vouchers.route.js'
import usersRouter from '../modules/users/users.route.js'
import vouchersRouter from '../modules/vouchers/vouchers.route.js'
import dashboardRouter from '../modules/dashboard/dashboard.route.js'

const router = Router()

router.use('/dashboard', dashboardRouter)
router.use('/authors', authorsRouter)
router.use('/book_authors', bookAuthorsRouter)
router.use('/book_categories', bookCategoriesRouter)
router.use('/book_feature_vectors', bookFeatureVectorsRouter)
router.use('/book_images', bookImagesRouter)
router.use('/books', booksRouter)
router.use('/cart_items', cartItemsRouter)
router.use('/categories', categoriesRouter)
router.use('/combo_books', comboBooksRouter)
router.use('/combos', combosRouter)
router.use('/loyalty_points_ledger', loyaltyPointsLedgerRouter)
router.use('/order_items', orderItemsRouter)
router.use('/orders', ordersRouter)
router.use('/payments', paymentsRouter)
router.use('/publishers', publishersRouter)
router.use('/reviews', reviewsRouter)
router.use('/shipping_orders', shippingOrdersRouter)
router.use('/user_addresses', userAddressesRouter)
router.use('/user_oauth_providers', userOauthProvidersRouter)
router.use('/user_vouchers', userVouchersRouter)
router.use('/users', usersRouter)
router.use('/vouchers', vouchersRouter)

export default router
