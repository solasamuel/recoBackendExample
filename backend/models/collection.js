const mongoose = require('mongoose')

const collectionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Collection name required'],
        trim: true,
        maxLength: [100, 'Collection name cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Collection description required'],
    },
    media: [
        {
            public_id: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            },
            format: {
                type: String,
                required: [true, 'Please select a format for the media'],
                enum: {
                    values: [
                        'Image',
                        'Video',
                    ],
                    message: 'Please select a category for the media'
                }
            }
        }
    ],
    isMain: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
})

module.exports = mongoose.model('Collection', collectionSchema)