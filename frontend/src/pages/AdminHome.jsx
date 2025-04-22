import React from 'react'
import { Link } from 'react-router-dom'
import { formatter } from './../utils/fomater'

const AdminHome = () => {

    const orders = [
        {
            _id: 123123,
            user: {
                name: "Aaa",
            },
            totalPrice: 400000,
            status: "Đang xử lý",
        },
    ]

  return (
    <div className='max-w-7xl mx-auto p-6'>
        <h1 className='text-3xl font-bold mb-6'>Giao diện quản lý</h1>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            <div className='p-4 shadow-md rounded-lg'>
                <h2 className='text-xl font-semibold'>Doanh thu</h2>
                <p className='text-2xl'>50.000.000 VND</p>
            </div>
            <div className='p-4 shadow-md rounded-lg'>
                <h2 className='text-xl font-semibold'>Tổng số đơn hàng</h2>
                <p className='text-2xl'>200</p>
                <Link to="/admin/orders" 
                 className='text-blue-500 hover: underline'>
                    Quản lý đơn hàng
                </Link>
            </div>
            <div className='p-4 shadow-md rounded-lg'>
                <h2 className='text-xl font-semibold'>Tổng số sản phẩm</h2>
                <p className='text-2xl'>150</p>
                <Link to="/admin/products" 
                 className='text-blue-500 hover: underline'>
                    Quản lý sản phẩm
                </Link>
            </div>
        </div>
        <div className='mt-6'>
            <h2 className='text-2xl font-bold mb-4'>Đơn hàng gần đây</h2>
            <div className='overflow-x-auto'>
                <table className='min-w-full text-left text-gray-500'>
                    <thead className='bg-gray-100 text-xs uppercase text-gray-700'>
                        <tr>
                            <th className='py-3 px-4'>Mã đơn hàng</th>
                            <th className='py-3 px-4'>Khách hàng</th>
                            <th className='py-3 px-4'>Tổng đơn giá</th>
                            <th className='py-3 px-4'>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length > 0 ? (
                            orders.map((orders) => (
                                <tr key={orders._id}
                                 className='border-b hover:bg-gray-50 cursor-pointer'>
                                    <td className='p-4'>{orders._id}</td>
                                    <td className='p-4'>{orders.user.name}</td>
                                    <td className='p-4'>{formatter(orders.totalPrice)}</td>
                                    <td className='p-4'>{orders.status}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className='p-4 text-center text-gray-500'>\
                                    Không tìm thấy đơn hàng gần đây.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  )
}

export default AdminHome