const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    orderNumber: { type: String, unique: true, required: true },
    customer: {
        fullName: String,
        email: String,
        phone: String,
        address: String,
        city: String,
        state: String,
        zipCode: String
    },
    product: {
        name: String,
        variant: { color: String, size: String },
        quantity: Number,
        price: Number
    },
    totalAmount: Number,
    status: { type: String, enum: ['Approved', 'Declined', 'Error'], required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);