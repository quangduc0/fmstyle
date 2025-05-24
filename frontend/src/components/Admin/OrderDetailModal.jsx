import React, { useState, useEffect } from 'react'
import { formatter } from '../../utils/fomater'
import { getVietnameseColor } from '../../utils/colorMap';

const OrderDetailModal = ({ isOpen, onClose, order, formatDateVN, handleStatusChange, handlePaymentStatusChange, paymentStatusMap }) => {
    // Thêm state local để theo dõi trạng thái đơn hàng và thanh toán
    const [localOrder, setLocalOrder] = useState(order);

    // Cập nhật state local khi prop order thay đổi
    useEffect(() => {
        if (order) {
            setLocalOrder(order);
        }
    }, [order]);

    if (!isOpen || !localOrder) return null;

    // Hàm xử lý thay đổi trạng thái đơn hàng
    const handleLocalStatusChange = (orderId, status) => {
        handleStatusChange(orderId, status, localOrder);
        setLocalOrder({ ...localOrder, status }); // Cập nhật UI ngay lập tức
    };

    // Hàm xử lý thay đổi trạng thái thanh toán
    const handleLocalPaymentStatusChange = (orderId, paymentStatus) => {
        handlePaymentStatusChange(orderId, paymentStatus, localOrder);
        setLocalOrder({ ...localOrder, paymentStatus }); // Cập nhật UI ngay lập tức
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
                {/* Phần header modal */}
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-xl font-semibold">Chi tiết đơn hàng #{localOrder._id}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-auto p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Phần thông tin đơn hàng */}
                        <div>
                            <h4 className="font-semibold text-lg mb-3 border-b pb-2">Thông tin đơn hàng</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Mã đơn hàng:</span>
                                    <span className="font-medium">#{localOrder._id}</span>
                                </div>
                                {/* Thay đổi hiển thị tên khách hàng từ shippingAddress */}
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Khách hàng:</span>
                                    <span className="font-medium">
                                        {localOrder.shippingAddress?.lastName} {localOrder.shippingAddress?.firstName}
                                    </span>
                                </div>
                                {/* Thêm hiển thị số điện thoại */}
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Số điện thoại:</span>
                                    <span className="font-medium">{localOrder.shippingAddress?.phone || "Không có"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Ngày đặt hàng:</span>
                                    <span className="font-medium">{formatDateVN(localOrder.createdAt)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Địa chỉ giao hàng:</span>
                                    <span className="font-medium">{localOrder.shippingAddress?.address}, {localOrder.shippingAddress?.city}, {localOrder.shippingAddress?.country}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Số lượng mặt hàng:</span>
                                    <span className="font-medium">{localOrder.orderItems?.length || 0}</span>
                                </div>
                            </div>
                        </div>

                        {/* Phần thanh toán và trạng thái */}
                        <div>
                            <h4 className="font-semibold text-lg mb-3 border-b pb-2">Thanh toán & Trạng thái</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tổng giá:</span>
                                    <span className="font-medium text-green-600">{formatter(localOrder.totalPrice)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Phương thức thanh toán:</span>
                                    <span className="font-medium">
                                        {localOrder.paymentMethod === "cod" ? "Thanh toán khi nhận hàng" : localOrder.paymentMethod}
                                    </span>
                                </div>
                                {/* Sửa đổi phần trạng thái đơn hàng */}
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Trạng thái đơn hàng:</span>
                                    <select
                                        value={localOrder.status}
                                        onChange={(e) => handleLocalStatusChange(localOrder._id, e.target.value)}
                                        className="bg-gray-50 border text-gray-900 text-sm rounded-lg px-3 py-1.5"
                                    >
                                        <option value="Processing">Đang xử lý</option>
                                        <option value="Shipped">Đang giao hàng</option>
                                        <option value="Delivered">Đã giao</option>
                                        <option value="Cancelled">Đã hủy</option>
                                    </select>
                                </div>
                                {/* Sửa đổi phần trạng thái thanh toán */}
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Trạng thái thanh toán:</span>
                                    <div className="flex flex-col items-end">
                                        <span className={`mb-2 px-2 py-1 rounded text-sm ${localOrder.paymentStatus === "paid"
                                                ? "bg-green-100 text-green-800"
                                                : localOrder.paymentStatus === "unpaid"
                                                    ? "bg-red-100 text-red-800"
                                                    : "bg-yellow-100 text-yellow-800"
                                            }`}>
                                            {paymentStatusMap[localOrder.paymentStatus]}
                                        </span>

                                        <select
                                            value=""
                                            onChange={(e) => {
                                                if (e.target.value) {
                                                    handleLocalPaymentStatusChange(localOrder._id, e.target.value);
                                                    e.target.value = "";
                                                }
                                            }}
                                            className="border rounded px-2 py-1 text-sm"
                                        >
                                            <option value="">Cập nhật</option>
                                            <option value="pending">Chờ xác nhận thanh toán</option>
                                            <option value="paid">Đã thanh toán</option>
                                            <option value="unpaid">Chưa thanh toán</option>
                                            <option value="failed">Thanh toán thất bại</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Phần danh sách sản phẩm */}
                    <div className="mt-6">
                        <h4 className="font-semibold text-lg mb-3 border-b pb-2">Danh sách sản phẩm</h4>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sản phẩm</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số lượng</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {localOrder.orderItems && localOrder.orderItems.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="h-16 w-16 object-cover rounded"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                                {item.color && (
                                                    <div className="text-sm text-gray-500">
                                                        Màu: {getVietnameseColor(item.color)}
                                                    </div>
                                                )}
                                                {item.size && (
                                                    <div className="text-sm text-gray-500">Size: {item.size}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatter(item.price)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {item.quantity}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {formatter(item.price * item.quantity)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Footer modal */}
                <div className="p-4 border-t flex justify-between">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                    >
                        Đóng
                    </button>
                    <div className="text-xl font-bold text-green-600">
                        Tổng cộng: {formatter(localOrder.totalPrice)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailModal