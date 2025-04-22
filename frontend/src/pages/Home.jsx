import React from 'react'
import Hero from '../components/Layout/Hero'
import GenderCollectonSection from '../components/Products/GenderCollectonSection'
import NewArrivals from '../components/Products/NewArrivals'
import ProductDetails from '../components/Products/ProductDetails'
import ProductGrid from '../components/Products/ProductGrid'
import FeaturedCollection from '../components/Products/FeaturedCollection'
import FeaturedSection from '../components/Products/FeaturedSection'

const placeholderProducts = [
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
]

const Home = () => {
  return (
    <div>
        <Hero />
        <GenderCollectonSection />
        <NewArrivals />
        <h2 className='text-3xl text-center font-bold mb-4'>Bán Chạy Nhất</h2>
        <ProductDetails />

        <div className='container mx-auto'>
          <h2 className='text-3xl text-center font-bold mb-4'>
            Thời Trang Hàng Đầu Cho Nữ
          </h2>
          <ProductGrid products={placeholderProducts} />
        </div>

        <FeaturedCollection />
        <FeaturedSection />
    </div>
  )
}

export default Home