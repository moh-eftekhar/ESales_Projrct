// server/services/emailService.js
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
    },
});

// Email for an approved transaction
const sendConfirmationEmail = async (order) => {
    const mailOptions = {
        from: '"e-SalesOne" <noreply@esalesone.com>',
        to: order.customer.email,
        subject: `Order Confirmation #${order.orderNumber}`,
        html: `<h1>Thank you for your order!</h1>
               <p>Hi ${order.customer.fullName},</p>
               <p>We've received your order and are getting it ready.</p>
               <h3>Order Summary:</h3>
               <ul>
                 <li>Order Number: ${order.orderNumber}</li>
                 <li>Product: ${order.product.name}</li>
                 <li>Quantity: ${order.product.quantity}</li>
                 <li>Total: $${order.totalAmount.toFixed(2)}</li>
               </ul>`
    };
    await transporter.sendMail(mailOptions);
};

// Email for a declined/failed transaction
const sendFailedEmail = async (customerDetails, status) => {
    const mailOptions = {
        from: '"e-SalesOne" <noreply@esalesone.com>',
        to: customerDetails.email,
        subject: `Your Transaction Has Failed`,
        html: `<h1>Oops! Something went wrong.</h1>
               <p>Hi ${customerDetails.fullName},</p>
               <p>Your recent transaction attempt was ${status.toLowerCase()}.</p>
               <p>Please try again or contact your bank. If the issue persists, please contact our support.</p>`
    };
    await transporter.sendMail(mailOptions);
};

module.exports = { sendConfirmationEmail, sendFailedEmail };