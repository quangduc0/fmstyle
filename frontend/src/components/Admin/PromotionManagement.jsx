import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { FaCalendarAlt, FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios';

const PromotionManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { user } = useSelector((state) => state.auth);
  
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    discountPercent: 0,
    startDate: '',
    endDate: '',
    categories: [],
    isActive: true
  });
  
  const formatDateDisplay = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear());
    
    return `${day}/${month}/${year}`;
  };
  
  const parseInputDate = (inputDate) => {
    if (!inputDate) return '';
    
    if (inputDate.includes('-') && inputDate.split('-')[0].length === 4) {
      return inputDate;
    }
    
    const parts = inputDate.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    
    return inputDate;
  };
  
  useEffect(() => {
    if (!user || user.role !== "Quản trị viên") {
      navigate("/");
    } else {
      fetchPromotions();
    }
  }, [user, navigate]);
  
  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/promotions`,
        {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('userToken')}` 
          }
        }
      );
      
      setPromotions(data);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'categories') {
      let updatedCategories = [...formData.categories];
      
      if (value === 'All') {
        if (checked) {
          updatedCategories = ['All'];
        } else {
          updatedCategories = updatedCategories.filter(cat => cat !== 'All');
        }
      } else {
        if (checked) {
          updatedCategories = updatedCategories.filter(cat => cat !== 'All');
          updatedCategories.push(value);
        } else {
          updatedCategories = updatedCategories.filter(cat => cat !== value);
        }
      }
      
      setFormData({ ...formData, categories: updatedCategories });
    } else if (name === 'isActive') {
      setFormData({ ...formData, isActive: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const submissionData = { ...formData };
    
    if (submissionData.startDate) {
      submissionData.startDate = parseInputDate(submissionData.startDate);
    }
    
    if (submissionData.endDate) {
      submissionData.endDate = parseInputDate(submissionData.endDate);
    }
    
    if (!submissionData.name || !submissionData.discountPercent || !submissionData.startDate || !submissionData.endDate) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    
    if (submissionData.categories.length === 0) {
      toast.error('Vui lòng chọn ít nhất một danh mục');
      return;
    }
    
    try {
      setLoading(true);
      
      if (editMode) {
        await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/api/promotions/${selectedId}`,
          submissionData,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('userToken')}`
            }
          }
        );
        
        toast.success('Cập nhật khuyến mãi thành công');
      } else {
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/promotions`,
          submissionData,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('userToken')}`
            }
          }
        );
        
        toast.success('Tạo khuyến mãi thành công');
      }
      
      setFormData({
        name: '',
        discountPercent: 0,
        startDate: '',
        endDate: '',
        categories: [],
        isActive: true
      });
      
      setShowForm(false);
      setEditMode(false);
      setSelectedId(null);
      
      fetchPromotions();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleEditPromotion = (promotion) => {
    setSelectedId(promotion._id);
    
    setFormData({
      name: promotion.name,
      discountPercent: promotion.discountPercent,
      startDate: formatDateDisplay(promotion.startDate),
      endDate: formatDateDisplay(promotion.endDate),
      categories: promotion.categories || [],
      isActive: promotion.isActive
    });
    
    setEditMode(true);
    setShowForm(true);
  };
  
  const handleDeletePromotion = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khuyến mãi này?')) {
      try {
        setLoading(true);
        
        await axios.delete(
          `${import.meta.env.VITE_BACKEND_URL}/api/promotions/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('userToken')}`
            }
          }
        );
        
        toast.success('Xóa khuyến mãi thành công');
        
        fetchPromotions();
      } catch (error) {
        toast.error(error.response?.data?.message || error.message);
      } finally {
        setLoading(false);
      }
    }
  };
  
  const isPromotionActive = (startDate, endDate, isActive) => {
    if (!isActive) return false;
    
    const now = new Date();
    return new Date(startDate) <= now && new Date(endDate) >= now;
  };
  
  const translateCategory = (category) => {
    switch(category) {
      case 'All': return 'Tất cả';
      case 'Nam': return 'Nam';
      case 'Nữ': return 'Nữ';
      case 'Top Wear': return 'Áo';
      case 'Bottom Wear': return 'Quần';
      default: return category;
    }
  };
  
  return (
    <div className='max-w-7xl mx-auto p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-2xl font-bold'>Quản lý khuyến mãi</h2>
        <div className='flex gap-4'>
          <button
            onClick={() => {
              setShowForm(!showForm);
              
              if (!showForm) {
                setEditMode(false);
                setSelectedId(null);
                setFormData({
                  name: '',
                  discountPercent: 0,
                  startDate: '',
                  endDate: '',
                  categories: [],
                  isActive: true
                });
              }
            }}
            className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'
          >
            {showForm ? 'Đóng' : 'Thêm khuyến mãi mới'}
          </button>
        </div>
      </div>
      
      {showForm && (
        <div className='mb-8 bg-white p-6 rounded-lg shadow'>
          <h3 className='text-xl font-semibold mb-4'>
            {editMode ? 'Cập nhật khuyến mãi' : 'Thêm khuyến mãi mới'}
          </h3>
          
          <form onSubmit={handleSubmit}>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
              <div>
                <label className='block text-gray-700 mb-2'>Tên khuyến mãi *</label>
                <input
                  type='text'
                  name='name'
                  value={formData.name}
                  onChange={handleChange}
                  className='w-full p-2 border rounded'
                  required
                />
              </div>
              
              <div>
                <label className='block text-gray-700 mb-2'>Phần trăm giảm giá (%) *</label>
                <input
                  type='number'
                  name='discountPercent'
                  value={formData.discountPercent}
                  onChange={handleChange}
                  min='0'
                  max='100'
                  className='w-full p-2 border rounded'
                  required
                />
              </div>
              
              <div>
                <label className='block text-gray-700 mb-2'>Ngày bắt đầu *</label>
                <input
                  type='text'
                  name='startDate'
                  value={formData.startDate}
                  onChange={handleChange}
                  className='w-full p-2 border rounded'
                  placeholder="dd/mm/yyyy"
                  required
                />
              </div>
              
              <div>
                <label className='block text-gray-700 mb-2'>Ngày kết thúc *</label>
                <input
                  type='text'
                  name='endDate'
                  value={formData.endDate}
                  onChange={handleChange}
                  className='w-full p-2 border rounded'
                  placeholder="dd/mm/yyyy"
                  required
                />
              </div>
              
              <div>
                <label className='flex items-center text-gray-700 mb-2'>
                  <input
                    type='checkbox'
                    name='isActive'
                    checked={formData.isActive}
                    onChange={handleChange}
                    className='mr-2'
                  />
                  Kích hoạt khuyến mãi
                </label>
              </div>
            </div>
            
            <div className='mb-4'>
              <label className='block text-gray-700 mb-2'>Danh mục *</label>
              <div className='flex flex-wrap gap-4'>
                <label className='inline-flex items-center'>
                  <input
                    type='checkbox'
                    name='categories'
                    value='All'
                    checked={formData.categories.includes('All')}
                    onChange={handleChange}
                    className='mr-2'
                  />
                  Tất cả
                </label>
                <label className='inline-flex items-center'>
                  <input
                    type='checkbox'
                    name='categories'
                    value='Nam'
                    checked={formData.categories.includes('Nam')}
                    onChange={handleChange}
                    className='mr-2'
                    disabled={formData.categories.includes('All')}
                  />
                  Nam
                </label>
                <label className='inline-flex items-center'>
                  <input
                    type='checkbox'
                    name='categories'
                    value='Nữ'
                    checked={formData.categories.includes('Nữ')}
                    onChange={handleChange}
                    className='mr-2'
                    disabled={formData.categories.includes('All')}
                  />
                  Nữ
                </label>
                <label className='inline-flex items-center'>
                  <input
                    type='checkbox'
                    name='categories'
                    value='Top Wear'
                    checked={formData.categories.includes('Top Wear')}
                    onChange={handleChange}
                    className='mr-2'
                    disabled={formData.categories.includes('All')}
                  />
                  Áo
                </label>
                <label className='inline-flex items-center'>
                  <input
                    type='checkbox'
                    name='categories'
                    value='Bottom Wear'
                    checked={formData.categories.includes('Bottom Wear')}
                    onChange={handleChange}
                    className='mr-2'
                    disabled={formData.categories.includes('All')}
                  />
                  Quần
                </label>
              </div>
            </div>
            
            <div className='flex justify-end gap-3'>
              <button
                type='button'
                onClick={() => setShowForm(false)}
                className='px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400'
              >
                Hủy
              </button>
              <button
                type='submit'
                disabled={loading}
                className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400'
              >
                {editMode ? 'Cập nhật' : 'Tạo khuyến mãi'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {loading ? (
        <div className='text-center py-4'>Đang tải...</div>
      ) : (
        <div className='overflow-x-auto'>
          <table className='min-w-full bg-white border rounded-lg overflow-hidden'>
            <thead className='bg-gray-50 border-b'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Tên</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Giảm giá</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Thời gian</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Trạng thái</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Danh mục</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Thao tác</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200'>
              {promotions && promotions.length > 0 ? (
                promotions.map((promotion) => (
                  <tr key={promotion._id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm font-medium text-gray-900'>{promotion.name}</div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm text-gray-900'>{promotion.discountPercent}%</div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm text-gray-900'>
                        <div className='flex items-center'>
                          <FaCalendarAlt className='text-gray-400 mr-1' />
                          <span>{formatDateDisplay(promotion.startDate)}</span>
                        </div>
                        <div className='flex items-center mt-1'>
                          <FaCalendarAlt className='text-gray-400 mr-1' />
                          <span>{formatDateDisplay(promotion.endDate)}</span>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        isPromotionActive(promotion.startDate, promotion.endDate, promotion.isActive)
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {isPromotionActive(promotion.startDate, promotion.endDate, promotion.isActive) 
                          ? 'Đang hoạt động' 
                          : !promotion.isActive 
                            ? 'Bị vô hiệu hóa'
                            : new Date(promotion.startDate) > new Date() 
                              ? 'Chưa bắt đầu'
                              : 'Đã kết thúc'}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex flex-wrap gap-1'>
                        {promotion.categories && promotion.categories.map((cat) => (
                          <span key={cat} className='inline-block bg-gray-100 px-2 py-1 rounded mr-1 mb-1 text-xs'>
                            {translateCategory(cat)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                      <button
                        onClick={() => handleEditPromotion(promotion)}
                        className='text-indigo-600 hover:text-indigo-900 mr-3'
                      >
                        <FaEdit className='inline' /> Sửa
                      </button>
                      <button
                        onClick={() => handleDeletePromotion(promotion._id)}
                        className='text-red-600 hover:text-red-900'
                      >
                        <FaTrash className='inline' /> Xóa
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan='6' className='px-6 py-4 text-center text-gray-500'>
                    Không có khuyến mãi nào. Hãy tạo khuyến mãi mới!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PromotionManagement