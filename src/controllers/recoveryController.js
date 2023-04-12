import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

const sendMail = async (from, verificationCode) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: from,
    subject: 'Verification Code',
    text: `Your verification code is: ${verificationCode}`
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log('Email Send!:', info)
  } catch (err) {
    console.error(`Error to send email: ${err}`)
  }
}

export default { sendMail }
