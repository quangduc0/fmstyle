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
import StatisticsTable from '../components/Admin/StatisticsTable'

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
    const [totalRevenue, setTotalRevenue] = useState(0); // Thêm state cho tổng doanh thu

    const [chartMinWidth, setChartMinWidth] = useState('800px');
    const [showStatisticsTable, setShowStatisticsTable] = useState(false);

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

    // Hàm kiểm tra đơn hàng hợp lệ cho doanh thu
    const isValidOrderForRevenue = (order) => {
        return order.status === 'Delivered' && order.paymentStatus === 'paid';
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

            // Tính tổng doanh thu từ TẤT CẢ đơn hàng hợp lệ
            const allValidOrders = orders.filter(isValidOrderForRevenue);
            const totalRev = allValidOrders.reduce((total, order) => 
                total + Number(order.totalPrice || 0), 0
            );
            setTotalRevenue(totalRev);

            const today = getVNTime();
            today.setHours(0, 0, 0, 0);

            const ordersToday = orders.filter(order => {
                const orderDate = new Date(order.createdAt);
                orderDate.setHours(0, 0, 0, 0);
                return orderDate.getTime() === today.getTime();
            });

            // CHỈ tính đơn hàng đã giao và đã thanh toán
            const validOrdersToday = ordersToday.filter(isValidOrderForRevenue);

            const sales = validOrdersToday.reduce((total, order) => total + Number(order.totalPrice || 0), 0);
            const productsSold = countTotalProducts(validOrdersToday);

            console.log("Today's valid orders:", validOrdersToday.length);
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

        // CHỈ tính đơn hàng đã giao và đã thanh toán cho doanh thu
        const validOrders = filtered.filter(isValidOrderForRevenue);

        const sales = validOrders.reduce((total, order) => total + Number(order.totalPrice || 0), 0);
        const productsSold = countTotalProducts(validOrders);

        const soldProductsMap = {};

        // CHỈ tính sản phẩm từ đơn hàng hợp lệ
        validOrders.forEach(order => {
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

        console.log("Chi tiết sản phẩm đã bán (chỉ đơn hợp lệ):", soldProductsList);
        setSoldProductsDetails(soldProductsList);

        setFilteredOrders(filtered); // Vẫn hiển thị tất cả đơn hàng
        setFilteredSales(sales); // Nhưng chỉ tính doanh thu từ đơn hợp lệ
        setFilteredProductsSold(productsSold); // Và sản phẩm từ đơn hợp lệ

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

        // CHỈ tính từ đơn hàng hợp lệ cho chart
        validOrders.forEach(order => {
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

        console.log("Sales by date (valid orders only):", salesByDate);
        console.log("Products by date (valid orders only):", productsByDate);

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

        const days = dateArray.length;
        if (days <= 7) {
            setChartMinWidth('800px');
        } else if (days <= 30) {
            setChartMinWidth('1200px');
        } else {
            setChartMinWidth('1600px');
        }
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Thống kê doanh thu và sản phẩm bán được',
            },
        },
        scales: {
            x: {
                beginAtZero: true,
            },
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Doanh thu (VNĐ)',
                },
                ticks: {
                    callback: function(value) {
                        return formatter(value);
                    }
                }
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Số lượng sản phẩm',
                },
                grid: {
                    drawOnChartArea: false,
                },
            },
        },
    };

    if (productsLoading || ordersLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (productsError || ordersError) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                Lỗi: {productsError || ordersError}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Trang quản trị</h1>
            </div>

            {/* Thống kê tổng quan */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                        <div className="text-blue-500">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Tổng sản phẩm</p>
                            <p className="text-2xl font-semibold text-gray-900">{products?.length || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                        <div className="text-green-500">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Tổng đơn hàng</p>
                            <p className="text-2xl font-semibold text-gray-900">{orders?.length || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
                            <p className="text-2xl font-semibold text-gray-900">{formatter(totalRevenue)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Doanh thu hôm nay</p>
                            <p className="text-2xl font-semibold text-gray-900">{formatter(todaySales)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                        <div className="text-purple-500">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Sản phẩm bán hôm nay</p>
                            <p className="text-2xl font-semibold text-gray-900">{todayProductsSold}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lọc theo ngày */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Lọc theo ngày</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <DatePickerVN
                            label="Từ ngày (DD/MM/YYYY)"
                            value={startDateISO}
                            onChange={handleStartDateChange}
                        />
                    </div>
                    <div>
                        <DatePickerVN
                            label="Đến ngày (DD/MM/YYYY)"
                            value={endDateISO}
                            onChange={handleEndDateChange}
                        />
                    </div>
                    <button
                        onClick={handleFilterOrders}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Thống kê
                    </button>
                    <button
                        onClick={() => setShowStatisticsTable(true)}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        Xem bảng thống kê
                    </button>
                </div>
                {dateError && (
                    <div className="mt-2 text-red-600 text-sm">
                        {dateError}
                    </div>
                )}
            </div>

            {/* Thống kê trong khoảng thời gian đã chọn */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                        <div className="text-blue-500">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">
                                Khoảng thời gian
                            </p>
                            <p className="text-lg font-semibold text-gray-900">
                                {startDateISO && endDateISO ? 
                                    `${toVNFormat(startDateISO)} - ${toVNFormat(endDateISO)}` : 
                                    'Chưa chọn'
                                }
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Doanh thu</p>
                            <p className="text-2xl font-semibold text-gray-900">{formatter(filteredSales)}</p>
                            <p className="text-xs text-blue-600 cursor-pointer">Xem chi tiết →</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                        <div className="text-purple-500">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Sản phẩm đã bán</p>
                            <p className="text-2xl font-semibold text-gray-900">{filteredProductsSold}</p>
                            <p className="text-xs text-blue-600 cursor-pointer">Xem chi tiết →</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Biểu đồ thống kê */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Biểu đồ thống kê</h2>
                <p className="text-sm text-gray-600 mb-4">
                    Thống kê doanh thu và sản phẩm bán được
                </p>
                <div className="overflow-x-auto">
                    <div style={{ minWidth: chartMinWidth, height: '400px' }}>
                        <Bar data={chartData} options={chartOptions} />
                    </div>
                </div>
            </div>

            {/* Bảng thống kê chi tiết */}
            {showStatisticsTable && (
                <StatisticsTable
                    isOpen={showStatisticsTable}
                    onClose={() => setShowStatisticsTable(false)}
                    orders={filteredOrders.filter(isValidOrderForRevenue)}
                    startDate={startDateISO}
                    endDate={endDateISO}
                    totalSales={filteredSales}
                    totalProductsSold={filteredProductsSold}
                />
            )}
        </div>
    )
}

export default AdminHome