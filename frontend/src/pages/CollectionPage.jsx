import React, { useEffect, useRef, useState } from 'react';
import {FaFilter} from 'react-icons/fa'
import FilterSideBar from '../components/Products/FilterSideBar';
import SortOptions from '../components/Products/SortOptions';
import ProductGrid from '../components/Products/ProductGrid';

const CollectionPage = () => {
    const [products, setProducts] = useState([]);
    const sidebarRef = useRef(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleClickOutSide = (e) => {
        if(sidebarRef.current && !sidebarRef.current.contains(e.target)){
            setIsSidebarOpen(false);
        }
    }

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutSide);
        return () => {
          document.removeEventListener("mousedown", handleClickOutSide);
        }
    }, [])

    useEffect(() => {
        setTimeout(() => {
            const fetchedProducts = [
                {
                  _id: 1,
                  name: "Sản phẩm 1",
                  price: 100000,
                  images: [{url: "https://picsum.photos/500/500?random=2"}],
                },
                {
                  _id: 2,
                  name: "Sản phẩm 2",
                  price: 100000,
                  images: [{url: "https://picsum.photos/500/500?random=3"}],
                },
                {
                  _id: 3,
                  name: "Sản phẩm 3",
                  price: 100000,
                  images: [{url: "https://picsum.photos/500/500?random=4"}],
                },
                {
                  _id: 4,
                  name: "Sản phẩm 4",
                  price: 100000,
                  images: [{url: "https://picsum.photos/500/500?random=5"}],
                },
                {
                  _id: 5,
                  name: "Sản phẩm 5",
                  price: 100000,
                  images: [{url: "https://picsum.photos/500/500?random=5"}],
                },
                {
                  _id: 6,
                  name: "Sản phẩm 6",
                  price: 100000,
                  images: [{url: "https://picsum.photos/500/500?random=6"}],
                },
                {
                  _id: 7,
                  name: "Sản phẩm 7",
                  price: 100000,
                  images: [{url: "https://picsum.photos/500/500?random=7"}],
                },
                {
                  _id: 8,
                  name: "Sản phẩm 8",
                  price: 100000,
                  images: [{url: "https://picsum.photos/500/500?random=8"}],
                },
              ]; 
              setProducts(fetchedProducts)
        }, 1000);
    }, []);
  return (
    <div className='flex flex-col lg:flex-row'>
        <button onClick={toggleSidebar}
         className='lg:hidden border p-2 flex justify-center items-center'>
            <FaFilter className='mr-2' /> Lọc sản phẩm
        </button>

        <div ref={sidebarRef}
            className={`${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
            fixed inset-y-0 z-50 left-0 w-64 bg-white overflow-y-auto transition-transform 
            duration-300 lg:static lg:translate-x-0`}>
            <FilterSideBar />
        </div>
        <div className='flex-grow p-4'>
            <h2 className='text-2xl uppercase mb-4'>Tất cả sản phẩm</h2>
            <SortOptions />
            <ProductGrid products={products} />
        </div>
    </div>
  )
}

export default CollectionPage