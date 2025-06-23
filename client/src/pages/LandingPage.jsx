import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LandingPage = () => {
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data } = await axios.get('http://localhost:5001/api/product');
                setProduct(data);
                setSelectedVariant(data.variants[0]);
            } catch (err) {
                console.error("Failed to fetch product");
            }
        };
        fetchProduct();
    }, []);

    const handleBuyNow = () => {
        const cart = {
            productId: product._id,
            productName: product.name,
            variant: selectedVariant,
            quantity: quantity,
            price: product.price,
        };
        localStorage.setItem('cart', JSON.stringify(cart));
        navigate('/checkout');
    };

    if (!product) return <div>Loading...</div>;

    return (
        <div>
            <h1>{product.name}</h1>
            <p>{product.description}</p>
            <h2>${product.price.toFixed(2)}</h2>
            <label>Variant:</label>
            <select onChange={(e) => setSelectedVariant(product.variants[e.target.value])}>
                {product.variants.map((v, i) => (
                    <option key={i} value={i}>{v.color} - Size {v.size}</option>
                ))}
            </select>
            <label>Quantity:</label>
            <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} min="1" />
            <button onClick={handleBuyNow}>Buy Now</button>
        </div>
    );
};
export default LandingPage;