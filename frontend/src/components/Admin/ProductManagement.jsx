import React, { useEffect, useState } from 'react'
import { formatter } from '../../utils/fomater'
import { Link, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { deleteProduct, fetchAdminProducts } from '../../redux/slices/adminProductSlice'
import { fetchAllOrders } from '../../redux/slices/adminOrderSlice'
import DatePickerVN from './DatePickerVN'
import StatisticsTable from './StatisticsTable';
import { FaPlus } from 'react-icons/fa'

const ProductManagement = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const { products, loading, error } = useSelector((state) => state.adminProducts);
    const { orders } = useSelector((state) => state.adminOrders);

    // Nhận tham số từ AdminHome
    const receivedFilterDates = location.state?.filterDates;
    const receivedSoldProductsDetails = location.state?.soldProductsDetails;

    // Trạng thái cho thống kê
    const [totalProducts, setTotalProducts] = useState(0);
    const [inStockProducts, setInStockProducts] = useState([]);
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [outOfStockProducts, setOutOfStockProducts] = useState([]);

    // Thống kê theo danh mục
    const [menProducts, setMenProducts] = useState([]);
    const [womenProducts, setWomenProducts] = useState([]);
    const [topWearProducts, setTopWearProducts] = useState([]);
    const [bottomWearProducts, setBottomWearProducts] = useState([]);

    // Thống kê sản phẩm bán chạy
    const [topSellingProducts, setTopSellingProducts] = useState([]);

    // Lọc theo ngày
    const [startDateISO, setStartDateISO] = useState('');
    const [endDateISO, setEndDateISO] = useState('');
    const [dateError, setDateError] = useState('');
    const [soldProductsInRange, setSoldProductsInRange] = useState([]);
    const [showSoldProducts, setShowSoldProducts] = useState(false);

    // Trạng thái hiển thị
    const [displayedProducts, setDisplayedProducts] = useState([]);
    const [modalTitle, setModalTitle] = useState('');
    const [showAllProducts, setShowAllProducts] = useState(true);

    const [statisticsOpen, setStatisticsOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchAdminProducts());
        dispatch(fetchAllOrders());

        if (receivedFilterDates) {
            setStartDateISO(receivedFilterDates.start);
            setEndDateISO(receivedFilterDates.end);
            setShowAllProducts(false);
        }
    }, [dispatch, receivedFilterDates]);

    useEffect(() => {
        if (receivedFilterDates && products.length > 0 && orders.length > 0) {
            setTimeout(() => {
                handleFilterSoldProducts(true);
            }, 300);
        }
    }, [products, orders, receivedFilterDates]);

    useEffect(() => {
        if (products && products.length > 0) {
            setTotalProducts(products.length);

            if (showAllProducts) {
                setDisplayedProducts(products);
            }

            const inStock = products.filter(product => product.countInStock > 10);
            const lowStock = products.filter(product => product.countInStock > 0 && product.countInStock <= 10);
            const outOfStock = products.filter(product => product.countInStock === 0);

            setInStockProducts(inStock);
            setLowStockProducts(lowStock);
            setOutOfStockProducts(outOfStock);

            const men = products.filter(product => product.gender === 'Nam');
            const women = products.filter(product => product.gender === 'Nữ');
            const topWear = products.filter(product => product.category === 'Top Wear');
            const bottomWear = products.filter(product => product.category === 'Bottom Wear');

            setMenProducts(men);
            setWomenProducts(women);
            setTopWearProducts(topWear);
            setBottomWearProducts(bottomWear);

            if (orders && orders.length > 0) {

                let productSalesMap = {};

                orders.forEach(order => {
                    const orderItems = order.orderItems || order.items || [];
                    if (Array.isArray(orderItems) && orderItems.length > 0) {
                        orderItems.forEach(item => {
                            const productId = typeof item.product === 'object' ? item.product._id : item.product || item.productId;
                            if (!productId) return;

                            if (!productSalesMap[productId]) {
                                productSalesMap[productId] = 0;
                            }

                            productSalesMap[productId] += parseInt(item.quantity) || 1;
                        });
                    }
                });

                const productsWithSold = products.map(product => ({
                    ...product,
                    sold: productSalesMap[product._id] || 0
                }));

                const sortedBySold = [...productsWithSold].sort((a, b) => b.sold - a.sold);
                setTopSellingProducts(sortedBySold.slice(0, 5));
            }
        }
    }, [products, orders, showAllProducts]);

    const handleDelete = (id) => {
        if (window.confirm("Xác nhận xóa sản phẩm?")) {
            dispatch(deleteProduct(id));
        }
    };

    const formatDateVN = (date) => {
        if (!date) return '';
        if (typeof date === 'string') date = new Date(date);

        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const countTotalProductsSold = (orderArray) => {
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
    const handleOpenStatistics = () => {
        if (!startDateISO || !endDateISO) {
            setDateError('Vui lòng chọn ngày bắt đầu và ngày kết thúc trước khi xem thống kê');
            return;
        }
        setStatisticsOpen(true);
    };

    const handleStartDateChange = (value) => {
        setStartDateISO(value);
        setDateError('');
    };

    const handleEndDateChange = (value) => {
        setEndDateISO(value);
        setDateError('');
    };

    const handleFilterSoldProducts = (useReceivedDetails = false) => {
        setDateError('');

        if (!startDateISO || !endDateISO) {
            setDateError('Vui lòng chọn ngày bắt đầu và ngày kết thúc');
            return;
        }

        const start = new Date(startDateISO);
        start.setHours(0, 0, 0, 0);

        const end = new Date(endDateISO);
        end.setHours(23, 59, 59, 999);

        if (start > end) {
            setDateError('Ngày bắt đầu không được sau ngày kết thúc');
            return;
        }

        // Nếu có danh sách sản phẩm đã bán từ AdminHome, sử dụng nó
        if (useReceivedDetails && receivedSoldProductsDetails && receivedSoldProductsDetails.length > 0) {
            console.log("Sử dụng dữ liệu sản phẩm đã bán từ AdminHome");

            // Tạo danh sách sản phẩm theo ngày
            const productsByDate = [];

            receivedSoldProductsDetails.forEach(soldProduct => {
                const productDetails = products.find(p => p._id === soldProduct.productId);

                if (productDetails && soldProduct.orderDates) {
                    // Tạo map để theo dõi số lượng bán theo ngày
                    const salesByDate = {};

                    // Nhóm các đơn hàng theo ngày
                    soldProduct.orderDates.forEach(dateStr => {
                        const date = new Date(dateStr);
                        const dateKey = formatDateVN(date);

                        if (!salesByDate[dateKey]) {
                            salesByDate[dateKey] = {
                                date: date,
                                count: 0
                            };
                        }

                        salesByDate[dateKey].count += 1; // Giả định mỗi lần xuất hiện trong orderDates là 1 sản phẩm
                    });

                    // Tạo một bản ghi cho mỗi ngày
                    Object.keys(salesByDate).forEach(dateKey => {
                        productsByDate.push({
                            ...productDetails,
                            saleDate: salesByDate[dateKey].date,
                            saleDateFormatted: dateKey,
                            soldInPeriod: salesByDate[dateKey].count
                        });
                    });
                }
            });

            if (productsByDate.length === 0) {
                setDateError("Không tìm thấy thông tin chi tiết cho sản phẩm đã bán");
                return;
            }

            // Sắp xếp theo thứ tự ngày và tên sản phẩm
            productsByDate.sort((a, b) => {
                // Ưu tiên sắp xếp theo ngày
                const dateCompare = a.saleDate - b.saleDate;
                if (dateCompare !== 0) return dateCompare;

                // Nếu cùng ngày, sắp xếp theo tên sản phẩm
                return a.name.localeCompare(b.name);
            });

            setSoldProductsInRange(productsByDate);
            setShowSoldProducts(true);
            setDisplayedProducts(productsByDate);
            setShowAllProducts(false);
            setModalTitle(`Sản phẩm bán từ ${formatDateVN(start)} đến ${formatDateVN(end)}`);
            return;
        }

        console.log("Tổng số đơn hàng:", orders?.length || 0);

        // Lọc đơn hàng trong khoảng thời gian
        const ordersInRange = orders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= start && orderDate <= end;
        });

        console.log("Đơn hàng trong khoảng thời gian:", ordersInRange.length);

        if (ordersInRange.length === 0) {
            setDateError(`Không có đơn hàng trong khoảng thời gian từ ${formatDateVN(start)} đến ${formatDateVN(end)}`);
            return;
        }

        // Tạo danh sách sản phẩm được bán theo từng ngày
        const productsByDate = [];

        ordersInRange.forEach(order => {
            const orderDate = new Date(order.createdAt);
            const orderDateFormatted = formatDateVN(orderDate);

            const orderItems = order.orderItems || order.items || [];
            if (Array.isArray(orderItems) && orderItems.length > 0) {
                orderItems.forEach(item => {
                    const productId = typeof item.product === 'object' ? item.product._id : item.product || item.productId;
                    if (!productId) return;

                    const productDetails = products.find(p => p._id === productId);
                    if (!productDetails) return;

                    // Tìm kiếm xem đã có sản phẩm + ngày này trong danh sách chưa
                    let existingEntry = productsByDate.find(entry =>
                        entry._id === productId &&
                        formatDateVN(entry.saleDate) === orderDateFormatted
                    );

                    if (existingEntry) {
                        // Nếu đã có, cộng dồn số lượng
                        existingEntry.soldInPeriod += parseInt(item.quantity) || 1;
                    } else {
                        // Nếu chưa có, thêm mới
                        productsByDate.push({
                            ...productDetails,
                            saleDate: orderDate,
                            saleDateFormatted: orderDateFormatted,
                            soldInPeriod: parseInt(item.quantity) || 1
                        });
                    }
                });
            }
        });

        if (productsByDate.length === 0) {
            setDateError("Không tìm thấy sản phẩm nào được bán trong khoảng thời gian này");
            return;
        }

        // Sắp xếp theo thứ tự ngày và tên sản phẩm
        productsByDate.sort((a, b) => {
            // Ưu tiên sắp xếp theo ngày
            const dateCompare = a.saleDate - b.saleDate;
            if (dateCompare !== 0) return dateCompare;

            // Nếu cùng ngày, sắp xếp theo tên sản phẩm
            return a.name.localeCompare(b.name);
        });

        setSoldProductsInRange(productsByDate);
        setShowSoldProducts(true);
        setDisplayedProducts(productsByDate);
        setShowAllProducts(false);
        setModalTitle(`Sản phẩm bán từ ${formatDateVN(start)} đến ${formatDateVN(end)}`);
    };

    const showCategoryProducts = (title, productsList) => {
        setModalTitle(title);
        setDisplayedProducts(productsList);
        setShowAllProducts(false);
    };

    const resetFilters = () => {
        setDisplayedProducts(products);
        setShowAllProducts(true);
        setShowSoldProducts(false);
    };

    if (loading) return <p className="text-center py-4">Đang tải...</p>;
    if (error) return <p className="text-center py-4 text-red-500">Lỗi: {error}</p>;

    return (
        <div className='max-w-7xl mx-auto p-6'>
            <h2 className='text-2xl font-bold mb-6'>Quản lý sản phẩm</h2>

            {/* Phần thống kê sản phẩm */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Thống kê sản phẩm</h3>
                    <Link
                        to="/admin/products/add"
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition flex items-center space-x-2"
                    >
                        <FaPlus/> 
                        <span>Thêm sản phẩm</span>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Thống kê theo trạng thái tồn kho */}
                    <div className="p-4 border rounded-lg">
                        <h4 className="text-lg font-medium mb-3">Sản phẩm theo trạng thái</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center p-2 hover:bg-gray-50 cursor-pointer rounded transition"
                                onClick={resetFilters}>
                                <span>Tổng số sản phẩm</span>
                                <span className="font-semibold bg-indigo-100 text-indigo-800 px-2 py-1 rounded">{totalProducts}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 hover:bg-green-50 cursor-pointer rounded transition"
                                onClick={() => showCategoryProducts('Sản phẩm còn hàng', inStockProducts)}>
                                <span>Sản phẩm còn hàng</span>
                                <span className="font-semibold bg-green-100 text-green-800 px-2 py-1 rounded">{inStockProducts.length}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 hover:bg-yellow-50 cursor-pointer rounded transition"
                                onClick={() => showCategoryProducts('Sản phẩm sắp hết hàng', lowStockProducts)}>
                                <span>Sản phẩm sắp hết hàng (SL ≤ 10)</span>
                                <span className="font-semibold bg-yellow-100 text-yellow-800 px-2 py-1 rounded">{lowStockProducts.length}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 hover:bg-red-50 cursor-pointer rounded transition"
                                onClick={() => showCategoryProducts('Sản phẩm hết hàng', outOfStockProducts)}>
                                <span>Sản phẩm hết hàng (SL = 0)</span>
                                <span className="font-semibold bg-red-100 text-red-800 px-2 py-1 rounded">{outOfStockProducts.length}</span>
                            </div>
                        </div>
                    </div>

                    {/* Thống kê theo danh mục */}
                    <div className="p-4 border rounded-lg">
                        <h4 className="text-lg font-medium mb-3">Sản phẩm theo danh mục</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center p-2 hover:bg-blue-50 cursor-pointer rounded transition"
                                onClick={() => showCategoryProducts('Sản phẩm Nam', menProducts)}>
                                <span>Sản phẩm Nam</span>
                                <span className="font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded">{menProducts.length}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 hover:bg-pink-50 cursor-pointer rounded transition"
                                onClick={() => showCategoryProducts('Sản phẩm Nữ', womenProducts)}>
                                <span>Sản phẩm Nữ</span>
                                <span className="font-semibold bg-pink-100 text-pink-800 px-2 py-1 rounded">{womenProducts.length}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 hover:bg-purple-50 cursor-pointer rounded transition"
                                onClick={() => showCategoryProducts('Top Wear', topWearProducts)}>
                                <span>Top Wear</span>
                                <span className="font-semibold bg-purple-100 text-purple-800 px-2 py-1 rounded">{topWearProducts.length}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 hover:bg-indigo-50 cursor-pointer rounded transition"
                                onClick={() => showCategoryProducts('Bottom Wear', bottomWearProducts)}>
                                <span>Bottom Wear</span>
                                <span className="font-semibold bg-indigo-100 text-indigo-800 px-2 py-1 rounded">{bottomWearProducts.length}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top sản phẩm bán chạy */}
                {/* <div className="mb-6 p-4 border rounded-lg">
                    <h4 className="text-lg font-medium mb-3">Top 5 sản phẩm bán chạy</h4>
                    {topSellingProducts.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên</th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Danh mục</th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá</th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đã bán</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {topSellingProducts.map((product) => (
                                        <tr key={product._id} className="hover:bg-gray-50">
                                            <td className="px-3 py-4 whitespace-nowrap">
                                                <img
                                                    src={product.images && product.images[0]?.url}
                                                    alt={product.name}
                                                    className="h-12 w-12 object-cover rounded"
                                                />
                                            </td>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{formatter(product.price)}</td>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{product.sold || 0}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-4 text-gray-500">Không có dữ liệu bán hàng</div>
                    )}
                </div> */}

                {/* Thống kê sản phẩm bán trong khoảng thời gian */}
                <div className="mb-6 p-4 border rounded-lg">
                    <h4 className="text-lg font-medium mb-3">Sản phẩm bán trong khoảng thời gian</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
                            <DatePickerVN
                                value={startDateISO ? formatDateVN(new Date(startDateISO)) : ''}
                                onChange={handleStartDateChange}
                                placeholder="DD/MM/YYYY"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
                            <DatePickerVN
                                value={endDateISO ? formatDateVN(new Date(endDateISO)) : ''}
                                onChange={handleEndDateChange}
                                placeholder="DD/MM/YYYY"
                            />
                        </div>
                        <div className="self-end mb-1 flex gap-2">
                            <button
                                onClick={() => handleFilterSoldProducts(false)}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                            >
                                Lọc
                            </button>
                            <button
                                onClick={handleOpenStatistics}
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors"
                            >
                                Xem bảng
                            </button>
                        </div>
                    </div>
                    {dateError && <p className="text-red-500 mb-4">{dateError}</p>}
                </div>
            </div>

            {/* Hiển thị danh sách sản phẩm */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">
                        {showAllProducts ? 'Danh sách tất cả sản phẩm' : modalTitle}
                    </h3>
                    {!showAllProducts && (
                        <button
                            onClick={resetFilters}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded"
                        >
                            Quay lại
                        </button>
                    )}
                </div>

                <div className='overflow-x-auto shadow-md sm:rounded-lg'>
                    <table className='min-w-full text-gray-500 text-center'>
                        <thead className='bg-gray-100 text-xs uppercase text-gray-700'>
                            <tr>
                                <th className='py-3 px-4'>Hình ảnh</th>
                                <th className='py-3 px-4'>Tên</th>
                                <th className='py-3 px-4'>Giá</th>
                                <th className='py-3 px-4'>Tồn kho</th>
                                <th className='py-3 px-4'>Danh mục</th>
                                <th className='py-3 px-4'>SKU</th>
                                {showSoldProducts && (
                                    <>
                                        <th className='py-3 px-4'>Ngày bán</th>
                                        <th className='py-3 px-4'>Đã bán</th>
                                    </>
                                )}
                                <th className='py-3 px-4'>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedProducts.length > 0 ? displayedProducts.map((product, index) => (
                                <tr key={`${product._id}_${product.saleDateFormatted || index}`}
                                    className='border-b hover:bg-gray-50' >
                                    <td className='p-4'>
                                        <img
                                            src={product.images && product.images[0]?.url}
                                            alt={product.name}
                                            className="h-16 w-16 object-cover rounded"
                                        />
                                    </td>
                                    <td className='p-4 font-medium text-gray-900 whitespace-nowrap'>
                                        {product.name}
                                    </td>
                                    <td className='p-4'>{formatter(product.price)}</td>
                                    <td className='p-4'>
                                        <span className={`px-2 py-1 rounded ${product.countInStock > 10
                                            ? 'bg-green-100 text-green-800'
                                            : product.countInStock > 0
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                            {product.countInStock}
                                        </span>
                                    </td>
                                    <td className='p-4'>{product.category}</td>
                                    <td className='p-4'>{product.sku}</td>
                                    {showSoldProducts && (
                                        <>
                                            <td className='p-4 text-sm font-medium'>
                                                {product.saleDateFormatted}
                                            </td>
                                            <td className='p-4 font-medium text-blue-600 text-center'>
                                                {product.soldInPeriod || 0}
                                            </td>
                                        </>
                                    )}
                                    <td className='p-4'>
                                        <Link to={`/admin/products/${product._id}/edit`}
                                            className='bg-yellow-500 text-white px-2 py-1 rounded mr-2 hover:bg-yellow-600' >
                                            Sửa
                                        </Link>
                                        <button onClick={() => handleDelete(product._id)}
                                            className='bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600'>
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            )) : (<tr>
                                <td colSpan={showSoldProducts ? 9 : 7} className='p-4 text-center text-gray-500'>
                                    Không tìm thấy sản phẩm nào.
                                </td>
                            </tr>)}
                        </tbody>
                    </table>
                </div>
            </div>
            <StatisticsTable
                isOpen={statisticsOpen}
                onClose={() => setStatisticsOpen(false)}
                startDate={startDateISO}
                endDate={endDateISO}
                orders={soldProductsInRange.length > 0 ? orders.filter(order => {
                    const orderDate = new Date(order.createdAt);
                    const start = new Date(startDateISO);
                    start.setHours(0, 0, 0, 0);
                    const end = new Date(endDateISO);
                    end.setHours(23, 59, 59, 999);
                    return orderDate >= start && orderDate <= end;
                }) : []}
                totalSales={soldProductsInRange.length > 0 ? orders.filter(order => {
                    const orderDate = new Date(order.createdAt);
                    const start = new Date(startDateISO);
                    start.setHours(0, 0, 0, 0);
                    const end = new Date(endDateISO);
                    end.setHours(23, 59, 59, 999);
                    return orderDate >= start && orderDate <= end;
                }).reduce((total, order) => total + Number(order.totalPrice || 0), 0) : 0}
                totalProductsSold={soldProductsInRange.reduce((total, product) => total + (product.soldInPeriod || 0), 0)}
            />
        </div>
    )
}

export default ProductManagement