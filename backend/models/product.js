const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Enter product name'],
        trim: true,
        maxLength: [100, 'Product name cannot exceed 100 characters']
    },
    color: {
        type: String,
        required: [true, 'Enter product color'],
        trim: true,
        maxLength: [100, 'Product color cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Enter product description'],
    },
    alias: {
        type: String,
        required: [true, 'Enter product alias'],
        trim: true,
        maxLength: [100, 'Product alias cannot exceed 100 characters']
    },
    activeStatus: {
        type: Boolean,
        default: true,
    },
    brandCollection: {
        type: String
    },
    price: {
        type: String,
        required: [true, 'Enter product price'],
        trim: true,
        maxLength: [7, 'Product price cannot exceed 5 characters'],
        default: 0.0
    },
    images: [
        {
            public_id: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            },
        }
    ],
    
    category: {
        type: String,
        required: [true, 'Select a category for this product'],
        enum: {
            values: [
                'TOPS',
                'JUMPERS',
                'JACKETS',
                'BOTTOMS',
                'ACTIVEWEAR',
                'ACCESSORIES'
            ],
            message: 'Select a category for the product'
        }
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    stockSizes: {
        XXS: {
            type: Number,
            required: [true, 'Enter product XXS stock'],
            maxLength: [5, 'Product stock cannot exceed 5 characters'],
            default: 0
        },
        XS: {
            type: Number,
            required: [true, 'Enter product stock'],
            maxLength: [5, 'Product stock cannot exceed 5 characters'],
            default: 0
        },
        S: {
            type: Number,
            required: [true, 'Enter product stock'],
            maxLength: [5, 'Product stock cannot exceed 5 characters'],
            default: 0
        },
        M: {
            type: Number,
            required: [true, 'Please enter product stock'],
            maxLength: [5, 'Product stock cannot exceed 5 characters'],
            default: 0
        },
        L: {
            type: Number,
            required: [true, 'Please enter product stock'],
            maxLength: [5, 'Product stock cannot exceed 5 characters'],
            default: 0
        },
        XL: {
            type: Number,
            required: [true, 'Enter product stock'],
            maxLength: [5, 'Product stock cannot exceed 5 characters'],
            default: 0
        },
        XXL: {
            type: Number,
            required: [true, 'Enter product stock'],
            maxLength: [5, 'Product stock cannot exceed 5 characters'],
            default: 0
        },
        XXXL: {
            type: Number,
            required: [true, 'Enter product stock'],
            maxLength: [5, 'Product stock cannot exceed 5 characters'],
            default: 0
        },
        XXXXL: {
            type: Number,
            required: [true, 'Enter product stock'],
            maxLength: [5, 'Product stock cannot exceed 5 characters'],
            default: 0
        },
        ONESIZE: {
            type: Number,
            maxLength: [5, 'Product stock cannot exceed 5 characters'],
            default: 0
        },

    },

    totalStock: {
        type: Number,
        required: [true, 'Enter product stock'],
        maxLength: [5, 'Product stock cannot exceed 5 characters'],
        default: 0
    },
})

module.exports = mongoose.model('Product', productSchema)