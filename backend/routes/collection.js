const express = require('express')
const router = express.Router()

const { newCollection, getCatalog, getCollections, getCollectionById, deleteCollection, updateCollection } = require('../controllers/collectionController')

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth')

router.route('/collections').get(getCollections)
router.route('/collection/catalog').get(getCatalog)
router.route('/collection/:id').get(getCollectionById)
router.route('/admin/collection/new').post(isAuthenticatedUser, authorizeRoles('admin'), newCollection)
router.route('/admin/collection/:id')
                            .put(isAuthenticatedUser, authorizeRoles('admin'), updateCollection)
                            .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteCollection)

module.exports = router