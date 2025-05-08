import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BankingButton from './BankingButton'
import { formatter } from '../../utils/fomater'
import { useDispatch, useSelector } from 'react-redux'
import { createCheckout } from "../../redux/slices/checkoutSlice"
import axios from 'axios'
import { getVietnameseColor } from '../../utils/colorMap'

const Checkout = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { cart, loading, error } = useSelector((state) => state.cart);
    const { user } = useSelector((state) => state.auth);

    const [checkoutId, setCheckOutId] = useState(null);
    const [shippingAddress, setShipAddress] = useState({
        firstName: "",
        lastName: "",
        address: "",
        city: "",
        postalCode: "",
        country: "",
        phone: "",
    });

    useEffect(() => {
        if (!cart || !cart.products || cart.products.length === 0) {
            navigate("/");
        }
    }, [cart, navigate]);

    const handleCreateCheckout = async (e) => {
        e.preventDefault();
        if (cart && cart.products.length > 0) {
            const res = await dispatch(createCheckout({
                checkoutItems: cart.products,
                shippingAddress,
                paymentMethod: "Paypal",
                totalPrice: cart.totalPrice,
            }));
            if (res.payload && res.payload._id) {
                setCheckOutId(res.payload._id);
            }
        }
    }

    const handlePaymentSuccess = async (details) => {
        try {
            const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/checkout/${checkoutId}/pay`, {
                paymentStatus: "paid",
                paymentDetails: details,
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
            });

            await handleFinalizeCheckout(checkoutId);
        } catch (error) {
            console.error(error);
        }
    };

    const handleFinalizeCheckout = async (checkoutId) => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/checkout/${checkoutId}/finalize`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
            });

            navigate("/order-confirmation");

        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <p>Đang tải giỏ hàng...</p>
    if (error) return <p>Lỗi: {error}</p>
    if (!cart || !cart.products || cart.products.length === 0) {
        return <p>Giỏ hàng của bạn trống</p>
    }

    return (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto py-10 px-6 tracking-tighter'>
            <div className='bg-white rounded-lg p-6'>
                <h2 className='text-2xl uppercase mb-6'>Thanh toán</h2>
                <form onSubmit={handleCreateCheckout}>
                    <h3 className='text-lg mb-4'>Thông tin liên hệ</h3>
                    <div className='mb-4'>
                        <label className='block text-gray-700'>Email</label>
                        <input type='email'
                            value={user ? user.email : ""}
                            className='w-full p-2 border rounded'
                            disabled />
                    </div>
                    <h3 className='text-lg mb-4'>Thông tin giao hàng</h3>
                    <div className='mb-4 grid grid-cols-2 gap-4'>
                        <div>
                            <label className='block text-gray-700'>Tên</label>
                            <input type='text'
                                value={shippingAddress.firstName}
                                onChange={(e) => setShipAddress({ ...shippingAddress, firstName: e.target.value })}
                                className='w-full p-2 border rounded'
                                required />
                        </div>
                        <div>
                            <label className='block text-gray-700'>Họ</label>
                            <input type='text'
                                value={shippingAddress.lastName}
                                onChange={(e) => setShipAddress({ ...shippingAddress, lastName: e.target.value })}
                                className='w-full p-2 border rounded'
                                required />
                        </div>
                    </div>
                    <div className='mb-4'>
                        <label className='block text-gray-700'>Địa chỉ</label>
                        <input type='text'
                            value={shippingAddress.address}
                            onChange={(e) => setShipAddress({ ...shippingAddress, address: e.target.value })}
                            className='w-full p-2 border rounded'
                            required />
                    </div>
                    <div className='mb-4 grid grid-cols-2 gap-4'>
                        <div>
                            <label className='block text-gray-700'>Thành phố</label>
                            <input type='text'
                                value={shippingAddress.city}
                                onChange={(e) => setShipAddress({ ...shippingAddress, city: e.target.value })}
                                className='w-full p-2 border rounded'
                                required />
                        </div>
                        <div>
                            <label className='block text-gray-700'>Mã bưu chính</label>
                            <input type='text'
                                value={shippingAddress.postalCode}
                                onChange={(e) => setShipAddress({ ...shippingAddress, postalCode: e.target.value })}
                                className='w-full p-2 border rounded'
                                required />
                        </div>
                    </div>
                    <div className='mb-4'>
                        <label className='block text-gray-700'>Quốc gia</label>
                        <input type='text'
                            value={shippingAddress.country}
                            onChange={(e) => setShipAddress({ ...shippingAddress, country: e.target.value })}
                            className='w-full p-2 border rounded'
                            required />
                    </div>
                    <div className='mb-4'>
                        <label className='block text-gray-700'>Điện thoại</label>
                        <input type='tel'
                            value={shippingAddress.phone}
                            onChange={(e) => setShipAddress({ ...shippingAddress, phone: e.target.value })}
                            className='w-full p-2 border rounded'
                            required />
                    </div>
                    <div className='mt-6'>
                        {!checkoutId ? (
                            <button type='submit'
                                className='w-full bg-black text-white py-3 rounded' >
                                Tiến hành thanh toán
                            </button>
                        ) : (
                            <div>
                                <h3 className='text-lg mb-4'>Thanh toán bằng</h3>
                                <BankingButton amount={cart.totalPrice}
                                    onSuccess={handlePaymentSuccess}
                                    onError={(err) => alert("Thanh toán không thành công. Hãy thử lại.")} />
                            </div>
                        )}
                    </div>
                </form>
            </div>

            <div className='bg-gray-50 p-6 rounded-lg'>
                <h3 className='text-lg mb-4'>Tổng quan đơn hàng</h3>
                <div className='border-t py-4 mb-4'>
                    {cart.products.map((product, index) => (
                        <div key={index}
                            className='flex items-start justify-between py-2 border-b' >
                            <div className='flex items-start'>
                                <img src={product.image}
                                    alt={product.name}
                                    className='w-20 h-24 object-cover mr-4' />
                                <div>
                                    <h3 className='text-md'>{product.name}</h3>
                                    <p className='text-gray-500'>Kích cỡ: {product.size}</p>
                                    <p className='text-gray-500'>Màu sắc: {getVietnameseColor(product.color)}</p>
                                    <p className='text-gray-500'>Số lượng: {product.quantity}</p>
                                </div>
                            </div>
                            <p className='text-xl'>{formatter(product.price)}</p>
                        </div>
                    ))}
                </div>
                <div className='flex justify-between items-center text-lg mb-4'>
                    <p>Số tiền tạm tính</p>
                    <p>{formatter(cart.totalPrice)}</p>
                </div>
                <div className='flex justify-between items-center text-lg'>
                    <p>Phí giao hàng</p>
                    <p>Miễn phí</p>
                </div>
                <div className='flex justify-between items-center text-lg mt-4 border-t pt-4'>
                    <p>Tổng tiền</p>
                    <p>{formatter(cart.totalPrice)}</p>
                </div>
            </div>
        </div>
    )
}

export default Checkout