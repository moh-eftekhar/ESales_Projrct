import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const [form, setForm] = useState({
        fullName: '', email: '', phone: '', address: '', city: '', state: '', zipCode: '',
        cardNumber: '', expiryDate: '', cvv: ''
    });
    const [error, setError] = useState('');

    useEffect(() => {
        // Retrieve cart info from localStorage
        const cartData = JSON.parse(localStorage.getItem('cart'));
        if (!cartData) {
            navigate('/'); // Redirect to landing if no cart data
        }
        setCart(cartData);
    }, [navigate]);

    const handleInputChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Basic validation
        if (!form.cardNumber || form.cardNumber.length !== 16) {
            setError('Please enter a valid 16-digit card number.');
            return;
        }

        const payload = {
            customerDetails: {
                fullName: form.fullName, email: form.email, phone: form.phone,
                address: form.address, city: form.city, state: form.state, zipCode: form.zipCode
            },
            cartDetails: cart,
            paymentDetails: {
                cardNumber: form.cardNumber, expiryDate: form.expiryDate, cvv: form.cvv
            }
        };

        try {
            const response = await axios.post('http://localhost:5001/api/order', payload);
            if (response.data.status === 'Approved') {
                localStorage.removeItem('cart'); // Clear cart on success
                navigate(`/thank-you/${response.data.orderId}`);
            }
        } catch (err) {
            // Handle Declined/Error responses from the server
            const errorMessage = err.response?.data?.message || 'An unexpected error occurred.';
            setError(errorMessage);
        }
    };

    if (!cart) return <div>Loading...</div>;

    return (
        <div>
            <h1>Checkout</h1>
            {/* Order Summary Section */}
            <div>
                <h3>Order Summary</h3>
                <p>{cart.productName} ({cart.variant.color}, {cart.variant.size})</p>
                <p>Quantity: {cart.quantity}</p>
                <p>Total: ${(cart.price * cart.quantity).toFixed(2)}</p>
            </div>

            {/* Checkout Form */}
            <form onSubmit={handleSubmit}>
                {/* Add all form inputs for customer and payment details here */}
                {/* Example for Card Number */}
                <input type="text" name="cardNumber" placeholder="Card Number (16 digits)" onChange={handleInputChange} required />
                {/* ... other inputs ... */}
                <button type="submit">Place Order</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default CheckoutPage;