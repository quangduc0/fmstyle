import React from 'react'
import mensCollectionImg from '../../assets/men-collection.png'
import womensCollectionImg from '../../assets/women-collection.png'
import { Link } from 'react-router-dom'

const GenderCollectonSection = () => {
  return (
    <section className='py-16 px-4 lg:px-0'>
        <div className='container mx-auto flex flex-col md:flex-row gap-8'>
            <div className='relative flex-1'>
                <img src={womensCollectionImg} 
                alt='Womens Collection' 
                className='w-full h-[700px] object-cover' />
                <div className='absolute bottom-8 left-8 bg-white bg-opacity-90 p-4'>
                    <h2 className='text-2xl font-bold text-gray-900 mb-3'>
                        Thời trang nữ
                    </h2>
                    <Link to='/collections/all?gender=Women'
                        className='text-gray-900 underline'>
                            Khám phá ngay
                    </Link>
                </div>
            </div>
            <div className='relative flex-1'>
                <img src={mensCollectionImg} 
                alt='Mens Collection' 
                className='w-full h-[700px] object-cover' />
                <div className='absolute bottom-8 left-8 bg-white bg-opacity-90 p-4'>
                    <h2 className='text-2xl font-bold text-gray-900 mb-3'>
                        Thời trang nam
                    </h2>
                    <Link to='/collections/all?gender=Men'
                        className='text-gray-900 underline'>
                            Khám phá ngay
                    </Link>
                </div>
            </div>
        </div>
    </section>
  )
}

export default GenderCollectonSection