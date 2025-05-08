import React, { useEffect, useRef, useState } from 'react'
import {FiChevronLeft, FiChevronRight} from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { formatter } from '../../utils/fomater'
import axios from 'axios';

const NewArrivals = () => {
    const scrollRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(false);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
   
    const [newArrivals, setNewArrivals] = useState([]);

    useEffect(() => {
        const fetchNewArrivals = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products/new-arrivals`);
                setNewArrivals(response.data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchNewArrivals();
    }, []);

    // Các hàm xử lý sự kiện giữ nguyên
    const handleMouseDown = (e) => {
        setIsDragging(true);
        setStartX(e.pageX - scrollRef.current.offsetLeft);
        setScrollLeft(scrollRef.current.scrollLeft);
    }
    const handleMouseMove = (e) => {
        if(!isDragging) return;
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = x - startX;
        scrollRef.current.scrollLeft = scrollLeft - walk;
    }
    const handleMouseUpOrLeave = () => {
        setIsDragging(false);
    }

    const scroll = (direction) => {
        const scrollAmount = direction === "left" ? -300 : 300;
        scrollRef.current.scrollBy({left: scrollAmount, behaviour: "smooth"})
    }

    const updateScrollButtons = () => {
        const container = scrollRef.current;

        if(container){
            const leftScroll = container.scrollLeft;
            const rightScrollLable = container.scrollWidth > leftScroll + container.clientWidth;
            setCanScrollLeft(leftScroll > 0);
            setCanScrollRight(rightScrollLable);
        }
    }
    
    useEffect(() => {
        const container = scrollRef.current;
        if(container){
            container.addEventListener("scroll", updateScrollButtons);
            updateScrollButtons();
            return () => container.removeEventListener("scroll", updateScrollButtons);
        }
    }, [newArrivals])

    return (
        <section className='py-16 px-4 lg:px-0'>
            <div className='container mx-auto text-center mb-10 relative'>
                <h2 className='text-3xl font-bold mb-4'>Khám Phá Xu Hướng Mới</h2>
                <p className='text-lg text-gray-600 mb-8'>
                    Cập nhật ngay những xu hướng mới nhất, giữ cho phong cách của bạn luôn thời thượng.
                </p>
                <div className='absolute right-0 bottom-[-30px] flex space-x-2'>
                    <button 
                        onClick={() => scroll("left")}
                        disabled={!canScrollLeft}
                        className={`p-2 rounded border ${canScrollLeft ? 'bg-white text-black' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    >
                        <FiChevronLeft className='text-2xl' />
                    </button>
                    <button 
                        onClick={() => scroll("right")}
                        className={`p-2 rounded border ${canScrollRight ? 'bg-white text-black' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    >
                        <FiChevronRight className='text-2xl' />
                    </button>
                </div>
            </div>
            <div 
                ref={scrollRef} 
                className={`container mx-auto overflow-x-scroll flex space-x-6 relative ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUpOrLeave}
                onMouseLeave={handleMouseUpOrLeave}
            >
                {newArrivals.map((product) => (
                    <div key={product._id} className='min-w-[100%] sm:min-w-[50%] lg:min-w-[30%] relative group'>
                        <img 
                            src={product.images[0]?.url} 
                            alt={product.images[0]?.alText || product.name} 
                            className='w-full h-[500px] object-cover rounded-lg'
                            draggable="false"
                        />
                        <div className='absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-4 rounded-b-lg'>
                            <Link to={`/products/${product._id}`} className='block'>
                                <h4 className='text-lg font-bold mb-1 truncate'>{product.name}</h4>
                                <div className='flex justify-between items-center'>
                                    <p className='text-xl font-semibold text-white'>{formatter(product.price)}</p>
                                    <span className='bg-white text-black px-3 py-1 rounded-full text-sm font-medium'>
                                        Mới
                                    </span>
                                </div>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}

export default NewArrivals