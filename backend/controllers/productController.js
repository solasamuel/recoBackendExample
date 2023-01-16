const Product = require('../models/product')
const crypto = require('crypto')
const ErrorHandler = require('../utils/errorHandler')
const catchAsyncErrors = require('../middlewares/catchAsyncErrors')
// const { cloudinary } = require('../utils/cloudinary')
const APIFeatures = require('../utils/apiFeatures')

// create new product => /api/v1/product/new
exports.newProduct = catchAsyncErrors(async (req, res, next) => {
    try {
        let images = []

        if (typeof req.body.images === 'string') {
            images.push(req.body.images)
        } else {
            images = req.body.images
        }

        let imagesLinks = []

        for (let i = 0; i < images.length; i++) {

            // upload media
            // const result = await cloudinary.uploader.upload(images[i], {
            //     folder: 'products'
            // })

            // push image to memory
            // imagesLinks.push({
            //     public_id: result.public_id,
            //     url: result.secure_url
            // })
        }

        req.body.images = imagesLinks
        req.body.user = req.user.id

        // create alias to track various colorways
        req.body.alias = crypto.createHash('md5').update(req.body.name).digest('hex')


        const product = await Product.create(req.body);
        res.status(201).json({
            success: true,
            product
        })
    } catch (error) {
        console.log(error);
    }
})

// get products => /api/v1 / products ? keyword = test
exports.getProducts = catchAsyncErrors(async (req, res, next) => {

    const resPerPage = 10 // products per page

    const apiFeatures = new APIFeatures(Product.find(), req.query)
        .search()
        .filter()
    //.pagination(resPerPage)

    let products = await apiFeatures.query

    let uniqueAliases = new Set()

    for (const product of products) {
        uniqueAliases.add(product.alias)
    }

    let uniqueProducts = []

    for (const alias of uniqueAliases) {
        const product = await Product.findOne({ alias: alias })
        if (product) {
            uniqueProducts.push(product)
        }
    }

    products = uniqueProducts

    const productCount = products.length

    res.status(200).json({
        success: true,
        productCount,
        products,
    })


})

exports.getAllProducts = catchAsyncErrors(async (req, res, next) => {
    const products = await Product.find();
    const productCount = products.length
    res.status(201).json({
        success: true,
        productCount,
        products
    })
})

// get single product by id   => /api/v1/product/:id
exports.getProductById = catchAsyncErrors(async (req, res, next) => {

    const product = await Product.findById(req.params.id)

    if (!product) {
        return next(new ErrorHandler('Product not Found', 404))
    }

    res.status(200).json({
        success: true,
        product
    })
})


// get products related by alias   => /api/v1/product/variations/:alias
exports.getProductDetailsAndVariationsById = catchAsyncErrors(async (req, res, next) => {

    const product = await Product.findById(req.params.id)

    const variations = await Product.find({ alias: product.alias })

    if (!product) {
        return next(new ErrorHandler('Product not found', 404))
    }

    res.status(200).json({
        success: true,
        variations,
        product
    })
})

// update product   =>    /api/v1/product/:id
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {

    let product = await Product.findById(req.params.id)

    if (!product) {
        return next(new ErrorHandler('Product not Found', 404))
    }

    try {
        let images = []

        if (typeof req.body.images === 'string') {
            images.push(req.body.images)
        } else {
            images = req.body.images
        }

        if (images && images.length > 0) {
            // console.log('Images exist')

            // console.log(images)
            // Deleting associated images on cloudinary
            for (let i = 0; i < product.images.length; i++) {
                // const result = await cloudinary.uploader.destroy(product.images[i].public_id)
            }

            let imagesLinks = []

            for (let i = 0; i < images.length; i++) {
                // upload media
                // const result = await cloudinary.uploader.upload(images[i], {
                //     folder: 'products'
                // })

                // push image to memory
                // imagesLinks.push({
                //     public_id: result.public_id,
                //     url: result.secure_url
                // })
            }

            req.body.images = imagesLinks
        } else { // logic to retain former images if there are none
            // console.log('Images do not exist in this product update!')
            let oldVersion = await Product.findById(req.params.id)
            req.body.images = oldVersion.images
        }

        var productData = {
            name: req.body.name,
            color: req.body.color,
            alias: crypto.createHash('md5').update(req.body.name).digest('hex'),
            price: req.body.price,
            brandCollection: req.body.brandCollection,
            images: req.body.images,
            category: req.body.category,
            user: req.body.user,
            stockSizes: {
                XXS : req.body.XXS,
                XS : req.body.XS,
                S : req.body.S,
                M : req.body.M,
                L : req.body.L,
                XL : req.body.XL,
                XXL : req.body.XXL,
                XXXL : req.body.XXXL,
                XXXXL : req.body.XXXXL,
                ONESIZE : req.body.ONESIZE,
            },
            totalStock: req.body.totalStock,
        }

        console.log(productData);

        product = await Product.findByIdAndUpdate(req.params.id, productData, {
            new: true,
            runValidators: true,
            useFindAndNotify: false,
        })

        res.status(200).json({
            success: true,
            product
        })
    } catch (error) {
        console.log(error);
    }
})

// deleteProduct   =>    /api/v1/product/:id
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {

    let product = await Product.findById(req.params.id)

    if (!product) {
        return next(new ErrorHandler('Product not Found', 404))
    }

    // // Deleting associated images on cloudinary
    // for (let i = 0; i < product.images.length; i++) {
    //     const result = await cloudinary.uploader.destroy(product.images[i].public_id)
    // }

    await product.remove()

    res.status(200).json({
        success: true,
        message: 'Product is deleted'
    })
})