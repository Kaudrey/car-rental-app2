const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config(); 

const mailTransporter = nodemailer.createTransport({
  service: 'gmail',
  port: 465,
  secure: true,
  auth: {
    user: process.env.USER,
    pass:process.env.PASS
  }
});

async function sendWelcomeEmail(email, username) {
  try {
    const mailDetails = {
      from: process.env.USER,
      to: email,
      subject: 'Welcome to our app',
      text: `Hello ${username},\n\nThank you for registering on our social media app!`,
    };

    await mailTransporter.sendMail(mailDetails);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

module.exports = {
  sendWelcomeEmail,
};
