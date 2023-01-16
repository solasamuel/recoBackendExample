const Order = require('../models/order')
const Product = require('../models/product')

const ErrorHandler = require('../utils/errorHandler')
const catchAsyncErrors = require('../middlewares/catchAsyncErrors')

// const { sendEmail } = require('../utils/sesSendEmail')

// create new order     =>    /api/v1/order/new
exports.newOrder = catchAsyncErrors(async (req, res, next) => {
    const {
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo,
        buyer
    } = req.body

    // console.log('order details:')
    // console.log('order items: ' + orderItems)
    // console.log('items price: ' + itemsPrice)
    // console.log('tax price: ' + taxPrice)
    // console.log('shipping price: ' + shippingPrice)
    // console.log('total price: ' + totalPrice)

    const order = await Order.create({
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo,
        paidAt: Date.now(),
        buyer
    })

    order.orderItems.forEach(async item => {
        await updateStock(item.product, item.quantity, item.size)
    })

    console.log('order created')

    // SEND ALERT
    emailData = {
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo,
        buyer
    }

    // try {
    //     sendEmail(function(err, data){
    //         if (err) {
    //             console.log("email send failed")
    //             return res.status(500).send({err});
    //         }
    //         else {
    //             console.log('email send successful')
    //         }
    //     }, buyer, "orderConfirmation", emailData)    
    // } catch (error) {
    //     console.error(error)
    // }

    res.status(200).json({
        success: true,
        order
    })
})

// get single order    =>    /api/v1/order/:id
exports.getOrderById = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id)

    if (!order) {
        return next(new ErrorHandler('No order found with this ID', 404))
    }

    res.status(200).json({
        success: true,
        order
    })
})

// // get logged in users orders    =>    /api/v1/orders/me
// exports.myOrders = catchAsyncErrors(async (req, res, next) => {
//     const orders = await Order.find({ user: req.user.id })

//     res.status(200).json({
//         success: true,
//         orders
//     })
// })

// get a buyer's previous orders by email   =>    /api/v1/orders/:buyer
exports.getBuyerOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await Order.find({ buyer: req.params.buyer })

    res.status(200).json({
        success: true,
        orders
    })
})


// Admin routes

// get all orders    =>    /api/v1/orders
exports.allOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await Order.find()

    let totalAmount = 0

    orders.forEach(order => {
        totalAmount = totalAmount + order.totalPrice
    })

    res.status(200).json({
        success: true,
        orders,
        totalAmount
    })
})

// update / process order - ADMIN    =>    /api/v1/orders
exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
    let order = await Order.findById(req.params.id)

    if (order.orderStatus === 'Delivered') {
        return next(new ErrorHandler('You have already delivered this order', 400))
    }

    order.orderStatus = req.body.status

    // if (req.body.status === 'Shipped') {
    //     order.trackingDetails = req.body.trackingDetails

    //     let emailData = {}
    //     emailData.orderId = req.params.id
    //     emailData.shippingAddress = `${order.shippingInfo.address},  ${order.shippingInfo.city}, ${order.shippingInfo.country}, ${order.shippingInfo.postCode}`
    //     emailData.courier = req.body.trackingDetails.courier
    //     emailData.trackingID = req.body.trackingDetails.trackingID
    //     emailData.totalPrice = order.totalPrice
    //     try {
    //         sendEmail(function(err, data){
    //             if (err) {
    //                 console.log("email send failed")
    //                 return res.status(500).send({err});
    //             }
    //             else {
    //                 console.log('email send successful')
    //             }
    //         }, order.buyer, "shippedConfirmation", emailData)
    //     } catch (error) {
    //         console.log(error)
    //     }
    // }

    if (req.body.status === 'Delivered') {
        order.deliveredAt = Date.now()  // shipped at
    }

    await order.save()

    res.status(200).json({
        success: true
    })
})

async function updateStock(id, quantity, size) {
    const product = await Product.findById(id)

    product.stockSizes[size] = product.stockSizes[size] - quantity
    product.totalStock = product.totalStock - quantity

    await product.save({ validateBeforeSave: false })
}


// delete order    =>    /api/v1/admin/order/:id
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id)

    if (!order) {
        return next(new ErrorHandler('No order found with this ID', 404))
    }

    await order.remove()

    res.status(200).json({
        success: true
    })
})