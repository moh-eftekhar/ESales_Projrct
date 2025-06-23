import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ThankYouPage = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data } = await axios.get(`http://localhost:5001/api/order/${orderId}`);
                setOrder(data);
            } catch (error) {
                console.error("Failed to fetch order");
            }
        };
        fetchOrder();
    }, [orderId]);

    if (!order) return <div>Loading order details...</div>;

    return (
        <div>
            <h1>Thank You!</h1>
            <h2>Final Confirmation Message</h2>
            <p>Your order has been confirmed. A confirmation email has been sent.</p>
            <h3>Order Number: {order.orderNumber}</h3>
            
            <h3>Order Summary</h3>
            <p>{order.product.name} ({order.product.variant.color}, {order.product.variant.size})</p>
            <p>Quantity: {order.product.quantity}</p>
            <p><strong>Total Paid: ${order.totalAmount.toFixed(2)}</strong></p>

            <h3>Customer Details</h3>
            <p>Name: {order.customer.fullName}</p>
            <p>Email: {order.customer.email}</p>
        </div>
    );
};
export default ThankYouPage;