import React from 'react'
import { IoLogoInstagram } from 'react-icons/io'
import { RiTwitterXLine } from 'react-icons/ri'
import { TbBrandMeta } from 'react-icons/tb'
import { Link } from 'react-router-dom'
import {FiPhoneCall} from 'react-icons/fi'

const Footer = () => {
  return (
    <footer className='border-t py-12'>
        <div className='container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 px-4 lg:px-0'>
            <div>
                <h3 className='text-lg text-gray-800 mb-4'>Bản tin</h3>
                <p className='text-gray-500 mb-4'>
                    Hãy là người đầu tiên biết về sản phẩm mới, sự kiện độc quyền và ưu đãi trực tuyến.
                </p>
                <p className='font-medium text-sm text-gray-600 mb-6'>
                    Đăng ký ngay và nhận 10% giảm giá cho đơn hàng đầu tiên của bạn.
                </p>
                <form className='flex'>
                    <input type="email" 
                    placeholder='Nhập email của bạn' 
                    className='p-3 w-full text-sm border-t border-l border-b border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all' 
                    required />
                    <button type='submit' 
                    className='bg-black text-white px-4 py-2 text-sm rounded-r-md hover:bg-gray-800 transition-all whitespace-nowrap'>
                        Đăng ký
                    </button>
                </form>
            </div>
            <div>
                <h3 className='text-lg text-gray-800 mb-4'>Cửa hàng</h3>
                <ul className='space-y-2 text-gray-600'>
                    <li>
                        <Link to="/collections/all?gender=Nam&category=Top Wear" className='hover:text-gray-600 transition-colors'>
                            Thời trang nam – Áo
                        </Link>
                    </li>
                    <li>
                        <Link to="/collections/all?gender=Nữ&category=Top Wear" className='hover:text-gray-600 transition-colors'>
                            Thời trang nữ – Áo
                        </Link>
                    </li>
                    <li>
                        <Link to="/collections/all?gender=Nam&category=Bottom Wear" className='hover:text-gray-600 transition-colors'>
                            Quần nam phong cách
                        </Link>
                    </li>
                    <li>
                        <Link to="/collections/all?gender=Nữ&category=Bottom Wear" className='hover:text-gray-600 transition-colors'>
                            Trang phục nữ – Quần & váy
                        </Link>
                    </li>
                </ul>
            </div>
            <div>
                <h3 className='text-lg text-gray-800 mb-4'>Hỗ trợ</h3>
                <ul className='space-y-2 text-gray-600'>
                    <li>
                        <Link to="#" className='hover:text-gray-600 transition-colors'>
                            Liên hệ với chúng tôi
                        </Link>
                    </li>
                    <li>
                        <Link to="#" className='hover:text-gray-600 transition-colors'>
                            Về chúng tôi
                        </Link>
                    </li>
                    <li>
                        <Link to="#" className='hover:text-gray-600 transition-colors'>
                            Câu hỏi thường gặp
                        </Link>
                    </li>
                    <li>
                        <Link to="#" className='hover:text-gray-600 transition-colors'>
                            Đặc điểm nổi bật
                        </Link>
                    </li>
                </ul>
            </div>
            <div>
                <h3 className='text-lg text-gray-800 mb-4 '>Theo dõi chúng tôi</h3>
                <div className='flex items-center space-x-4 mb-6'>
                    <a href="https://www.facebook.com" 
                        target='_blank' 
                        rel='noopener noreferrer' 
                        className='hover:text-gray-500'>
                        <TbBrandMeta className='h-5 w-5' />
                    </a>
                    <a href="https://www.facebook.com" 
                        target='_blank' 
                        rel='noopener noreferrer' 
                        className='hover:text-gray-500'>
                        <IoLogoInstagram className='h-5 w-5' />
                    </a>
                    <a href="https://www.facebook.com" 
                        target='_blank' 
                        rel='noopener noreferrer' 
                        className='hover:text-gray-500'>
                        <RiTwitterXLine className='h-4 w-4' />
                    </a>
                </div>
                <p className='text-gray-500'>Gọi cho chúng tôi</p>
                <p>
                    <FiPhoneCall className='inline-block mr-2' />
                    0345 678 912
                </p>
            </div>
        </div>
        <div className='container mx-auto mt-12 px-4 lg:px-0 border-t border-gray-200 pt-6'>
            <p className='text-gray-500 text-sm tracking-tighter text-center'>
                © 2025. Mọi quyền được bảo lưu.
            </p>
        </div>
    </footer>
  )
}

export default Footer