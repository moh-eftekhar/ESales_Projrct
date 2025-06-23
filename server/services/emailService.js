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

const sendConfirmationEmail = async (order) => {
    const mailOptions = {
        from: '"e-SalesOne" <noreply@esalesone.com>',
        to: order.customer.email,
        subject: `Order Confirmation #${order.orderNumber}`,
        html: `<h1>Thank you, ${order.customer.fullName}!</h1><p>Your order for ${order.product.quantity} x ${order.product.name} has been confirmed.</p><p>Total: $${order.totalAmount.toFixed(2)}</p>`
    };
    await transporter.sendMail(mailOptions);
};

const sendFailedEmail = async (customerDetails, status) => {
    const mailOptions = {
        from: '"e-SalesOne" <noreply@esalesone.com>',
        to: customerDetails.email,
        subject: `Your Transaction Has Failed`,
        html: `<h1>Oops!</h1><p>Hi ${customerDetails.fullName}, your transaction was ${status.toLowerCase()}. Please try again or contact support.</p>`
    };
    await transporter.sendMail(mailOptions);
};

module.exports = { sendConfirmationEmail, sendFailedEmail };