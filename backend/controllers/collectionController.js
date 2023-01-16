const Collection = require('../models/collection')
const Product = require('../models/product')
const ErrorHandler = require('../utils/errorHandler')
const catchAsyncErrors = require('../middlewares/catchAsyncErrors')
const { cloudinary } = require('../utils/cloudinary')

// create new collection => /api/v1/collection/new
exports.newCollection = catchAsyncErrors(async (req, res, next) => {

    if (req.body.wideAsset === undefined || req.body.mobileAsset === undefined) {
        return next(new ErrorHandler('Upload at least two images(wide and thin in that order).', 400))
    }

    try {
        let mediaLinks = []

        let wideAssetResult;

        if (req.body.wideAssetFormat === "Image") {
            wideAssetResult = await cloudinary.uploader.upload(req.body.wideAsset, {
                folder: 'collections'
            })
        } else {
            wideAssetResult = await cloudinary.uploader.upload(req.body.wideAsset, {
                folder: 'collections',
                resource_type: "video",
                chunk_size: 6000000,
                timeout: 1200000
            })
        }

        mediaLinks.push({
            public_id: wideAssetResult.public_id,
            url: wideAssetResult.secure_url,
            format: req.body.wideAssetFormat,
        })

        let mobileAssetResult;

        if (req.body.mobileAssetFormat === "Image") {
            mobileAssetResult = await cloudinary.uploader.upload(req.body.mobileAsset, {
                folder: 'collections'
            })
        } else {
            mobileAssetResult = await cloudinary.uploader.upload(req.body.mobileAsset, {
                folder: 'collections',
                resource_type: "video",
                chunk_size: 6000000,
                timeout: 1200000
            })
        }

        mediaLinks.push({
            public_id: mobileAssetResult.public_id,
            url: mobileAssetResult.secure_url,
            format: req.body.mobileAssetFormat
        })

        req.body.media = mediaLinks
        req.body.user = req.user.id



        if (req.body.isMain) {
            await setAllCollectionsToStandard();
        }

        const collection = await Collection.create(req.body);

        // console.log(mainCollection)

        res.status(201).json({
            success: true,
            collection
        });
    } catch (error) {
        console.log(error);
    }
})

const setAllCollectionsToStandard = async () => {

    const currentMain = await Collection.find({ isMain: true });


    // set all already existing collections to standard collection
    currentMain.forEach(async (item) => {
        item.isMain = false;

        const collection = await Collection.findByIdAndUpdate(item._id.toString(), item, {
            new: true,
            runValidators: true,
            useFindAndNotify: false,
        })
    })
}

// get collections => /api/v1/collections?keyword=test
exports.getCollections = catchAsyncErrors(async (req, res, next) => {

    const collections = await Collection.find()

    //const resPerPage = 10 // collections per page

    // const apiFeatures = new APIFeatures(Collection.find(), req.query)
    //     .search()
    //     .filter()
    //     //.pagination(resPerPage)

    // let collections = await apiFeatures.query

    // let uniqueAliases = new Set()

    // for (const collection of collections) {
    //     uniqueAliases.add(collection.alias)
    // }

    // let uniqueCollections = []

    // for (const alias of uniqueAliases) {
    //     const collection = await Collection.findOne({ alias: alias })
    //     if (collection) {
    //         uniqueCollections.push(collection)
    //     }
    // }

    // collections = uniqueCollections

    const collectionCount = collections.length

    res.status(200).json({
        success: true,
        collectionCount,
        collections,
    })
})

// get single collection by id   => /api/v1/collection/:id
exports.getCollectionById = catchAsyncErrors(async (req, res, next) => {

    const collection = await Collection.findById(req.params.id)

    if (!collection) {
        return next(new ErrorHandler('Collection not Found', 404))
    }

    res.status(200).json({
        success: true,
        collection
    })
})

// update collection   =>    /api/v1/collection/:id
exports.updateCollection = catchAsyncErrors(async (req, res, next) => {

    let collection = await Collection.findById(req.params.id)

    if (!collection) {
        return next(new ErrorHandler('Collection not Found', 404))
    }

    if (req.body.isMain === true) await setAllCollectionsToStandard();

    let oldVersion = await Collection.findById(req.params.id)
    let newVersion = {
        name: req.body.name,
        description: req.body.description,
        media: [
            {
                format: ''
            },
            {
                format: ''
            }],
        isMain: req.body.isMain
    }
    // req.body.media = oldVersion.media

    try {
        // for wide asset
        if (req.body.wideAsset !== oldVersion.media[0].url) { // check if request contains a new wide asset
            let wideAssetResult;
            // Deleting associated media on cloudinary
            wideAssetResult = await cloudinary.uploader.destroy(collection.media[0].public_id)


            // upload new media
            wideAssetResult = await cloudinary.uploader.upload(req.body.wideAsset, {
                folder: 'collections'
            })

            newVersion.media[0].format = req.body.wideAssetFormat;
            newVersion.media[0].public_id = wideAssetResult.public_id;
            newVersion.media[0].url = wideAssetResult.secure_url;

        } else { // logic to retain former media if there are none
            newVersion.media[0] = oldVersion.media[0];
        }

        // for mobile asset
        if (req.body.mobileAsset !== oldVersion.media[1].url) { // check if request contains a new wide asset
            let mobileAssetResult;
            // Deleting associated media on cloudinary
            mobileAssetResult = await cloudinary.uploader.destroy(collection.media[1].public_id)


            // upload new media
            mobileAssetResult = await cloudinary.uploader.upload(req.body.mobileAsset, {
                folder: 'collections'
            })

            newVersion.media[1].format = req.body.mobileAssetFormat;
            newVersion.media[1].public_id = mobileAssetResult.public_id;
            newVersion.media[1].url = mobileAssetResult.secure_url;

        } else { // logic to retain former media if there are none
            newVersion.media[1] = oldVersion.media[1];
        }

        collection = await Collection.findByIdAndUpdate(req.params.id, newVersion, {
            new: true,
            runValidators: true,
            useFindAndNotify: false,
        })

        res.status(200).json({
            success: true,
            collection
        })
    } catch (error) {
        console.log(error)
    }
})

// deleteCollection   =>    /api/v1/collection/:id
exports.deleteCollection = catchAsyncErrors(async (req, res, next) => {

    let collection = await Collection.findById(req.params.id)

    if (!collection) {
        return next(new ErrorHandler('Collection not Found', 404))
    }

    // Deleting associated media on cloudinary
    for (let i = 0; i < collection.media.length; i++) {
        const result = await cloudinary.uploader.destroy(collection.media[i].public_id);
    }

    await collection.remove()

    res.status(200).json({
        success: true,
        message: 'Collection is deleted'
    })
})



// get catalog => /api/v1/collection/catalog
exports.getCatalog = catchAsyncErrors(async (req, res, next) => {
    const mainCollection = await Collection.find({ isMain: `true` });
    const mainCollectionProducts = await Product.find({});

    const mainCollectionProductCount = mainCollectionProducts.length;

    res.status(200).json({
        success: true,
        mainCollection,
        mainCollectionProducts,
        mainCollectionProductCount
    })
})