import express from 'express'
import './config.js'
import './database.js'

// 🪧 Import Routes
import authRoute from './routes/auth.routes.js'
import daysNotes from './routes/daysNotes.routes.js'

// 🆙 express variable
const app = express()

// 🔐 Middleware
app.use(express.json())

// 🔐 Route Middlewares
app.use('/api/user', authRoute)
app.use('/api/daysNotes', daysNotes)

// 🎧 Server listen
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server Up and running on PORT: ${PORT}!`)
})
