import React, { useEffect, useState } from 'react'
import Hero from '../components/Layout/Hero'
import GenderCollectonSection from '../components/Products/GenderCollectonSection'
import NewArrivals from '../components/Products/NewArrivals'
import ProductDetails from '../components/Products/ProductDetails'
import ProductGrid from '../components/Products/ProductGrid'
import FeaturedCollection from '../components/Products/FeaturedCollection'
import FeaturedSection from '../components/Products/FeaturedSection'
import { useDispatch, useSelector } from "react-redux"
import { fetchProductByFilters } from '../redux/slices/productSlice'
import axios from 'axios'

const Home = () => {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.products);
  const [bestSellerProduct, setBestSellerProduct] = useState(null);

  useEffect(() => {
    dispatch(fetchProductByFilters({
      gender: "Nữ",
      category: "Top Wear",
      limit: 8,
    }));

    const fetchBestSeller = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products/best-seller`);
        setBestSellerProduct(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchBestSeller();
  }, [dispatch]);
  return (
    <div>
      <Hero />
      <GenderCollectonSection />
      <NewArrivals />
      {/* <h2 className='text-3xl text-center font-bold mb-4'>Bán Chạy Nhất</h2>
      {bestSellerProduct ? (<ProductDetails productId={bestSellerProduct._id} />) : (
        <p className='text-center'>Đang tải sản phẩm bán chạy nhất ...</p>
      )} */}


      <div className='container mx-auto'>
        <h2 className='text-3xl text-center font-bold mb-4'>
          Xu Hướng Nữ Hot Nhất
        </h2>
        <ProductGrid products={products} loading={loading} error={error} />
      </div>

      <FeaturedCollection />
      <FeaturedSection />
    </div>
  )
}

export default Home