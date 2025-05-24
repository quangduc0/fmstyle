// UserOrderModal.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrdersByUser, updateOrderStatus, updatePaymentStatus, updateProductInventory } from '../../redux/slices/adminOrderSlice';
import { fetchAdminProducts } from '../../redux/slices/adminProductSlice';
import OrderDetailModal from './OrderDetailModal';
import { formatter } from '../../utils/fomater';
import { paymentStatusMap } from '../../utils/paymentStatusMap';
import { toast } from 'sonner';

const UserOrderModal = ({ isOpen, onClose, user }) => {
  const dispatch = useDispatch();
  const { userOrders, loading } = useSelector((state) => state.adminOrders);
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      dispatch(fetchOrdersByUser(user._id));
    }
  }, [isOpen, user, dispatch]);

  const formatDateVN = (date) => {
    if (!date) return '';
    if (typeof date === 'string') date = new Date(date);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const showOrderDetail = (order) => {
    setSelectedOrder(order);
    setDetailModalOpen(true);
  };

  const handleStatusChange = (orderId, status, order) => {
    if (selectedOrder && selectedOrder._id === orderId) {
      setSelectedOrder({...selectedOrder, status});
    }
    
    dispatch(updateOrderStatus({ id: orderId, status }))
      .then((result) => {
        toast.success("Cập nhật trạng thái đơn hàng thành công");
        
        if (status === 'Delivered' && order.paymentStatus === 'paid') {
          dispatch(updateProductInventory(orderId))
            .then((inventoryResult) => {
              if (inventoryResult.meta?.requestStatus === 'fulfilled') {
                toast.success("Cập nhật tồn kho thành công");
                dispatch(fetchAdminProducts());
              }
            })
            .catch((err) => {
              toast.error("Cập nhật tồn kho thất bại");
            });
        }
        
        dispatch(fetchOrdersByUser(user._id)); // Tải lại danh sách đơn hàng của user
      })
      .catch((err) => {
        toast.error("Cập nhật trạng thái đơn hàng thất bại");
      });
  };

  const handlePaymentStatusChange = (orderId, paymentStatus, order) => {
    if (selectedOrder && selectedOrder._id === orderId) {
      setSelectedOrder({...selectedOrder, paymentStatus});
    }
    
    dispatch(updatePaymentStatus({ id: orderId, paymentStatus }))
      .then(() => {
        toast.success("Cập nhật trạng thái thanh toán thành công");
        
        if (paymentStatus === 'paid' && order.status === 'Delivered') {
          dispatch(updateProductInventory(orderId))
            .then((result) => {
              if (result.meta.requestStatus === 'fulfilled') {
                toast.success("Cập nhật tồn kho thành công");
                dispatch(fetchAdminProducts());
              }
            })
            .catch((error) => {
              toast.error("Cập nhật tồn kho thất bại: " + error.message);
            });
        }
        
        dispatch(fetchOrdersByUser(user._id)); // Tải lại danh sách đơn hàng của user
      })
      .catch((err) => {
        toast.error("Cập nhật trạng thái thanh toán thất bại");
      });
  };

  if (!isOpen || !user) return null;

  const totalOrders = userOrders?.length || 0;
  const totalSpent = userOrders?.reduce((total, order) => total + order.totalPrice, 0) || 0;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
          {/* Header với thông tin người dùng */}
          <div className="p-4 border-b">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Đơn hàng của người dùng</h3>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Thông tin người dùng */}
            <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Thông tin người dùng</h4>
                <div className="space-y-1">
                  <p><span className="font-medium">Tên:</span> {user.name}</p>
                  <p><span className="font-medium">Email:</span> {user.email}</p>
                  <p><span className="font-medium">Vai trò:</span> {user.role}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Thống kê đơn hàng</h4>
                <div className="space-y-1">
                  <p><span className="font-medium">Tổng đơn hàng:</span> {totalOrders}</p>
                  <p><span className="font-medium">Tổng chi tiêu:</span> <span className="text-green-600">{formatter(totalSpent)}</span></p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Trạng thái</h4>
                <div className="space-y-1">
                  <p><span className="font-medium">Đơn đã giao:</span> {userOrders?.filter(o => o.status === 'Delivered').length || 0}</p>
                  <p><span className="font-medium">Đơn đang xử lý:</span> {userOrders?.filter(o => o.status === 'Processing').length || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Danh sách đơn hàng */}
          <div className="flex-1 overflow-auto p-4">
            {loading ? (
              <div className="text-center py-8">Đang tải danh sách đơn hàng...</div>
            ) : userOrders && userOrders.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200 text-center">
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
                  {userOrders.map((order) => (
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
                        <span className={`px-2 py-1 rounded text-sm ${
                          order.status === "Processing"
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
              <div className="text-center py-8 text-gray-500">Người dùng này chưa có đơn hàng nào</div>
            )}
          </div>

          {/* Footer */}
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

      {/* Order Detail Modal */}
      <OrderDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        order={selectedOrder}
        formatDateVN={formatDateVN}
        handleStatusChange={handleStatusChange}
        handlePaymentStatusChange={handlePaymentStatusChange}
        paymentStatusMap={paymentStatusMap}
      />
    </>
  );
};

export default UserOrderModal