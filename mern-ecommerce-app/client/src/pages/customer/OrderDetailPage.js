import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const OrderDetailPage = () => {
    const { authAxios } = useAuth();
    const { orderId } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [canceling, setCanceling] = useState(false);

    useEffect(() => {
        fetchOrder();
    }, [authAxios, orderId]);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            setError('');
            const res = await authAxios.get(`/orders/${orderId}`);
            setOrder(res.data);
        } catch (err) {
            console.error('Failed to fetch order:', err);
            setError('Failed to load order details.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async () => {
        const confirm = window.confirm('Are you sure you want to cancel this order?');
        if (!confirm) return;

        try {
            setCanceling(true);
            await authAxios.put(`/orders/${orderId}/cancel`);
            await fetchOrder(); // refresh updated data
        } catch (err) {
            alert('Failed to cancel the order. Please try again.');
            console.error(err);
        } finally {
            setCanceling(false);
        }
    };

    if (loading) return <p style={{ padding: '20px' }}>Loading order details...</p>;
    if (error) return <p style={{ color: 'red', padding: '20px' }}>{error}</p>;
    if (!order) return <p style={{ padding: '20px' }}>No order found.</p>;

    return (
        <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif' }}>
            <h2>Order Summary</h2>
            <p><strong>Order ID:</strong> {order._id}</p>
            <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
            <p><strong>Status:</strong> {order.status}</p>
            <p><strong>Total:</strong> ${order.totalAmount.toFixed(2)}</p>

            <h3>Shipping Address</h3>
            <p>
                {order.shippingAddress?.fullName}<br />
                {order.shippingAddress?.address1}<br />
                {order.shippingAddress?.address2 && <>{order.shippingAddress.address2}<br /></>}
                {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.zip}<br />
                {order.shippingAddress?.country}
            </p>

            <h3>Ordered Products</h3>
            {order.products?.length === 0 ? (
                <p>No products found in this order.</p>
            ) : (
                order.products.map((item, index) => (
                    <div key={index} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
                        {item.product?.imageUrl && (
                            <img
                                src={item.product.imageUrl}
                                alt={item.product.name}
                                style={{ width: '100px', height: '100px', objectFit: 'cover', marginRight: '20px', borderRadius: '5px' }}
                            />
                        )}
                        <div>
                            <p><strong>{item.product?.name}</strong></p>
                            <p>Quantity: {item.quantity}</p>
                            <p>Price at Order: ${item.priceAtOrder.toFixed(2)}</p>
                        </div>
                    </div>
                ))
            )}

            {['Pending', 'Processing'].includes(order.status) && (
                <button
                    onClick={handleCancelOrder}
                    disabled={canceling}
                    style={{ backgroundColor: '#dc3545', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '5px', marginRight: '10px', cursor: 'pointer' }}
                >
                    {canceling ? 'Cancelling...' : 'Cancel Order'}
                </button>
            )}

            <button
                onClick={() => navigate('/my-orders')}
                style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
            >
                Back to My Orders
            </button>
        </div>
    );
};

export default OrderDetailPage;
