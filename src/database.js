import mongoose from 'mongoose'

const uri = process.env.ATLAS_URI
mongoose.connect(uri, { dbName: 'recreate-BD' })

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error: '))
db.once('open', () => console.log('Connected DB SuccessFully!'))
