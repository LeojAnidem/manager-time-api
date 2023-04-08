import express from 'express'
import './config.js'
import './database.js'
import { createRoles } from './libs/initialSetup.js'

// 🪧 Import Routes
import authRoute from './routes/auth.routes.js'
import userRoute from './routes/user.routes.js'
import daysNotes from './routes/daysNotes.routes.js'

// 🆙 config
const app = express()
createRoles()

// 🔐 Middleware
app.use(express.json())

// 🔐 Route Middlewares
app.use('/api/auth', authRoute)
app.use('/api/user', userRoute)
app.use('/api/daysNotes', daysNotes)

export default app
