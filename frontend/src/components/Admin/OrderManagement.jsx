import React, { useEffect, useState, useRef } from 'react'
import { formatter } from '../../utils/fomater'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchAllOrders, updateOrderStatus, updatePaymentStatus, updateProductInventory } from '../../redux/slices/adminOrderSlice';
import { toast } from 'sonner';
import { paymentStatusMap } from '../../utils/paymentStatusMap';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js'
import OrderModal from './OrderModal';
import OrderDetailModal from './OrderDetailModal';
import DatePickerVN from './DatePickerVN';
import { fetchAdminProducts } from '../../redux/slices/adminProductSlice';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
)



const OrderManagement = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const receivedFilterDates = location.state?.filterDates;

    const { user } = useSelector((state) => state.auth);
    const { orders, loading, error } = useSelector((state) => state.adminOrders);

    const [totalOrders, setTotalOrders] = useState(0);
    const [totalSales, setTotalSales] = useState(0);

    const [processingOrders, setProcessingOrders] = useState([]);
    const [shippedOrders, setShippedOrders] = useState([]);
    const [deliveredOrders, setDeliveredOrders] = useState([]);
    const [cancelledOrders, setCancelledOrders] = useState([]);

    const [codOrders, setCodOrders] = useState([]);
    const [paypalOrders, setPaypalOrders] = useState([]);

    const [paidOrders, setPaidOrders] = useState([]);
    const [unpaidOrders, setUnpaidOrders] = useState([]);
    const [pendingPaymentOrders, setPendingPaymentOrders] = useState([]);
    const [failedPaymentOrders, setFailedPaymentOrders] = useState([]);

    const [todayOrders, setTodayOrders] = useState([]);
    const [currentDate, setCurrentDate] = useState('');

    const [startDateISO, setStartDateISO] = useState('');
    const [endDateISO, setEndDateISO] = useState('');
    const [dateError, setDateError] = useState('');

    const [filteredOrders, setFilteredOrders] = useState([]);

    const [modalOpen, setModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalOrders, setModalOrders] = useState([]);

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);

    const [chartMinWidth, setChartMinWidth] = useState('800px');
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [
            {
                label: 'Số đơn hàng',
                data: [],
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
                borderColor: 'rgba(53, 162, 235, 1)',
                borderWidth: 1,
            }
        ]
    });

    useEffect(() => {
        if (!user || user.role !== "Quản trị viên") {
            navigate("/");
        } else {
            dispatch(fetchAllOrders());
        }
    }, [dispatch, user, navigate])

    const getVNTime = () => {
        const now = new Date();
        const timestamp = now.getTime();
        const tzOffset = now.getTimezoneOffset();
        const vnOffset = -420;
        const vnTimestamp = timestamp + (tzOffset + vnOffset) * 60000;

        const vnDate = new Date(vnTimestamp);

        return vnDate;
    };

    const formatDateVN = (date) => {
        if (!date) return '';
        if (typeof date === 'string') date = new Date(date);

        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const toVNFormat = (dateString) => {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    const showModal = (title, ordersList) => {
        setModalTitle(title);
        setModalOrders(ordersList);
        setModalOpen(true);
    };

    const showOrderDetail = (order) => {
        setSelectedOrder(order);
        setDetailModalOpen(true);
        if (modalOpen) {
            setModalOpen(true);
        }
    };

    useEffect(() => {
        if (orders && orders.length > 0) {
            setTotalOrders(orders.length);
            setTotalSales(orders.reduce((total, order) => total + Number(order.totalPrice || 0), 0));

            const processing = orders.filter(order => order.status === 'Processing');
            const shipped = orders.filter(order => order.status === 'Shipped');
            const delivered = orders.filter(order => order.status === 'Delivered');
            const cancelled = orders.filter(order => order.status === 'Cancelled');

            setProcessingOrders(processing);
            setShippedOrders(shipped);
            setDeliveredOrders(delivered);
            setCancelledOrders(cancelled);

            const cod = orders.filter(order => order.paymentMethod === 'cod');
            const paypal = orders.filter(order => order.paymentMethod !== 'cod');

            setCodOrders(cod);
            setPaypalOrders(paypal);

            const paid = orders.filter(order => order.paymentStatus === 'paid');
            const unpaid = orders.filter(order => order.paymentStatus === 'unpaid');
            const pending = orders.filter(order => order.paymentStatus === 'pending');
            const failed = orders.filter(order => order.paymentStatus === 'failed');

            setPaidOrders(paid);
            setUnpaidOrders(unpaid);
            setPendingPaymentOrders(pending);
            setFailedPaymentOrders(failed);

            const today = getVNTime();
            today.setHours(0, 0, 0, 0);
            setCurrentDate(formatDateVN(today));

            const ordersToday = orders.filter(order => {
                const orderDate = new Date(order.createdAt);
                orderDate.setHours(0, 0, 0, 0);
                return orderDate.getTime() === today.getTime();
            });

            setTodayOrders(ordersToday);

            const year = today.getFullYear();
            const month = (today.getMonth() + 1).toString().padStart(2, '0');
            const day = today.getDate().toString().padStart(2, '0');
            const todayISO = `${year}-${month}-${day}`;

            setStartDateISO(todayISO);
            setEndDateISO(todayISO);

            setFilteredOrders(ordersToday);

            const initialChartData = {
                labels: [formatDateVN(today)],
                datasets: [
                    {
                        label: 'Số đơn hàng',
                        data: [ordersToday.length],
                        backgroundColor: 'rgba(53, 162, 235, 0.5)',
                        borderColor: 'rgba(53, 162, 235, 1)',
                        borderWidth: 1,
                    }
                ]
            };

            setChartData(initialChartData);

            if (receivedFilterDates && receivedFilterDates.start && receivedFilterDates.end) {
                setStartDateISO(receivedFilterDates.start);
                setEndDateISO(receivedFilterDates.end);

                setTimeout(() => {
                    handleFilterOrders();
                }, 100);
            }
        }
    }, [orders, receivedFilterDates]);

    const handleStatusChange = (orderId, status, order) => {
        if (selectedOrder && selectedOrder._id === orderId) {
            setSelectedOrder({ ...selectedOrder, status });
        }
        const updatedOrders = orders.map(o =>
            o._id === orderId ? { ...o, status } : o
        );

        dispatch(updateOrderStatus({ id: orderId, status }))
            .then((result) => {
                toast.success("Cập nhật trạng thái đơn hàng thành công");

                if (status === 'Delivered' && order.paymentStatus === 'paid') {
                    console.log("Điều kiện cập nhật tồn kho thỏa mãn, gọi API với orderId:", orderId);

                    dispatch(updateProductInventory(orderId))
                        .then((inventoryResult) => {
                            console.log("Kết quả cập nhật tồn kho:", inventoryResult);
                            if (inventoryResult.meta?.requestStatus === 'fulfilled') {
                                toast.success("Cập nhật tồn kho thành công");
                                dispatch(fetchAdminProducts());
                            } else if (inventoryResult.error) {
                                toast.error("Lỗi: " + (inventoryResult.error.message || "Không thể cập nhật tồn kho"));
                            }
                        })
                        .catch((err) => {
                            console.error("Lỗi khi cập nhật tồn kho:", err);
                            toast.error("Cập nhật tồn kho thất bại");
                        });
                }

                dispatch(fetchAllOrders());
            })
            .catch((err) => {
                console.error("Lỗi khi cập nhật trạng thái đơn hàng:", err);
                toast.error("Cập nhật trạng thái đơn hàng thất bại");
            });
    };

    const handlePaymentStatusChange = (orderId, paymentStatus, order) => {
        if (selectedOrder && selectedOrder._id === orderId) {
            setSelectedOrder({ ...selectedOrder, paymentStatus });
        }
        const updatedOrders = orders.map(o =>
            o._id === orderId ? { ...o, paymentStatus } : o
        );

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

                dispatch(fetchAllOrders());
            })
            .catch((err) => {
                toast.error("Cập nhật trạng thái thanh toán thất bại");
            });
    }

    const handleStartDateChange = (value) => {
        setStartDateISO(value);
        setDateError('');
    };

    const handleEndDateChange = (value) => {
        setEndDateISO(value);
        setDateError('');
    };

    const handleFilterOrders = () => {
        setDateError('');

        if (!startDateISO || !endDateISO) {
            setDateError('Vui lòng chọn ngày bắt đầu và ngày kết thúc');
            return;
        }

        const start = new Date(startDateISO);
        start.setHours(0, 0, 0, 0);

        const end = new Date(endDateISO);
        end.setHours(0, 0, 0, 0);

        if (start > end) {
            setDateError('Ngày bắt đầu không được sau ngày kết thúc');
            return;
        }

        const endOfDay = new Date(end);
        endOfDay.setHours(23, 59, 59, 999);

        const filtered = orders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= start && orderDate <= endOfDay;
        });

        setFilteredOrders(filtered);

        const dateArray = [];
        const ordersByDate = {};

        let currentDate = new Date(start);
        while (currentDate <= end) {
            const dateString = formatDateVN(currentDate);
            dateArray.push(dateString);
            ordersByDate[dateString] = 0;

            currentDate.setDate(currentDate.getDate() + 1);
        }

        filtered.forEach(order => {
            const orderDate = new Date(order.createdAt);
            const orderDateString = formatDateVN(orderDate);

            if (ordersByDate[orderDateString] !== undefined) {
                ordersByDate[orderDateString] += 1;
            }
        });

        setChartData({
            labels: dateArray,
            datasets: [
                {
                    label: 'Số đơn hàng',
                    data: dateArray.map(date => ordersByDate[date]),
                    backgroundColor: 'rgba(53, 162, 235, 0.5)',
                    borderColor: 'rgba(53, 162, 235, 1)',
                    borderWidth: 1,
                }
            ]
        });

        const minWidth = Math.max(800, dateArray.length * 60);
        setChartMinWidth(`${minWidth}px`);
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                grid: {
                    display: true
                },
                ticks: {
                    maxRotation: 45,
                    minRotation: 45
                }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    precision: 0,
                    stepSize: 1
                }
            }
        },
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Số lượng đơn hàng theo ngày',
                font: {
                    size: 16
                }
            },
        },
    };

    if (loading) return <p>Đang tải...</p>;
    if (error) return <p>Lỗi: {error}</p>;

    return (
        <div className='max-w-7xl mx-auto p-6'>
            <h2 className='text-2xl font-bold mb-6'>Quản lý đơn hàng</h2>
            <div className='bg-white p-4 shadow-md rounded-lg mb-8'>
                <h3 className='text-xl font-semibold mb-4'>Thống kê đơn hàng</h3>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6'>
                    <div className='p-4 border rounded-lg bg-blue-50'>
                        <h4 className='text-lg font-medium text-blue-800'>Tổng đơn hàng</h4>
                        <p className='text-2xl font-bold text-blue-600'>{totalOrders}</p>
                    </div>
                    <div className='p-4 border rounded-lg bg-green-50'>
                        <h4 className='text-lg font-medium text-green-800'>Tổng doanh thu</h4>
                        <p className='text-2xl font-bold text-green-600'>{formatter(totalSales)}</p>
                    </div>
                    <div
                        className='p-4 border rounded-lg bg-yellow-50 cursor-pointer hover:bg-yellow-100 transition'
                        onClick={() => showModal('Đơn hàng đang xử lý', processingOrders)}
                    >
                        <h4 className='text-lg font-medium text-yellow-800'>Đơn hàng đang xử lý</h4>
                        <p className='text-2xl font-bold text-yellow-600'>{processingOrders.length}</p>
                    </div>
                    <div
                        className='p-4 border rounded-lg bg-purple-50 cursor-pointer hover:bg-purple-100 transition'
                        onClick={() => showModal(`Đơn hàng ngày ${currentDate}`, todayOrders)}
                    >
                        <h4 className='text-lg font-medium text-purple-800'>Đơn hàng hôm nay</h4>
                        <p className='text-2xl font-bold text-purple-600'>{todayOrders.length}</p>
                    </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
                    <div className='p-4 border rounded-lg'>
                        <h4 className='text-lg font-medium mb-3'>Trạng thái đơn hàng</h4>
                        <div className='space-y-2'>
                            <div
                                className='flex justify-between items-center p-2 hover:bg-yellow-50 cursor-pointer rounded transition'
                                onClick={() => showModal('Đơn hàng đang xử lý', processingOrders)}
                            >
                                <span>Đơn hàng mới (chờ xử lý)</span>
                                <span className='font-semibold bg-yellow-100 text-yellow-800 px-2 py-1 rounded'>{processingOrders.length}</span>
                            </div>
                            <div
                                className='flex justify-between items-center p-2 hover:bg-blue-50 cursor-pointer rounded transition'
                                onClick={() => showModal('Đơn hàng đang vận chuyển', shippedOrders)}
                            >
                                <span>Đơn hàng đang vận chuyển</span>
                                <span className='font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded'>{shippedOrders.length}</span>
                            </div>
                            <div
                                className='flex justify-between items-center p-2 hover:bg-green-50 cursor-pointer rounded transition'
                                onClick={() => showModal('Đơn hàng đã hoàn thành', deliveredOrders)}
                            >
                                <span>Đơn hàng đã hoàn thành</span>
                                <span className='font-semibold bg-green-100 text-green-800 px-2 py-1 rounded'>{deliveredOrders.length}</span>
                            </div>
                            <div
                                className='flex justify-between items-center p-2 hover:bg-red-50 cursor-pointer rounded transition'
                                onClick={() => showModal('Đơn hàng đã hủy', cancelledOrders)}
                            >
                                <span>Đơn hàng đã hủy</span>
                                <span className='font-semibold bg-red-100 text-red-800 px-2 py-1 rounded'>{cancelledOrders.length}</span>
                            </div>
                        </div>
                    </div>

                    <div className='p-4 border rounded-lg'>
                        <h4 className='text-lg font-medium mb-3'>Phương thức thanh toán</h4>
                        <div className='space-y-2'>
                            <div
                                className='flex justify-between items-center p-2 hover:bg-indigo-50 cursor-pointer rounded transition'
                                onClick={() => showModal('Đơn hàng thanh toán khi nhận hàng', codOrders)}
                            >
                                <span>Thanh toán khi nhận hàng</span>
                                <span className='font-semibold bg-indigo-100 text-indigo-800 px-2 py-1 rounded'>{codOrders.length}</span>
                            </div>
                            <div
                                className='flex justify-between items-center p-2 hover:bg-blue-50 cursor-pointer rounded transition'
                                onClick={() => showModal('Đơn hàng thanh toán bằng PayPal', paypalOrders)}
                            >
                                <span>Thanh toán bằng PayPal</span>
                                <span className='font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded'>{paypalOrders.length}</span>
                            </div>
                        </div>

                        <h4 className='text-lg font-medium mb-3 mt-4'>Trạng thái thanh toán</h4>
                        <div className='space-y-2'>
                            <div
                                className='flex justify-between items-center p-2 hover:bg-green-50 cursor-pointer rounded transition'
                                onClick={() => showModal('Đơn hàng đã thanh toán', paidOrders)}
                            >
                                <span>Đã thanh toán</span>
                                <span className='font-semibold bg-green-100 text-green-800 px-2 py-1 rounded'>{paidOrders.length}</span>
                            </div>
                            <div
                                className='flex justify-between items-center p-2 hover:bg-red-50 cursor-pointer rounded transition'
                                onClick={() => showModal('Đơn hàng chưa thanh toán', unpaidOrders)}
                            >
                                <span>Chưa thanh toán</span>
                                <span className='font-semibold bg-red-100 text-red-800 px-2 py-1 rounded'>{unpaidOrders.length}</span>
                            </div>
                            <div
                                className='flex justify-between items-center p-2 hover:bg-yellow-50 cursor-pointer rounded transition'
                                onClick={() => showModal('Đơn hàng đang xử lý thanh toán', pendingPaymentOrders)}
                            >
                                <span>Đang xử lý</span>
                                <span className='font-semibold bg-yellow-100 text-yellow-800 px-2 py-1 rounded'>{pendingPaymentOrders.length}</span>
                            </div>
                            <div
                                className='flex justify-between items-center p-2 hover:bg-gray-50 cursor-pointer rounded transition'
                                onClick={() => showModal('Đơn hàng thanh toán thất bại', failedPaymentOrders)}
                            >
                                <span>Thanh toán thất bại</span>
                                <span className='font-semibold bg-gray-100 text-gray-800 px-2 py-1 rounded'>{failedPaymentOrders.length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className='bg-white p-4 shadow-md rounded-lg mb-8'>
                <h3 className='text-xl font-semibold mb-4'>Thống kê theo khoảng thời gian</h3>

                {dateError && (
                    <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded-md">
                        {dateError}
                    </div>
                )}

                <div className='flex flex-wrap items-center gap-4 mb-4'>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Từ ngày</label>
                        <DatePickerVN
                            value={toVNFormat(startDateISO)}
                            onChange={handleStartDateChange}
                        />
                    </div>

                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Đến ngày</label>
                        <DatePickerVN
                            value={toVNFormat(endDateISO)}
                            onChange={handleEndDateChange}
                        />
                    </div>

                    <div className='self-end mb-1'>
                        <button
                            onClick={handleFilterOrders}
                            className='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600'
                        >
                            Thống kê
                        </button>
                    </div>
                </div>

                <div className='mb-4 p-3 bg-gray-50 rounded-md border'>
                    <p className='text-lg font-semibold'>
                        Số đơn hàng: <span className='text-blue-600'>{filteredOrders.length}</span>
                    </p>
                </div>

                <div className='h-80 overflow-x-auto'>
                    <div style={{ minWidth: chartMinWidth, height: '100%' }}>
                        <Bar options={chartOptions} data={chartData} />
                    </div>
                </div>
            </div>

            <div className='bg-white p-4 shadow-md rounded-lg'>
                <h3 className='text-xl font-semibold mb-4'>
                    {startDateISO === endDateISO
                        ? `Danh sách đơn hàng ngày ${toVNFormat(startDateISO)}`
                        : 'Danh sách đơn hàng trong khoảng thời gian'}
                </h3>

                <div className='overflow-x-auto shadow-md sm:rounded-lg'>
                    <table className='min-w-full text-left text-gray-500'>
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
                        <tbody>
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map((order) => (
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
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="py-8 text-center text-gray-500">
                                        Không có đơn hàng nào trong khoảng thời gian này
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <OrderModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={modalTitle}
                orders={modalOrders}
                formatDateVN={formatDateVN}
                showOrderDetail={showOrderDetail}
                handleStatusChange={handleStatusChange}
                handlePaymentStatusChange={handlePaymentStatusChange}
                paymentStatusMap={paymentStatusMap}
            />

            <OrderDetailModal
                isOpen={detailModalOpen}
                onClose={() => setDetailModalOpen(false)}
                order={selectedOrder}
                formatDateVN={formatDateVN}
                handleStatusChange={handleStatusChange}
                handlePaymentStatusChange={handlePaymentStatusChange}
                paymentStatusMap={paymentStatusMap}
            />
        </div>
    );
};

export default OrderManagement