const mongoose = require('mongoose')

const connectDatabase = () => {
    // production database connection
    // mongoose.connect(process.env.DB_CLOUD_URI).then(conn => {
    //     console.log(`MongoDB Database connected with HOST: ${conn.connection.host}`)
    // })

    // development database connection
    mongoose.connect(process.env.DB_LOCAL_URI).then(conn => {
        console.log(`MongoDB Database connected with HOST: ${conn.connection.host}`)
    })
}

module.exports = connectDatabase