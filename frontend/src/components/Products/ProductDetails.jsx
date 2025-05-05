import React, { useEffect, useState } from 'react'
import { formatter } from '../../utils/fomater'
import { toast } from 'sonner';
import ProductGrid from './ProductGrid';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductDetails, fetchSimlarProducts } from '../../redux/slices/productSlice';
import { addToCart } from '../../redux/slices/cartSlice';

const ProductDetails = ({ productId }) => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { selectedProduct, loading, error, similarProducts } = useSelector((state) => state.products);
    const { user, guestId } = useSelector((state) => state.auth);
    const [mainImage, setMainImage] = useState("");
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);

    const productFetchId = productId || id;

    useEffect(() => {
        if (productFetchId) {
            dispatch(fetchProductDetails({ id: productFetchId }));
            dispatch(fetchSimlarProducts({ id: productFetchId }));
        }
    }, [dispatch, productFetchId]);

    useEffect(() => {
        if (selectedProduct?.images?.length > 0) {
            setMainImage(selectedProduct.images[0].url)
        }
    }, [selectedProduct]);

    const handleQuantityChange = (action) => {
        if (action === "plus") setQuantity((prev) => prev + 1);
        if (action === "minus" && quantity > 1) setQuantity((prev) => prev - 1);
    }

    const handleAddToCart = () => {
        if (!selectedSize || !selectedColor) {
            toast.error("Vui lòng chọn kích cỡ và màu sắc trước khi thêm vào giỏ hàng.",
                { duration: 1000 });
            return;
        }
        setIsButtonDisabled(true);

        dispatch(
            addToCart({
                productId: productFetchId,
                quantity,
                size: selectedSize,
                color: selectedColor,
                guestId,
                userId: user?._id,
            })
        ).then(() => {
            toast.success("Sản phẩm đã được thêm vào giỏ hàng!", {
                duration: 1000,
            });
        }).finally(() => {
            setIsButtonDisabled(false);
        });
    };

    if (loading) {
        return <p>Đang tải...</p>
    }

    if (error) {
        return <p>Lỗi: {error}</p>
    }
    return (
        <div className='p-6'>
            {selectedProduct && (
                <div className='max-w-6xl mx-auto bg-white p-8 rounded-lg'>
                    <div className='flex flex-col md:flex-row'>
                        <div className='hidden md:flex flex-col space-y-4 mr-6'>
                            {selectedProduct.images.map((image, index) => (
                                <img key={index}
                                    src={image.url}
                                    alt={image.alText || `Thumbnail ${index}`}
                                    className={`w-20 h-20 object-cover rounded-lg cursor-pointer border 
                                ${mainImage === image.url ? 'border-black' : 'border-gray-300'}`}
                                    onClick={() => setMainImage(image.url)} />
                            ))}
                        </div>
                        <div className='md:w-1/2'>
                            <div className='mb-4'>
                                <img src={mainImage}
                                    alt="Main Product"
                                    className='w-full h-auto object-cover rounded-lg' />
                            </div>
                        </div>
                        <div className='md:hidden flex overscroll-x-scroll space-x-4 mb-4'>
                            {selectedProduct.images.map((image, index) => (
                                <img key={index}
                                    src={image.url}
                                    alt={image.alText || `Thumbnail ${index}`}
                                    className={`w-20 h-20 object-cover rounded-lg cursor-pointer border 
                                ${mainImage === image.url ? 'border-black' : 'border-gray-300'}`}
                                    onClick={() => setMainImage(image.url)} />
                            ))}
                        </div>
                        <div className='md:w-1/2 md:ml-10'>
                            <h1 className='text-2xl md:text-3xl font-semibold mb-2'>
                                {selectedProduct.name}
                            </h1>
                            {selectedProduct.originalPrice && (
                                <p className='text-lg text-gray-600 mb-1 line-through'>
                                    {formatter(selectedProduct.originalPrice)}
                                </p>
                            )}
                            <p className='text-xl text-gray-500 mb-2'>
                                {formatter(selectedProduct.price)}
                            </p>
                            <p className='text-gray-600 mb-4'>
                                {selectedProduct.description}
                            </p>
                            <div className='mb-4'>
                                <p className='text-gray-700'>Màu sắc:</p>
                                <div className='flex gap-2 mt-2'>
                                    {selectedProduct.colors.map((color) => (
                                        <button key={color}
                                            onClick={() => setSelectedColor(color)}
                                            className={`w-8 h-8 rounded-full border 
                                    ${selectedColor === color ? 'border-4 border-black' : 'border-gray-300'}`}
                                            style={{
                                                backgroundColor: color.toLocaleLowerCase(),
                                                fitter: 'brightness(0.5)'
                                            }} ></button>
                                    ))}
                                </div>
                            </div>
                            <div className='mb-4'>
                                <p className='text-gray-700'>Kích cỡ:</p>
                                <div className='flex gap-2 mt-2'>
                                    {selectedProduct.sizes.map((size) => (
                                        <button key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`px-4 py-2 rounded border 
                                    ${selectedSize === size ? 'bg-black text-white' : ''}`} >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className='mb-6'>
                                <p className='text-gray-700'>Số lượng</p>
                                <div className='flex items-center space-x-4 mt-2'>
                                    <button onClick={() => handleQuantityChange("minus")}
                                        className='px-2 py-1 bg-gray-200 rounded text-lg'>-</button>
                                    <span className='text-lg'>{quantity}</span>
                                    <button onClick={() => handleQuantityChange("plus")}
                                        className='px-2 py-1 bg-gray-200 rounded text-lg'>+</button>
                                </div>
                            </div>
                            <button onClick={handleAddToCart}
                                disabled={isButtonDisabled}
                                className={`bg-black text-white py-2 px-6 rounded w-full mb-4 
                        ${isButtonDisabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-900'}`}>
                                {isButtonDisabled ? "Đang thêm..." : "Thêm vào giỏ hàng"}
                            </button>
                            <div className='mt-10 text-gray-700'>
                                <h3 className='text-xl font-bold mb-4'>Thông tin sản phẩm:</h3>
                                <table className='w-full text-left text-sm text-gray-600'>
                                    <tbody>
                                        <tr>
                                            <td className='py-1'>Thương hiệu:</td>
                                            <td className='py-1'>{selectedProduct.brand}</td>
                                        </tr>
                                        <tr>
                                            <td className='py-1'>Chất liệu:</td>
                                            <td className='py-1'>{selectedProduct.material}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div className='mt-20'>
                        <h2 className='text-2xl text-center font-medium mb-4'>
                            Có Thể Bạn Cũng Thích
                        </h2>
                        <ProductGrid products={similarProducts} />
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProductDetails