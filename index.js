import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

// 🪧 Import Routes
import authRoute from './routes/auth.js'

// 🆙 express variable
dotenv.config()
const app = express()

// 🔌 Connect to DB
const uri = process.env.ATLAS_URI
mongoose.connect(uri, { dbName: 'recreate-BD' })

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error: '))
db.once('open', () => console.log('Connected DB SuccessFully!'))

// 🔐 Middleware
app.use(express.json())

// 🔐 Route Middlewares
app.use('/api/user', authRoute)

// 🎧 Server listen
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server Up and running on PORT: ${PORT}!`)
})
