import app from './app.js'

// 🎧 Server listen
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server Up and running on PORT: ${PORT}!`)
})
