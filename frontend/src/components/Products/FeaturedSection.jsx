import React from 'react'
import { HiArrowPathRoundedSquare, HiOutlineCreditCard, HiShoppingBag } from 'react-icons/hi2'

const FeaturedSection = () => {
  return (
    <section className='py-16 px-4 bg-white'>
        <div className='container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center'>
            <div className='flex flex-col items-center'>
                <div className='p-4 rounded-full mb-4'>
                    <HiShoppingBag className='text-xl' />
                </div>
                <h4 className='tracking-tighter mb-2'>
                    MIỄN PHÍ VẬN CHUYỂN TOÀN QUỐC
                </h4>
                <p className='text-gray-600 text-sm tracking-tighter'>
                    Cho tất cả đơn hàng trên 1.000.000 đồng
                </p>
            </div>

            <div className='flex flex-col items-center'>
                <div className='p-4 rounded-full mb-4'>
                    <HiArrowPathRoundedSquare className='text-xl' />
                </div>
                <h4 className='tracking-tighter mb-2'>
                    ĐỔI TRẢ TRONG 30 NGÀY
                </h4>
                <p className='text-gray-600 text-sm tracking-tighter'>
                    Đảm bảo hoàn tiền
                </p>
            </div>

            <div className='flex flex-col items-center'>
                <div className='p-4 rounded-full mb-4'>
                    <HiOutlineCreditCard className='text-xl' />
                </div>
                <h4 className='tracking-tighter mb-2'>
                    GIAO DỊCH AN TOÀN
                </h4>
                <p className='text-gray-600 text-sm tracking-tighter'>
                    Quy trình thanh toán an toàn 100%
                </p>
            </div>
        </div>
    </section>
  )
}

export default FeaturedSection