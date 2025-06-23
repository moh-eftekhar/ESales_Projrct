const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const { sendConfirmationEmail, sendFailedEmail } = require('../services/emailService');

// --- MOCK PRODUCT DATA SETUP ---
// In a real app, you'd have an admin panel to add products.
// For this test, we'll create one product if it doesn't exist.
const setupMockProduct = async () => {
    const existingProduct = await Product.findOne({ name: 'Converse Chuck Taylor All-Star' });
    if (!existingProduct) {
        console.log('Creating mock product...');
        const mockProduct = new Product({
            name: 'Converse Chuck Taylor All-Star',
            description: 'The iconic high-top sneaker that has stood the test of time. A staple for any wardrobe.',
            price: 65.00,
            imageUrl: 'https://i.imgur.com/TdpQLtv.png', // A sample image URL
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


// --- API ROUTES ---

// GET: Fetch a product's details
router.get('/product', async (req, res) => {
    try {
        const product = await Product.findOne({ name: 'Converse Chuck Taylor All-Star' });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// POST: Create a new order (Checkout Submission)
router.post('/order', async (req, res) => {
    const { customerDetails, cartDetails, paymentDetails } = req.body;
    const { cardNumber } = paymentDetails;

    // *** TRANSACTION SIMULATION LOGIC ***
    const lastDigit = cardNumber.slice(-1);
    let transactionStatus;

    if (lastDigit === '1') {
        transactionStatus = 'Approved';
    } else if (lastDigit === '2') {
        transactionStatus = 'Declined';
    } else {
        transactionStatus = 'Error'; // Gateway Failure
    }

    // If declined or error, we still log the attempt but don't process inventory
    if (transactionStatus !== 'Approved') {
        // Optionally save a failed transaction attempt to the DB
        console.log(`Transaction ${transactionStatus} for ${customerDetails.email}`);
        // Send a failed transaction email
        await sendFailedEmail(customerDetails, transactionStatus);
        return res.status(400).json({ status: transactionStatus, message: `Payment ${transactionStatus}` });
    }

    // --- PROCESS APPROVED TRANSACTION ---
    try {
        // 1. Check inventory
        const product = await Product.findById(cartDetails.productId);
        if (product.inventory < cartDetails.quantity) {
            return res.status(400).json({ message: 'Not enough stock!' });
        }

        // 2. Generate a unique order number
        const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // 3. Create a new order
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
        
        // 4. Update product inventory
        product.inventory -= cartDetails.quantity;
        
        // 5. Save everything to the database
        await newOrder.save();
        await product.save();

        // 6. Send confirmation email
        await sendConfirmationEmail(newOrder);

        // 7. Redirect to Thank You Page on the frontend
        res.status(201).json({ status: 'Approved', message: 'Order created successfully!', orderId: newOrder._id });

    } catch (error) {
        console.error('Order processing error:', error);
        res.status(500).json({ message: 'Server error during order processing.' });
    }
});


// GET: Fetch order details for the Thank You page
router.get('/order/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;