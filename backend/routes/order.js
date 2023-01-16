const express = require('express')
const router = express.Router()

const { newOrder, getBuyerOrders, getOrderById, myOrders, allOrders, updateOrder, deleteOrder } = require('../controllers/orderController')

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth')

router.route('/order/new').post(newOrder)
router.route('/orders/:buyer').get(getBuyerOrders)
router.route('/order/:id').get(isAuthenticatedUser, getOrderById)
// router.route('/orders/me').get(isAuthenticatedUser, myOrders)
router.route('/admin/orders').get(isAuthenticatedUser, authorizeRoles('admin'), allOrders)
router.route('/admin/order/:id')
    .put(isAuthenticatedUser, authorizeRoles('admin'), updateOrder)
    .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteOrder)

module.exports = router