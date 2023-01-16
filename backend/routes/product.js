const express = require('express')
const router = express.Router()

const { 
    getProducts,
    getAllProducts,
    getProductById,
    newProduct,
    updateProduct,
    deleteProduct,
    getProductDetailsAndVariationsById
} = require('../controllers/productController')

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth')

router.route('/products').get(getProducts);

router.route('/products/all').get(getAllProducts);

router.route('/product/:id').get(getProductById);

router.route('/product/variations/:id').get(getProductDetailsAndVariationsById);

router.route('/admin/product/new').post(isAuthenticatedUser, authorizeRoles('admin'), newProduct);

router.route('/admin/product/:id')
                                .put(isAuthenticatedUser, authorizeRoles('admin'), updateProduct)
                                .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteProduct);

module.exports = router