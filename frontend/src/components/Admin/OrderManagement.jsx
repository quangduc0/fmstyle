import React, { useEffect } from 'react'
import { formatter } from '../../utils/fomater'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom';
import { fetchAllOrders, updateOrderStatus, updatePaymentStatus } from '../../redux/slices/adminOrderSlice';
import { toast } from 'sonner';
import { paymentStatusMap } from '../../utils/paymentStatusMap';

const OrderManagement = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {user} = useSelector((state) => state.auth);
    const {orders, loading, error} = useSelector((state) => state.adminOrders);

    useEffect(() => {
        if(!user || user.role !== "Quản trị viên"){
            navigate("/");
        } else {
            dispatch(fetchAllOrders());
        }
    }, [dispatch, user, navigate])

    const handleStatusChange = (orderId, status) => {
        dispatch(updateOrderStatus({id: orderId, status}));
    }

    const handlePaymentStatusChange = (orderId, paymentStatus) => {
        dispatch(updatePaymentStatus({id: orderId, paymentStatus}))
            .then(() => {
                toast.success("Cập nhật trạng thái thanh toán thành công");
            })
            .catch((err) => {
                toast.error("Cập nhật trạng thái thanh toán thất bại");
            });
    }

    if(loading) return <p>Đang tải...</p>;
    if(error) return <p>Lỗi: {error}</p>;

  return (
    <div className='max-w-7xl mx-auto p-6'>
        <h2 className='text-2xl font-bold mb-6'>Quản lý đơn hàng</h2>

        <div className='overflow-x-auto shadow-md sm:rounded-lg'>
            <table className='min-w-full text-left text-gray-500'>
                <thead className='bg-gray-100 text-xs uppercase text-gray-700'>
                    <tr>
                        <th className='py-3 px-4'>Mã đơn hàng</th>
                        <th className='py-3 px-4'>Khách hàng</th>
                        <th className='py-3 px-4'>Tổng giá</th>
                        <th className='py-3 px-4'>Phương thức</th>
                        <th className='py-3 px-4'>Trạng thái</th>
                        <th className='py-3 px-4'>Thanh toán</th>
                        <th className='py-3 px-4'>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.length > 0? (
                        orders.map((order) => (
                            <tr key={order._id}
                             className='border-b hover:bg-gray-50 cursor-pointer' >
                                <td className='py-4 px-4 font-medium text-gray-900 whitespace-nowrap'>
                                    #{order._id}
                                </td>
                                <td className='p-4'>{order.user.name}</td>
                                <td className='p-4'>{formatter(order.totalPrice)}</td>
                                <td className='p-4'>
                                    {order.paymentMethod === "cod" ? "Thanh toán khi nhận hàng" : order.paymentMethod}
                                </td>
                                <td className='p-4'>
                                    <select value={order.status}
                                     onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                     className='bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-lg
                                     focus:ring-blue-500 focus:border-blue-500 block p-2.5' >
                                        <option value="Processing">Đang xử lý</option>
                                        <option value="Shipped">Đang giao hàng</option>
                                        <option value="Delivered">Đã giao</option>
                                        <option value="Cancelled">Đã hủy</option>
                                    </select>
                                </td>
                                <td className='p-4'>
                                    <div className="flex flex-col items-start">
                                        <span className={`mb-2 px-2 py-1 rounded text-sm ${
                                            order.paymentStatus === "paid" 
                                                ? "bg-green-100 text-green-800" 
                                                : order.paymentStatus === "unpaid" 
                                                ? "bg-red-100 text-red-800" 
                                                : "bg-yellow-100 text-yellow-800"
                                        }`}>
                                            {paymentStatusMap[order.paymentStatus]}
                                        </span>
                                        
                                        <select 
                                            value=""
                                            onChange={(e) => {
                                                if (e.target.value) {
                                                    handlePaymentStatusChange(order._id, e.target.value);
                                                    e.target.value = "";
                                                }
                                            }}
                                            className="mt-1 border rounded px-2 py-1 text-sm"
                                        >
                                            <option value="">Cập nhật</option>
                                            <option value="pending">Đang xử lý</option>
                                            <option value="paid">Đã thanh toán</option>
                                            <option value="unpaid">Chưa thanh toán</option>
                                            <option value="failed">Thanh toán thất bại</option>
                                        </select>
                                    </div>
                                </td>
                                <td className='p-4'>
                                    <button onClick={() => handleStatusChange(order._id, "Shipped")}
                                     className='bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600'>
                                        Xác nhận giao hàng
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={7} className='p-4 text-center text-gray-500'>
                                Không tìm thấy đơn hàng.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  )
}

export default OrderManagement