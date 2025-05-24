import React from 'react';
import { formatter } from '../../utils/fomater';

const OrderModal = ({ isOpen, onClose, title, orders, formatDateVN, handleStatusChange, handlePaymentStatusChange, paymentStatusMap, showOrderDetail }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-xl font-semibold">{title}</h3>
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
          {orders.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className='bg-gray-100 text-xs uppercase text-gray-700'>
                <tr>
                  <th className='py-3 px-4'>Mã đơn hàng</th>
                  <th className='py-3 px-4'>Ngày đặt hàng</th>
                  <th className='py-3 px-4'>Tổng giá</th>
                  <th className='py-3 px-4'>Phương thức</th>
                  <th className='py-3 px-4'>Trạng thái</th>
                  <th className='py-3 px-4'>Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id}
                    className='border-b hover:bg-gray-50 cursor-pointer'
                    onClick={() => showOrderDetail(order)}>
                    <td className='py-4 px-4 font-medium text-gray-900 whitespace-nowrap'>
                      #{order._id}
                    </td>
                    <td className='p-4'>{formatDateVN(order.createdAt)}</td>
                    <td className='p-4'>{formatter(order.totalPrice)}</td>
                    <td className='p-4'>
                      {order.paymentMethod === "cod" ? "Thanh toán khi nhận hàng" : order.paymentMethod}
                    </td>
                    <td className='p-4'>
                      <span className={`px-2 py-1 rounded text-sm ${order.status === "Processing"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.status === "Shipped"
                            ? "bg-blue-100 text-blue-800"
                            : order.status === "Delivered"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                        }`}>
                        {order.status === "Processing"
                          ? "Đang xử lý"
                          : order.status === "Shipped"
                            ? "Đang giao hàng"
                            : order.status === "Delivered"
                              ? "Đã giao"
                              : "Đã hủy"}
                      </span>
                    </td>
                    <td className='p-4'>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          showOrderDetail(order);
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm"
                      >
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 text-gray-500">Không có đơn hàng nào</div>
          )}
        </div>

        <div className="p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderModal