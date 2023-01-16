const User = require('../models/user')                                                                                                                                                                                  

const ErrorHandler = require('../utils/errorHandler')
const catchAsyncErrors = require('../middlewares/catchAsyncErrors')
const sendToken = require('../utils/jwtToken')
// const crypto = require('crypto')
// const { cloudinary } = require('../utils/cloudinary')

// const { sendEmail } = require('../utils/sesSendEmail')


// register a user    =>    /api/v1/register
exports.registerUser = catchAsyncErrors(async (req, res, next) => {

    const { name, email, password } = req.body

    // console.log(req.body)

    const user = await User.create({                                     
        name,
        email,
        password
    })

    sendToken(user, 200, res)

})

// login user    =>    /api/v1/login
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body

    // checks if email and password is entered by user
    if (!email || !password) {
        return next(new ErrorHandler('Please enter email & password', 400))
    }

    // finding user in database
    const user = await User.findOne({ email }).select('+password')

    if (!user) {
        return next(new ErrorHandler('Invalid email or password', 401))
    }

    const isPasswordMatched = await user.comparePassword(password)

    if (!isPasswordMatched) {
        return next(new ErrorHandler('Invalid email or password', 401))
    }

    sendToken(user, 200, res)
})

exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email })

    if (!user) {
        return next(new ErrorHandler('User not found with this email', 404))
    }

    // get reset token
    const resetToken = user.getPasswordResetToken()

    await user.save({ validateBefore: false })

    const resetUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`

    const url = `Your password reset token is as follow:\n\n${resetUrl}\n\nIf you have not requested this email, then ignore it.`

    try {

        // send reset link to user email
        emailData = {
            senderEmail: req.body.email,
            url
        }


        // sendEmail(function(err, data){
        //     if (err) {
        //         console.log("email send failed")
        //         return res.status(500).send({err});
        //     }
        //     else {
        //         console.log('email send successful')
        //     }
        // }, req.body.email, "forgotPassword", emailData)


        res.status(200).json({
            success: true,
            message: `Email sent to: ${user.email}`
        })

    } catch (error) {
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined

        await user.save({ validateBeforeSave: false })

        return next(new ErrorHandler(error.message, 500))
    }
})

// reset password =>    /api/v1/password/reset/:token
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {

    // hash URL token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    })

    if (!user) {
        return next(new ErrorHandler('Password reset token is invalid or has been expired', 400))
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler('Password does not match', 400))
    }

    // setup
    user.password = req.body.password

    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save()

    sendToken(user, 200, res)
})

// get currently logged in user details    =>    /api/v1/me
exports.getUserProfile = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id)

    res.status(200).json({
        success: true,
        user
    })
})

// update / change password    =>    /api/v1/password/update
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password')

    // check previous user password
    const isMatched = await user.comparePassword(req.body.oldPassword)
    if (!isMatched) {
        return next(new ErrorHandler('old password is incorrect'))
    }

    user.password = req.body.password;
    await user.save()

    sendToken(user, 200, res)
})

// update user profile    =>    /api/v1/me/update
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
    try {
        const newUserData = {
            name: req.body.name,
            email: req.body.email
        }

        const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
            new: true,
            runValidators: true,
            useFindAndModify: false
        })

        res.status(200).json({
            success: true
        })
    } catch (err) {
        next(new ErrorHandler('Update Failed'))
        console.error(err)
    }

})

// Logout user   =>    /api/v1/logout
exports.logout = catchAsyncErrors(async (req, res, next) => {
    try {
        res.cookie('token', null, {
            expires: new Date(Date.now()),
            httpTrue: true
        })
    
        res.status(200).json({
            success: true,
            message: 'Logout'
        })
    } catch (error) {
        console.log(error);
    }
})


// Admin users

// get all users    =>    /api/v1/admin/users
exports.allUsers = catchAsyncErrors(async (req, res, next) => {
    const users = await User.find()

    res.status(200).json({
        success: true,
        users
    })
})

// get user details   =>   /api/v1/admin/user/:id
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id)

    if (!user) {
        return next(new ErrorHandler(`User not found with id: ${req.params.id}`))
    }

    res.status(200).json({
        success: true,
        user
    })
})

// update user profile    =>    /api/v1/admin/user/:id
exports.updateUser = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true
    })

})

// delete user    =>    /api/v1/admin/user/:id
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id)

    if (!user) {
        return next(new ErrorHandler(`User not found with id: ${req.params.id}`))
    }

    // remove avatar from cloudinary
    // const image_id = user.avatar.public_id
    // await cloudinary.uploader.destroy(image_id)

    await user.remove()

    res.status(200).json({
        success: true,
        user
    })
})