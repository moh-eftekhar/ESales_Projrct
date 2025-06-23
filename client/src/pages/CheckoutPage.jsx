import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        fullName: '', email: '', phone: '', address: '', city: '', state: '', zipCode: '',
        cardNumber: '', expiryDate: '', cvv: ''
    });

    useEffect(() => {
        const cartData = JSON.parse(localStorage.getItem('cart'));
        if (!cartData) navigate('/');
        else setCart(cartData);
    }, [navigate]);

    const handleInputChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const { data } = await axios.post('http://localhost:5001/api/order', {
                customerDetails: { fullName: form.fullName, email: form.email, phone: form.phone, address: form.address, city: form.city, state: form.state, zipCode: form.zipCode },
                cartDetails: cart,
                paymentDetails: { cardNumber: form.cardNumber, expiryDate: form.expiryDate, cvv: form.cvv }
            });
            if (data.status === 'Approved') {
                localStorage.removeItem('cart');
                navigate(`/thank-you/${data.orderId}`);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An unexpected error occurred.');
        }
    };

    if (!cart) return null;

    return (
        <div>
            <h1>Checkout</h1>
            <div className="order-summary">
                <h2>Order Summary</h2>
                <p>{cart.productName} ({cart.variant.color}, {cart.variant.size})</p>
                <p>Quantity: {cart.quantity}</p>
                <p><strong>Total: ${(cart.price * cart.quantity).toFixed(2)}</strong></p>
            </div>
            <form onSubmit={handleSubmit}>
                <h2>Contact & Shipping</h2>
                <input name="fullName" placeholder="Full Name" onChange={handleInputChange} required />
                <input name="email" type="email" placeholder="Email" onChange={handleInputChange} required />
                <input name="phone" placeholder="Phone Number" onChange={handleInputChange} required />
                <input name="address" placeholder="Address" onChange={handleInputChange} required />
                <input name="city" placeholder="City" onChange={handleInputChange} required />
                <input name="state" placeholder="State" onChange={handleInputChange} required />
                <input name="zipCode" placeholder="Zip Code" onChange={handleInputChange} required />
                
                <h2>Payment Details</h2>
                <input name="cardNumber" placeholder="Card Number (16 digits)" onChange={handleInputChange} required minLength="16" maxLength="16" />
                <input name="expiryDate" placeholder="Expiry Date (MM/YY)" onChange={handleInputChange} required />
                <input name="cvv" placeholder="CVV" onChange={handleInputChange} required minLength="3" maxLength="3" />
                
                <button type="submit">Place Order</button>
                {error && <p className="error-message">{error}</p>}
            </form>
        </div>
    );
};
export default CheckoutPage;