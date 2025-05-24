import React, { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { formatter } from './../utils/fomater'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAdminProducts } from '../redux/slices/adminProductSlice'
import { fetchAllOrders } from '../redux/slices/adminOrderSlice'
import { Bar } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js'
import DatePickerVN from '../components/Admin/DatePickerVN'

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
)



const AdminHome = () => {
    const dispatch = useDispatch();
    const { products, loading: productsLoading, error: productsError } = useSelector((state) => state.adminProducts);
    const { orders, totalOrders, totalSales, loading: ordersLoading, error: ordersError } = useSelector((state) => state.adminOrders);
    const [soldProductsDetails, setSoldProductsDetails] = useState([]);

    const [dateError, setDateError] = useState('');

    const [startDateISO, setStartDateISO] = useState('');
    const [endDateISO, setEndDateISO] = useState('');

    const [filteredOrders, setFilteredOrders] = useState([]);
    const [filteredSales, setFilteredSales] = useState(0);
    const [filteredProductsSold, setFilteredProductsSold] = useState(0);

    const [todayOrders, setTodayOrders] = useState([]);
    const [todaySales, setTodaySales] = useState(0);
    const [todayProductsSold, setTodayProductsSold] = useState(0);

    const [chartMinWidth, setChartMinWidth] = useState('800px');

    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [
            {
                label: 'Doanh thu',
                data: [],
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
                barThickness: 'flex',
                maxBarThickness: 40,
                categoryPercentage: 0.8,
                barPercentage: 0.8,
                yAxisID: 'y',
            },
            {
                label: 'Sản phẩm đã bán',
                data: [],
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                barThickness: 'flex',
                maxBarThickness: 40,
                categoryPercentage: 0.8,
                barPercentage: 0.8,
                yAxisID: 'y1',
            }
        ]
    });

    useEffect(() => {
        dispatch(fetchAdminProducts());
        dispatch(fetchAllOrders());
    }, [dispatch]);

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

    const getVNTime = () => {
        const now = new Date();
        const timestamp = now.getTime();
        const tzOffset = now.getTimezoneOffset();
        const vnOffset = -420;
        const vnTimestamp = timestamp + (tzOffset + vnOffset) * 60000;

        const vnDate = new Date(vnTimestamp);

        return vnDate;
    };

    const countTotalProducts = (orderArray) => {
        return orderArray.reduce((total, order) => {
            if (order.orderItems && Array.isArray(order.orderItems)) {
                return total + order.orderItems.reduce((itemTotal, item) =>
                    itemTotal + (parseInt(item.quantity) || 0), 0);
            }
            else if (order.items && Array.isArray(order.items)) {
                return total + order.items.reduce((itemTotal, item) =>
                    itemTotal + (parseInt(item.quantity) || 0), 0);
            }
            return total;
        }, 0);
    };

    const logOrderStructure = (orders) => {
        if (orders && orders.length > 0) {
            console.log("Sample order structure:", JSON.stringify(orders[0], null, 2));
            console.log("Order items:", orders[0].items || orders[0].orderItems || "No items found");
        }
    };

    useEffect(() => {
        if (orders && orders.length > 0) {
            logOrderStructure(orders);

            const today = getVNTime();
            today.setHours(0, 0, 0, 0);

            const ordersToday = orders.filter(order => {
                const orderDate = new Date(order.createdAt);
                orderDate.setHours(0, 0, 0, 0);
                return orderDate.getTime() === today.getTime();
            });

            const sales = ordersToday.reduce((total, order) => total + Number(order.totalPrice || 0), 0);

            const productsSold = countTotalProducts(ordersToday);

            console.log("Today's products sold:", productsSold);

            setTodayOrders(ordersToday);
            setTodaySales(sales);
            setTodayProductsSold(productsSold);

            const year = today.getFullYear();
            const month = (today.getMonth() + 1).toString().padStart(2, '0');
            const day = today.getDate().toString().padStart(2, '0');
            const todayISO = `${year}-${month}-${day}`;

            setStartDateISO(todayISO);
            setEndDateISO(todayISO);

            setFilteredOrders(ordersToday);
            setFilteredSales(sales);
            setFilteredProductsSold(productsSold);

            setChartData({
                labels: [formatDateVN(today)],
                datasets: [
                    {
                        label: 'Doanh thu',
                        data: [sales],
                        backgroundColor: 'rgba(53, 162, 235, 0.5)',
                        barThickness: 'flex',
                        maxBarThickness: 40,
                        categoryPercentage: 0.8,
                        barPercentage: 0.8,
                        yAxisID: 'y',
                    },
                    {
                        label: 'Sản phẩm đã bán',
                        data: [productsSold],
                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                        barThickness: 'flex',
                        maxBarThickness: 40,
                        categoryPercentage: 0.8,
                        barPercentage: 0.8,
                        yAxisID: 'y1',
                    }
                ]
            });

            setChartMinWidth('800px');
        }
    }, [orders]);

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

        const sales = filtered.reduce((total, order) => total + Number(order.totalPrice || 0), 0);

        const productsSold = countTotalProducts(filtered);

        const soldProductsMap = {};

        filtered.forEach(order => {
            const items = order.orderItems || order.items || [];
            if (Array.isArray(items)) {
                items.forEach(item => {
                    const productId = item.product?._id || item.product || item.productId;
                    if (!productId) return;

                    if (!soldProductsMap[productId]) {
                        soldProductsMap[productId] = {
                            productId,
                            name: item.name,
                            image: item.image,
                            price: item.price,
                            quantity: 0,
                            orderDates: []
                        };
                    }

                    soldProductsMap[productId].quantity += parseInt(item.quantity) || 0;
                    soldProductsMap[productId].orderDates.push(order.createdAt);
                });
            }
        });

        // Chuyển thành mảng và sắp xếp theo số lượng
        const soldProductsList = Object.values(soldProductsMap)
            .sort((a, b) => b.quantity - a.quantity);

        console.log("Chi tiết sản phẩm đã bán:", soldProductsList);
        setSoldProductsDetails(soldProductsList);

        setFilteredOrders(filtered);
        setFilteredSales(sales);
        setFilteredProductsSold(productsSold);

        const dateArray = [];
        const salesByDate = {};
        const productsByDate = {};

        let currentDate = new Date(start);
        while (currentDate <= end) {
            const dateString = formatDateVN(currentDate);
            dateArray.push(dateString);
            salesByDate[dateString] = 0;
            productsByDate[dateString] = 0;

            currentDate.setDate(currentDate.getDate() + 1);
        }

        filtered.forEach(order => {
            const orderDate = new Date(order.createdAt);
            const orderDateString = formatDateVN(orderDate);

            if (salesByDate[orderDateString] !== undefined) {
                salesByDate[orderDateString] += Number(order.totalPrice || 0);

                if (order.orderItems && Array.isArray(order.orderItems)) {
                    order.orderItems.forEach(item => {
                        productsByDate[orderDateString] += parseInt(item.quantity) || 0;
                    });
                } else if (order.items && Array.isArray(order.items)) {
                    order.items.forEach(item => {
                        productsByDate[orderDateString] += parseInt(item.quantity) || 0;
                    });
                }
            }
        });

        console.log("Sales by date:", salesByDate);
        console.log("Products by date:", productsByDate);

        setChartData({
            labels: dateArray,
            datasets: [
                {
                    label: 'Doanh thu',
                    data: dateArray.map(date => Number(salesByDate[date] || 0)),
                    backgroundColor: 'rgba(53, 162, 235, 0.5)',
                    barThickness: 'flex',
                    maxBarThickness: 40,
                    categoryPercentage: 0.8,
                    barPercentage: 0.8,
                    yAxisID: 'y',
                },
                {
                    label: 'Sản phẩm đã bán',
                    data: dateArray.map(date => Number(productsByDate[date] || 0)),
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    barThickness: 'flex',
                    maxBarThickness: 40,
                    categoryPercentage: 0.8,
                    barPercentage: 0.8,
                    yAxisID: 'y1',
                }
            ]
        });

        const minWidth = Math.max(800, dateArray.length * 60);
        setChartMinWidth(`${minWidth}px`);
    };

    const statusLabel = (status) => {
        switch (status) {
            case 'Processing':
                return 'Đang xử lý';
            case 'Shipped':
                return 'Đang giao hàng';
            case 'Delivered':
                return 'Đã giao';
            case 'Cancelled':
                return 'Đã hủy';
            default:
                return status;
        }
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
                type: 'linear',
                display: true,
                position: 'left',
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Doanh thu (VND)',
                    color: 'rgba(53, 162, 235, 1)',
                    font: {
                        weight: 'bold'
                    }
                },
                ticks: {
                    callback: function (value) {
                        if (value >= 1000000) {
                            return (value / 1000000).toLocaleString() + 'M';
                        } else if (value >= 1000) {
                            return (value / 1000).toLocaleString() + 'K';
                        }
                        return value;
                    }
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)',
                }
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                beginAtZero: true,
                min: 0,
                suggestedMax: 10,
                title: {
                    display: true,
                    text: 'Sản phẩm đã bán',
                    color: 'rgba(255, 99, 132, 1)',
                    font: {
                        weight: 'bold'
                    }
                },
                grid: {
                    drawOnChartArea: false,
                }
            }
        },
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Biểu đồ doanh thu theo ngày',
                font: {
                    size: 16
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }

                        if (context.dataset.yAxisID === 'y') {
                            label += formatter(context.parsed.y);
                        } else {
                            label += context.parsed.y + ' sản phẩm';
                        }

                        return label;
                    }
                }
            }
        },
    };

    return (
        <div className='max-w-7xl mx-auto p-6'>
            <h1 className='text-3xl font-bold mb-6'>Giao diện quản lý</h1>

            {productsLoading || ordersLoading ? (
                <p>Đang tải...</p>
            ) : productsError ? (
                <p className='text-red-500'>Lỗi khi lấy sản phẩm: {productsError}</p>
            ) : ordersError ? (
                <p className='text-red-500'>Lỗi khi lấy đơn hàng: {ordersError}</p>
            ) : (
                <>
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
                        <div className='p-4 shadow-md rounded-lg bg-white'>
                            <h2 className='text-xl font-semibold'>Doanh thu hôm nay</h2>
                            <p className='text-2xl'>{formatter(todaySales)}</p>
                        </div>
                        <div className='p-4 shadow-md rounded-lg bg-white'>
                            <h2 className='text-xl font-semibold'>Đơn hàng hôm nay</h2>
                            <p className='text-2xl'>{todayOrders.length}</p>
                            <Link to="/admin/orders"
                                className='text-blue-500 hover:underline'>
                                Quản lý đơn hàng
                            </Link>
                        </div>
                        <div className='p-4 shadow-md rounded-lg bg-white'>
                            <h2 className='text-xl font-semibold'>Sản phẩm đã bán hôm nay</h2>
                            <p className='text-2xl'>{todayProductsSold}</p>
                        </div>
                        <div className='p-4 shadow-md rounded-lg bg-white'>
                            <h2 className='text-xl font-semibold'>Tổng số sản phẩm</h2>
                            <p className='text-2xl'>{products.length}</p>
                            <Link to="/admin/products"
                                className='text-blue-500 hover:underline'>
                                Quản lý sản phẩm
                            </Link>
                        </div>
                    </div>

                    <div className='bg-white p-4 shadow-md rounded-lg mb-8'>
                        <h2 className='text-xl font-semibold mb-4'>Thống kê theo khoảng thời gian</h2>

                        {dateError && (
                            <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded-md">
                                {dateError}
                            </div>
                        )}

                        <div className='flex flex-wrap items-center gap-4'>
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

                        <div className='mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4'>
                            <div className='bg-gray-50 p-3 rounded-md border'>
                                <p className='text-lg font-semibold'>
                                    Tổng doanh thu: <span className='text-blue-600'>{formatter(filteredSales)}</span>
                                </p>
                            </div>
                            <div className='bg-gray-50 p-3 rounded-md border'>
                                <p className='text-lg font-semibold'>
                                    Số đơn hàng: <span className='text-blue-600'>{filteredOrders.length}</span>
                                </p>
                                <Link
                                    to="/admin/orders"
                                    state={{
                                        filterDates: {
                                            start: startDateISO,
                                            end: endDateISO
                                        }
                                    }}
                                    className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 inline-flex items-center"
                                >
                                    <span>Xem chi tiết đơn hàng</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                            <div className='bg-gray-50 p-3 rounded-md border'>
                                <p className='text-lg font-semibold'>
                                    Sản phẩm đã bán: <span className='text-rose-600'>{filteredProductsSold}</span>
                                </p>
                                <Link
                                    to={`/admin/products`}
                                    state={{ filterDates: { start: startDateISO, end: endDateISO } }}
                                    className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 inline-flex items-center"
                                >
                                    <span>Xem chi tiết</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </div>

                        <div className='mt-6 h-96 overflow-x-auto'>
                            <div style={{ minWidth: chartMinWidth, height: '100%' }}>
                                <Bar options={chartOptions} data={chartData} />
                            </div>
                        </div>
                    </div>

                    {/* <div className='bg-white p-4 shadow-md rounded-lg'>
                        <h2 className='text-2xl font-bold mb-4'>Danh sách đơn hàng</h2>
                        <div className='overflow-x-auto'>
                            <table className='min-w-full text-left text-gray-500'>
                                <thead className='bg-gray-100 text-xs uppercase text-gray-700'>
                                    <tr>
                                        <th className='py-3 px-4'>Mã đơn hàng</th>
                                        <th className='py-3 px-4'>Khách hàng</th>
                                        <th className='py-3 px-4'>Ngày tạo</th>
                                        <th className='py-3 px-4'>Tổng đơn giá</th>
                                        <th className='py-3 px-4'>Số sản phẩm</th>
                                        <th className='py-3 px-4'>Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.length > 0 ? (
                                        filteredOrders.map((order) => {
                                            let productCount = 0;
                                            if (order.orderItems && Array.isArray(order.orderItems)) {
                                                productCount = order.orderItems.reduce((total, item) =>
                                                    total + (parseInt(item.quantity) || 0), 0);
                                            } else if (order.items && Array.isArray(order.items)) {
                                                productCount = order.items.reduce((total, item) =>
                                                    total + (parseInt(item.quantity) || 0), 0);
                                            }

                                            return (
                                                <tr key={order._id}
                                                    className='border-b hover:bg-gray-50 cursor-pointer'>
                                                    <td className='p-4'>{order._id}</td>
                                                    <td className='p-4'>{order.user ? order.user.name : 'N/A'}</td>
                                                    <td className='p-4'>{formatDateVN(order.createdAt)}</td>
                                                    <td className='p-4'>{formatter(order.totalPrice)}</td>
                                                    <td className='p-4'>{productCount}</td>
                                                    <td className='p-4'>{statusLabel(order.status)}</td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className='p-4 text-center text-gray-500'>
                                                Không có đơn hàng nào trong khoảng thời gian này.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div> */}
                </>
            )}
        </div>
    )
}

export default AdminHome