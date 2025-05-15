import React, { useEffect } from 'react'
import { formatter } from './../utils/fomater'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom';
import { clearCart } from '../redux/slices/cartSlice';
import { getVietnameseColor } from '../utils/colorMap';
import { paymentStatusMap } from '../utils/paymentStatusMap';

const OrderConfirmation = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {checkout} = useSelector((state) => state.checkout);

    useEffect(() => {
        if (checkout && checkout._id) {
            dispatch(clearCart());
            localStorage.removeItem("cart");
        } else {
            navigate("/my-orders");
        }
    }, [checkout, dispatch, navigate]);

    const calculateEstimatedDelivery = (createdAt) => {
        const orderDate = new Date(createdAt);
        orderDate.setDate(orderDate.getDate() + 10); //Thêm 10 ngày vào ngày đặt hàng
        return orderDate.toLocaleDateString("vi-VN");
    }

  return (
    <div className='max-w-4xl mx-auto p-6 bg-white'>
        <h1 className='text-4xl font-bold text-center text-emerald-700 mb-8'>
            {checkout && checkout.paymentMethod === "cod" 
                ? "Đặt hàng thành công!" 
                : "Thanh toán thành công!"}
        </h1>
        
        {checkout && checkout.paymentMethod === "cod" && (
            <div className="text-center mb-8">
                <p className="text-lg text-gray-700">
                    Bạn sẽ thanh toán khi nhận hàng. Cảm ơn bạn đã đặt hàng!
                </p>
            </div>
        )}
        
        {checkout && (
            <div className='p-6 rounded-lg border'>
                <div className='flex justify-between mb-20'>
                    <div>
                        <h2 className='text-xl font-semibold'>
                            Mã đơn hàng: {checkout._id}
                        </h2>
                        <p className='text-gray-500'>
                            Ngày đặt hàng: {new Date(checkout.createdAt).toLocaleDateString("vi-VN")}
                        </p>
                    </div>

                    <div>
                        <p className='text-emerald-700 text-sm'>
                            Dự kiến giao hàng: {calculateEstimatedDelivery(checkout.createdAt)}
                        </p>
                        {checkout.paymentStatus && (
                            <p className='mt-2'>
                                <span>Trạng thái thanh toán: </span>
                                <span className={`inline-block px-2 py-1 rounded text-sm ${
                                    checkout.paymentStatus === "paid" 
                                        ? "bg-green-100 text-green-800" 
                                        : checkout.paymentStatus === "unpaid" 
                                        ? "bg-red-100 text-red-800" 
                                        : "bg-yellow-100 text-yellow-800"
                                }`}>
                                    {paymentStatusMap[checkout.paymentStatus]}
                                </span>
                            </p>
                        )}
                    </div>
                </div>

                <div className='mb-20'>
                    {checkout.checkoutItems.map((item) => (
                        <div key={item.productId}
                        className='flex items-center mb-4' >
                            <img src={item.image}
                            alt={item.name}
                            className='w-16 h-16 object-cover rounded-md mr-4' />

                            <div>
                                <h4 className='text-md font-semibold'>{item.name}</h4>
                                <p className='text-sm text-gray-500'>
                                    Màu: {getVietnameseColor(item.color)}  |  Cỡ: {item.size}
                                </p>
                            </div>
                            <div className='ml-auto text-right'>
                                <p className='text-md'>{formatter(item.price)}</p>
                                <p className='text-sm text-gray-500'>
                                    Số lượng: {item.quantity}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className='grid grid-cols-2 gap-8'>
                    <div>
                        <h4 className='text-lg font-semibold mb-2'>Phương thức thanh toán</h4>
                        <p className='text-gray-600'>
                            {checkout.paymentMethod === "cod" 
                                ? "Thanh toán khi nhận hàng (COD)" 
                                : checkout.paymentMethod}
                        </p>
                    </div>

                    <div>
                        <h4 className='text-lg font-semibold mb-2'>Giao hàng </h4>
                        <p className='text-gray-600'>{checkout.shippingAddress.address}</p>
                        <p className='text-gray-600'>
                            {checkout.shippingAddress.city}, {checkout.shippingAddress.country}
                        </p>
                    </div>
                </div>
                
                <div className="mt-8 text-center">
                    <button 
                        onClick={() => navigate("/my-orders")}
                        className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
                    >
                        Xem đơn hàng
                    </button>
                </div>
            </div>)}
    </div>
  )
}

export default OrderConfirmation