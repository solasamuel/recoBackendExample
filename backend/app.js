const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
const bodyparser = require('body-parser')
const fileUpload = require('express-fileupload')
const dotenv = require('dotenv')
const path = require('path')

const errorMiddleware = require('./middlewares/errors')

// Setting up config file
dotenv.config({ path: 'backend/config/config.env' })

app.use(express.json({ limit: '50mb' }))
app.use(cookieParser())
app.use(bodyparser.urlencoded({ limit: '50mb', extended: true }))
app.use(fileUpload())
app.use(express.static(path.join(__dirname, 'public' )))

// Import all routes
const product = require('./routes/product')
const collection = require('./routes/collection')
const auth = require('./routes/auth')
const order = require('./routes/order') 

app.use('/api/v1', product)
app.use('/api/v1', collection)
app.use('/api/v1', auth)
app.use('/api/v1', order)

// Middleware to handle errors
app.use(errorMiddleware)

module.exports = app