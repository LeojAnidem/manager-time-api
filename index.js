import express from 'express'

// 🪧 Import Routes
import authRoute from './routes/auth.js'

// 🆙 express variable
const app = express()

// 🔐 Route Middlewares
app.use('/api/user', authRoute)

// 🎧 Server listen
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server Up and running on PORT: ${PORT}!`)
})
