import React, { useEffect } from 'react';
import { formatter } from './../utils/fomater';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {fetchUserOrders} from "../redux/slices/orderSlice";

const MyOrders = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const {orders, loading, error} = useSelector((state) => state.orders);

    useEffect(() => {
        dispatch(fetchUserOrders());
    }, [dispatch]);

    const handleRowClick = (orderId) => {
        navigate(`/order/${orderId}`)
    };

    if (loading) return <p>Đang tải...</p>
    if (error) return <p>Lỗi: {error}</p>

  return (
    <div className='max-w-7xl mx-auto p-4 sm:p-6'>
        <h2 className='text-xl sm:text-2xl font-bold mb-6'>Đơn hàng của tôi</h2>
        <div className='relative shadow-md sm:rounded-lg overflow-hidden'>
            <table className='min-w-full text-left text-gray-500'>
                <thead className='bg-gray-100 text-xs uppercase text-gray-700'>
                    <tr>
                        <th className='py-2 px-4 sm:py-3'>Hình ảnh</th>
                        <th className='py-2 px-4 sm:py-3'>ID đơn hàng</th>
                        <th className='py-2 px-4 sm:py-3'>Thời gian đặt hàng</th>
                        <th className='py-2 px-4 sm:py-3'>Địa chỉ giao hàng</th>
                        <th className='py-2 px-4 sm:py-3'>Mặt hàng</th>
                        <th className='py-2 px-4 sm:py-3'>Giá</th>
                        <th className='py-2 px-4 sm:py-3'>Trạng thái</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.length > 0 ? (
                        orders.map((order) => (
                            <tr key={order._id}
                             onClick={() => handleRowClick(order._id)}
                             className='border-b hover:border-gray-50 cursor-pointer'>
                                <td className='py-2 px-2 sm:py-4 sm:px-4'>
                                    <img src={order.orderItems[0].image} 
                                    alt={order.orderItems[0].name} 
                                    className='w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg' />
                                </td>
                                <td className='py-2 px-2 sm:py-4 sm:px-4 font-medium text-gray-900 whitespace-nowrap'>
                                    #{order._id}
                                </td>
                                <td className='py-2 px-2 sm:py-4 sm:px-4'>
                                    {new Date(order.createAt).toLocaleDateString("vi-VN")}{" | "}
                                    {new Date(order.createAt).toLocaleTimeString()}
                                </td>
                                <td className='py-2 px-2 sm:py-4 sm:px-4'>
                                    {order.shippingAddress 
                                    ? `${order.shippingAddress.city}, ${order.shippingAddress.country}`
                                    : "N/A"}
                                </td>
                                <td className='py-2 px-2 sm:py-4 sm:px-4'>
                                    {order.orderItems.length}
                                </td>
                                <td className='py-2 px-2 sm:py-4 sm:px-4'>
                                    {formatter(order.totalPrice)}
                                </td>
                                <td className='py-2 px-2 sm:py-4 sm:px-4'>
                                    <span className={`${order.isPaid 
                                        ? "bg-green-100 text-green-700" 
                                        : "bg-red-100 text-red-700"} 
                                        px-2 py-1 rounded-full text-xs sm:text-sm font-medium`}>
                                        {order.isPaid ? "Đã thanh toán" : "Đang chờ xử lý"}
                                    </span>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={7} className='py-4 px-4 text-center text-gray-500'>
                                Bạn không có đơn đặt hàng
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  )
}

export default MyOrders