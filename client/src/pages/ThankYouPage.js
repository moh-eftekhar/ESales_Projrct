// client/src/pages/ThankYouPage.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ThankYouPage = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await axios.get(`http://localhost:5001/api/order/${orderId}`);
                setOrder(response.data);
            } catch (error) {
                console.error("Failed to fetch order", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [orderId]);

    if (loading) return <div>Loading your order details...</div>;
    if (!order) return <div>Order not found.</div>;

    return (
        <div>
            <h1>Thank You for Your Purchase!</h1>
            <p>Your order has been confirmed.</p>
            
            <h2>Order Details</h2>
            <p><strong>Order Number:</strong> {order.orderNumber}</p>
            
            <h3>Customer Information:</h3>
            <p>{order.customer.fullName}</p>
            <p>{order.customer.email}</p>
            
            <h3>Order Summary:</h3>
            <p>{order.product.name} x {order.product.quantity}</p>
            <p><strong>Total:</strong> ${order.totalAmount.toFixed(2)}</p>
            
            <p>A confirmation email has been sent to you.</p>
        </div>
    );
};
export default ThankYouPage;