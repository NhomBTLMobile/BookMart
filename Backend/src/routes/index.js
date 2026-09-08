import { Router } from 'express'
import AuthorsRouter from '../modules/Authors/Authors.route.js'
import Book_AuthorsRouter from '../modules/Book_Authors/Book_Authors.route.js'
import Book_CategoriesRouter from '../modules/Book_Categories/Book_Categories.route.js'
import Book_ImagesRouter from '../modules/Book_Images/Book_Images.route.js'
import BooksRouter from '../modules/Books/Books.route.js'
import Cart_ItemsRouter from '../modules/Cart_Items/Cart_Items.route.js'
import CartsRouter from '../modules/Carts/Carts.route.js'
import CategoriesRouter from '../modules/Categories/Categories.route.js'
import Order_ItemsRouter from '../modules/Order_Items/Order_Items.route.js'
import OrdersRouter from '../modules/Orders/Orders.route.js'
import ReviewsRouter from '../modules/Reviews/Reviews.route.js'
import User_AddressesRouter from '../modules/User_Addresses/User_Addresses.route.js'
import UsersRouter from '../modules/Users/Users.route.js'
import VouchersRouter from '../modules/Vouchers/Vouchers.route.js'
import WishlistsRouter from '../modules/Wishlists/Wishlists.route.js'

const router = Router()

router.use('/Authors', AuthorsRouter)
router.use('/Book_Authors', Book_AuthorsRouter)
router.use('/Book_Categories', Book_CategoriesRouter)
router.use('/Book_Images', Book_ImagesRouter)
router.use('/Books', BooksRouter)
router.use('/Cart_Items', Cart_ItemsRouter)
router.use('/Carts', CartsRouter)
router.use('/Categories', CategoriesRouter)
router.use('/Order_Items', Order_ItemsRouter)
router.use('/Orders', OrdersRouter)
router.use('/Reviews', ReviewsRouter)
router.use('/User_Addresses', User_AddressesRouter)
router.use('/Users', UsersRouter)
router.use('/Vouchers', VouchersRouter)
router.use('/Wishlists', WishlistsRouter)

export default router
