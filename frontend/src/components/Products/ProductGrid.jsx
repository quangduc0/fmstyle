import React from 'react'
import { Link } from 'react-router-dom'
import { formatter } from '../../utils/fomater'

const ProductGrid = ({ products, loading, error }) => {
    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-500">Lỗi: {error}</p>
            </div>
        );
    }
    
    if (!products || products.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Không tìm thấy sản phẩm nào.</p>
            </div>
        );
    }
    
    return (
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6'>
            {products.map((product) => (
                <Link key={product._id} to={`/products/${product._id}`} className='group block'>
                    <div className='bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200'>
                        <div className='w-full h-96 mb-4 aspect-[3/4] overflow-hidden rounded-t-lg relative'>
                            {product.images && product.images.length > 0 ? (
                                <img 
                                    src={product.images[0].url}
                                    alt={product.images[0].altText || product.name}
                                    className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-400">Không có hình ảnh</span>
                                </div>
                            )}
                            
                            {/* Badge cho sản phẩm giảm giá */}
                            {product.discountPrice && product.discountPrice < product.price && (
                                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                    -{Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
                                </div>
                            )}
                        </div>
                        
                        <div className='p-3'>
                            <h3 className='text-sm font-medium text-gray-800 mb-1 line-clamp-2 h-10'>{product.name}</h3>
                            
                            <div className="flex items-center mt-2">
                                {product.discountPrice && product.discountPrice < product.price ? (
                                    <>
                                        <p className='text-red-600 font-medium mr-2'>{formatter(product.discountPrice)}</p>
                                        <p className='text-gray-500 text-sm line-through'>{formatter(product.price)}</p>
                                    </>
                                ) : (
                                    <p className='font-medium text-gray-700'>{formatter(product.price)}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    )
}

export default ProductGrid