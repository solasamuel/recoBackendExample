const mongoose = require('mongoose')
const validator = require('validator')
const bycrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

global.crypto = require('crypto')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name'],
        maxlength: [45, 'Your name cannot exceed 45 characters']
    },
    email: {
        type: String,
        required: [true, 'Please enter your email'],
        unique: true,
        validate: [validator.isEmail, 'Please enter valid email address']
    },
    password: {
        type: String,
        required: [true, 'Please enter your password'],
        minlength: [6, 'Your Password must be longer than 6 characters'],
        select: false
    },
    role: {
        type: String,
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
})

// Encrypting password before saving user
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next()
    }
    this.password = await bycrypt.hash(this.password, 10)
})

// compare user password
userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bycrypt.compare(enteredPassword, this.password)
}

// return JWT
userSchema.methods.getJwtToken = function() {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE_TIME
    })
}

// generate password reset token
userSchema.methods.getPasswordResetToken = function () {
    // generate token
    const resetToken = crypto.randomBytes(20).toString('hex')

    // hash and set password reset token
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    // set token expire time
    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000

    return resetToken
}

module.exports = mongoose.model('User', userSchema)