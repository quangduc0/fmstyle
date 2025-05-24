import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom';
import { addUser, deleteUser, fetchUsers, updateUser } from '../../redux/slices/adminSlice';
import UserOrderModal from './UserOrderModal';

const UserManagement = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { user } = useSelector((state) => state.auth);
    const { users, loading, error } = useSelector((state) => state.admin);

    const [selectedUser, setSelectedUser] = useState(null);
    const [userOrderModalOpen, setUserOrderModalOpen] = useState(false);

    useEffect(() => {
        if (user && user.role !== "Quản trị viên") {
            navigate("/");
        }
    }, [user, navigate]);

    useEffect(() => {
        if (user && user.role === "Quản trị viên") {
            dispatch(fetchUsers());
        }
    }, [dispatch, user]);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "Khách hàng",
    })

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(addUser(formData));
        setFormData({
            name: "",
            email: "",
            password: "",
            role: "Khách hàng"
        });
    }

    const handleRoleChange = (userId, newRole) => {
        dispatch(updateUser({ id: userId, role: newRole }));
    }

    const handleDeleteUser = (userId) => {
        if (window.confirm("Xác nhận xóa người dùng này?")) {
            dispatch(deleteUser(userId));
        }
    }

    const handleUserClick = (selectedUser) => {
        setSelectedUser(selectedUser);
        setUserOrderModalOpen(true);
    };

    return (
        <div className='max-w-7xl mx-auto p-6'>
            <h2 className='text-2xl font-bold mb-6'>Quản lý người dùng</h2>
            {loading && <p>Đang tải...</p>}
            {error && <p>Lỗi: {error}</p>}
            <div className='p-6 rounded-lg mb-6'>
                <h3 className='text-lg font-bold mb-4'>Thêm người dùng mới</h3>
                <form onSubmit={handleSubmit}>
                    <div className='mb-4'>
                        <label className='block text-gray-700'>Tên</label>
                        <input type="text"
                            name='name'
                            value={formData.name}
                            onChange={handleChange}
                            className='w-full p-2 border rounded'
                            required />
                    </div>
                    <div className='mb-4'>
                        <label className='block text-gray-700'>Email</label>
                        <input type="email"
                            name='email'
                            value={formData.email}
                            onChange={handleChange}
                            className='w-full p-2 border rounded'
                            required />
                    </div>
                    <div className='mb-4'>
                        <label className='block text-gray-700'>Mật khẩu</label>
                        <input type="password"
                            name='password'
                            value={formData.password}
                            onChange={handleChange}
                            className='w-full p-2 border rounded'
                            required />
                    </div>
                    <div className='mb-4'>
                        <label className='block text-gray-700'>Vai trò</label>
                        <select name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className='w-full p-2 border rounded'>
                            <option value="Khách hàng">Khách hàng</option>
                            <option value="Quản trị viên">Quản trị viên</option>
                        </select>
                    </div>
                    <button type='submit'
                        className='bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600'>
                        Thêm người dùng
                    </button>
                </form>
            </div>

            <div className='overflow-y-auto shadow-md sm:rounded-lg'>
                <table className='min-w-full text-left text-gray-500'>
                    <thead className='bg-gray-100 text-xs uppercase text-gray-700'>
                        <tr>
                            <th className='py-3 px-4'>Tên</th>
                            <th className='py-3 px-4'>Email</th>
                            <th className='py-3 px-4'>Vai trò</th>
                            <th className='py-3 px-4'>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((currentUser) => (
                            <tr key={currentUser._id} className='border-b hover:bg-gray-50'>
                                <td className='p-4 font-medium text-gray-900 whitespace-nowrap'>
                                    <button 
                                        onClick={() => handleUserClick(currentUser)}
                                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                                    >
                                        {currentUser.name}
                                    </button>
                                </td>
                                <td className='p-4'>{currentUser.email}</td>
                                <td className='p-4'>
                                    <select value={currentUser.role}
                                        onChange={(e) => handleRoleChange(currentUser._id, e.target.value)}
                                        className='p-2 border rounded' >
                                        <option value="Khách hàng">Khách hàng</option>
                                        <option value="Quản trị viên">Quản trị viên</option>
                                    </select>
                                </td>
                                <td className='p-4'>
                                    <button onClick={() => handleDeleteUser(currentUser._id)}
                                        className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600'>
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* User Order Modal */}
            <UserOrderModal
                isOpen={userOrderModalOpen}
                onClose={() => setUserOrderModalOpen(false)}
                user={selectedUser}
            />
        </div>
    )
}

export default UserManagement