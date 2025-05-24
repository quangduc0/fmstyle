import React from 'react'
import heroImg from '../../assets/hero-img.png'
import { Link } from 'react-router-dom'

const Hero = () => {
  return (
    <section className='relative'>
        <img src={heroImg} 
            alt='Hero Image' 
            className='w-full h-[400px] md:h-[500px] lg:h-[750px] object-cover' />
        <div className='absolute inset-0 bg-black bg-opacity-5 flex items-center justify-center'>
            <div className='text-center text-white p-6'>
                <h1 className='text-4xl md:text-9xl font-bold tracking-tighter uppercase mb-4'>
                    Áo thun nam nữ <br /> 
                </h1>
                <div className="flex flex-col items-center gap-4">
                    <p className="text-sm font-bold bg-black bg-opacity-20 px-4 py-2 tracking-tighter md:text-lg w-fit rounded">
                    Khám phá những bộ trang phục của chúng tôi với dịch vụ vận chuyển nhanh chóng trên toàn quốc
                    </p>
                    <Link to="/collections/all" 
                        className="bg-white text-gray-950 px-6 py-2 rounded-md text-lg hover:bg-gray-200 transition duration-300 shadow-md">
                        Khám phá ngay
                    </Link>
                </div>
            </div>
        </div>
    </section>
  )
}

export default Hero