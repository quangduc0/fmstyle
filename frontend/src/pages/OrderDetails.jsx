import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { formatter } from './../utils/fomater'

const OrderDetails = () => {
    const {id} = useParams();
    const [orderDetails, setOrderDetails] = useState(null);

    useEffect(() => {
        const mockOrderDetails = {
            _id: id,
            createdAt: new Date(),
            isPaid: true,
            isDelivered: false,
            paymentMethod: "PayPal",
            shippingMethod: "Tiêu chuẩn",
            shippingAddress: {city: "Nha Trang", country: "Việt Nam"},
            orderItems: [
                {
                    productId: "1",
                    name: "Áo khoác",
                    price: 150000,
                    quantity: 1,
                    image: "https://picsum.photos/500/500?random=1",
                },
                {
                    productId: "2",
                    name: "Áo thun",
                    price: 100000,
                    quantity: 2,
                    image: "https://picsum.photos/500/500?random=2",
                },
            ]
        }
        setOrderDetails(mockOrderDetails);
    }, [id]);

  return (
    <div className='max-w-7xl mx-auto p-4 sm:p-6'>
        <h2 className='text-2xl md:text-3xl font-bold mb-6'>Chi tiết đơn hàng</h2>
        {!orderDetails ? (<p>Không tìm thấy đơn hàng</p>) : (
            <div className='p-4 sm:p-6 rounded-lg border'>
                <div className='flex flex-col sm:flex-row justify-between mb-8'>
                    <div>
                        <h3 className='text-lg md:text-xl font-semibold'>
                            Mã đơn hàng: #{orderDetails._id}
                        </h3>
                        <p className='text-gray-600'>
                            {new Date(orderDetails.createdAt).toLocaleDateString("vi-VN")}
                        </p>
                    </div>
                    <div className='flex flex-col items-start sm:items-end mt-4 sm:mt-0'>
                        <span className={`${orderDetails.isPaid 
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"} 
                        px-3 py-1 rounded-full text-sm font-medium mb-2`}>
                            {orderDetails.isPaid ? "Đã xác nhận" : "Đang chờ"}
                        </span>
                        <span className={`${orderDetails.isDelivered 
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"} 
                        px-3 py-1 rounded-full text-sm font-medium mb-2`}>
                            {orderDetails.isDelivered ? "Đã giao hàng" : "Đang chờ giao hàng"}
                        </span>
                    </div>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-8'>
                    <div>
                        <h4 className='text-lg font-semibold mb-2'>Thông tin giao dịch</h4>
                        <p>Phương thức thanh toán: {orderDetails.paymentMethod}</p>
                        <p>Trạng thái: {orderDetails.isPaid ? "Đã thanh toán" : "Chưa thanh toán"}</p>
                    </div>
                    <div>
                        <h4 className='text-lg font-semibold mb-2'>Thông tin giao hàng</h4>
                        <p>Phương thức giao hàng: {orderDetails.shippingMethod}</p>
                        <p>
                            Địa chỉ: {`${orderDetails.shippingAddress.city}, ${orderDetails.shippingAddress.country}`}
                        </p>
                    </div>
                </div>

                <div className='overflow-x-auto'>
                    <h4 className='text-lg font-semibold mb-4'>Danh sách sản phẩm</h4>
                    <table className='min-w-full text-gray-600 mb-4'>
                        <thead className='bg-gray-100 text-center'>
                            <tr>
                                <th className='py-2 px-4'>Sản phẩm</th>
                                <th className='py-2 px-4'>Đơn giá</th>
                                <th className='py-2 px-4'>Số lượng</th>
                                <th className='py-2 px-4'>Tổng cộng</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orderDetails.orderItems.map((item) => (
                                <tr key={item.productId} className='border-b text-center'>
                                    <td className='py-2 px-4 flex items-center'>
                                        <img src={item.image}
                                         alt={item.name}
                                         className='w-12 h-12 object-cover rounded-lg mr-4' />
                                        <Link to={`/product/${item.productId}`}
                                         className='text-blue-500 hover:underline'>
                                            {item.name}
                                        </Link>
                                    </td>
                                    <td className='py-2 px-4'>{formatter(item.price)}</td>
                                    <td className='py-2 px-4'>{item.quantity}</td>
                                    <td className='py-2 px-4'>{formatter(item.price * item.quantity)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Link to="/my-orders" className='text-blue-500 hover:underline'>
                    Quay lại đơn hàng của tôi
                </Link>
            </div>
        )}
    </div>
  )
}

export default OrderDetails