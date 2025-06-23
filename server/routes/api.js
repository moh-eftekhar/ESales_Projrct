const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const { sendConfirmationEmail, sendFailedEmail } = require('../services/emailService');

const setupMockProduct = async () => {
    const existingProduct = await Product.findOne({ name: 'Converse Chuck Taylor All-Star' });
    if (!existingProduct) {
        console.log('Creating mock product...');
        const mockProduct = new Product({
            name: 'Converse Chuck Taylor All-Star',
            description: 'The iconic high-top sneaker that has stood the test of time. A staple for any wardrobe.',
            price: 65.00,
            imageUrl: 'https://i.imgur.com/TdpQLtv.png',
            variants: [
                { color: 'Black', size: '9' },
                { color: 'White', size: '10' },
                { color: 'Red', size: '8' },
            ],
            inventory: 50,
        });
        await mockProduct.save();
    }
};
setupMockProduct();

router.get('/product', async (req, res) => {
    try {
        const product = await Product.findOne({ name: 'Converse Chuck Taylor All-Star' });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

router.post('/order', async (req, res) => {
    const { customerDetails, cartDetails, paymentDetails } = req.body;
    const { cardNumber } = paymentDetails;
    const lastDigit = cardNumber.slice(-1);
    let transactionStatus;

    if (lastDigit === '1') transactionStatus = 'Approved';
    else if (lastDigit === '2') transactionStatus = 'Declined';
    else transactionStatus = 'Error';

    if (transactionStatus !== 'Approved') {
        await sendFailedEmail(customerDetails, transactionStatus);
        return res.status(400).json({ status: transactionStatus, message: `Payment ${transactionStatus}` });
    }

    try {
        const product = await Product.findById(cartDetails.productId);
        if (product.inventory < cartDetails.quantity) {
            return res.status(400).json({ message: 'Not enough stock!' });
        }

        const orderNumber = `ORD-${Date.now()}`;
        const newOrder = new Order({
            orderNumber,
            customer: customerDetails,
            product: {
                name: product.name,
                variant: cartDetails.variant,
                quantity: cartDetails.quantity,
                price: product.price,
            },
            totalAmount: product.price * cartDetails.quantity,
            status: 'Approved',
        });
        
        product.inventory -= cartDetails.quantity;
        
        await newOrder.save();
        await product.save();
        await sendConfirmationEmail(newOrder);

        res.status(201).json({ status: 'Approved', message: 'Order created!', orderId: newOrder._id });

    } catch (error) {
        res.status(500).json({ message: 'Server error during order processing.' });
    }
});

router.get('/order/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;