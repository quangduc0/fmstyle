import React from 'react'
import { FaBoxOpen, FaClipboardList, FaSignOutAlt, FaStore, FaUser } from 'react-icons/fa'
import { Link, NavLink, useNavigate } from 'react-router-dom'

const AdminSidebar = () => {
    const navigate = useNavigate();
    const handleLogout = () => {
        navigate("/");
    }
  return (
    <div className='p-6'>
        <div className='mb-6'>
            <Link to={"/admin"} className='text-2xl font-medium'>FM Style</Link>
        </div>
        <h2 className='text-xl font-medium mb-6 text-center'>Giao diện quản lý</h2>
    
        <nav className='flex flex-col space-y-2'>
            <NavLink to="/admin/users" 
             className={({isActive}) => isActive 
             ? "bg-gray-700 text-white py-3 px-4 rounded flex items-center space-x-2" 
             : "text-gray-300 hover:bg-gray-700 hover:text-white py-3 px-4 rounded flex items-center space-x-2"}>
                <FaUser />
                <span>Người dùng</span>
            </NavLink>
            <NavLink to="/admin/products" 
             className={({isActive}) => isActive 
             ? "bg-gray-700 text-white py-3 px-4 rounded flex items-center space-x-2" 
             : "text-gray-300 hover:bg-gray-700 hover:text-white py-3 px-4 rounded flex items-center space-x-2"}>
                <FaBoxOpen />
                <span>Sản phẩm</span>
            </NavLink>
            <NavLink to="/admin/orders" 
             className={({isActive}) => isActive 
             ? "bg-gray-700 text-white py-3 px-4 rounded flex items-center space-x-2" 
             : "text-gray-300 hover:bg-gray-700 hover:text-white py-3 px-4 rounded flex items-center space-x-2"}>
                <FaClipboardList />
                <span>Đơn hàng</span>
            </NavLink>
            <NavLink to="/" 
             className={({isActive}) => isActive 
             ? "bg-gray-700 text-white py-3 px-4 rounded flex items-center space-x-2" 
             : "text-gray-300 hover:bg-gray-700 hover:text-white py-3 px-4 rounded flex items-center space-x-2"}>
                <FaStore />
                <span>Cửa hàng</span>
            </NavLink>
        </nav>
        <div className='mt-6'>
            <button onClick={handleLogout}
             className='w-full bg-red-500 hover:bg-red-500 text-white px-4 rounded flex items-center
              justify-center space-x-2'>
                <FaSignOutAlt />
                <span>Đăng xuất</span>
              </button>
        </div>
    </div>
  )
}

export default AdminSidebar