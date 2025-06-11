import React, { useState } from 'react';
import { formatter } from '../../utils/fomater';

const StatisticsTable = ({ 
    isOpen, 
    onClose, 
    startDate, 
    endDate, 
    orders, 
    totalSales, 
    totalProductsSold 
}) => {
    const [tableData, setTableData] = useState([]);

    React.useEffect(() => {
        if (isOpen && orders && orders.length > 0) {
            generateTableData();
        }
    }, [isOpen, orders, startDate, endDate]);

    const formatDateVN = (date) => {
        if (!date) return '';
        if (typeof date === 'string') date = new Date(date);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
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

    const generateTableData = () => {
        if (!startDate || !endDate) return;

        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(0, 0, 0, 0);

        const dateArray = [];
        let currentDate = new Date(start);
        
        while (currentDate <= end) {
            dateArray.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        const tableRows = dateArray.map(date => {
            const dateStart = new Date(date);
            dateStart.setHours(0, 0, 0, 0);
            const dateEnd = new Date(date);
            dateEnd.setHours(23, 59, 59, 999);

            // Lọc đơn hàng theo ngày
            const dayOrders = orders.filter(order => {
                const orderDate = new Date(order.createdAt);
                return orderDate >= dateStart && orderDate <= dateEnd;
            });

            // Tính doanh thu ngày
            const daySales = dayOrders.reduce((total, order) => 
                total + Number(order.totalPrice || 0), 0);

            // Tính số sản phẩm bán được
            const dayProductsSold = countTotalProducts(dayOrders);

            return {
                date: formatDateVN(date),
                sales: daySales,
                productsSold: dayProductsSold,
                orderCount: dayOrders.length
            };
        });

        setTableData(tableRows);
    };

    const getTotalDays = () => {
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-xl font-semibold">
                        Bảng thống kê chi tiết ({startDate && endDate ? 
                        `${formatDateVN(new Date(startDate))} - ${formatDateVN(new Date(endDate))}` : ''})
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Table Content */}
                <div className="flex-1 overflow-auto p-4">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-center">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ngày
                                    </th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Số đơn hàng
                                    </th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Sản phẩm bán được
                                    </th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Doanh thu
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {tableData.map((row, index) => (
                                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {row.date}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {row.orderCount}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {row.productsSold}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                            {formatter(row.sales)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            
                            {/* Footer Summary */}
                            <tfoot className="bg-gray-100">
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                        Tổng ({getTotalDays()} ngày)
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                        {tableData.reduce((sum, row) => sum + row.orderCount, 0)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                        {totalProductsSold}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                                        {formatter(totalSales)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-gray-50">
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                            Hiển thị thống kê từ {startDate && formatDateVN(new Date(startDate))} đến {endDate && formatDateVN(new Date(endDate))}
                        </div>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatisticsTable;