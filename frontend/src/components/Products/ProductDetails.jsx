import React, { useEffect, useState } from 'react'
import { formatter } from '../../utils/fomater'
import { toast } from 'sonner';
import ProductGrid from './ProductGrid';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductDetails, fetchSimlarProducts } from '../../redux/slices/productSlice';
import { addToCart } from '../../redux/slices/cartSlice';
import { colorMap, colorHexMap } from '../../utils/colorMap';

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

    const isOutOfStock = selectedProduct?.countInStock <= 0;

    const hasDiscount = selectedProduct?.discountPrice &&
        selectedProduct.discountPrice > 0 &&
        selectedProduct.discountPrice < selectedProduct.price;

    const discountPercentage = hasDiscount
        ? Math.round(((selectedProduct.price - selectedProduct.discountPrice) / selectedProduct.price) * 100)
        : 0;

    const handleQuantityChange = (action) => {
        if (action === "plus" && quantity < (selectedProduct?.countInStock || 1)) {
            setQuantity((prev) => prev + 1);
        }
        if (action === "minus" && quantity > 1) {
            setQuantity((prev) => prev - 1);
        }
    }

    const handleAddToCart = () => {
        if (isOutOfStock) {
            toast.error("Rất tiếc, sản phẩm này đã hết hàng.", { duration: 3000 });
            return;
        }

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

                            <div className="flex items-center mb-4">
                                {hasDiscount ? (
                                    <>
                                        <p className='text-xl font-medium text-red-600 mr-2'>
                                            {formatter(selectedProduct.discountPrice)}
                                        </p>
                                        <p className='text-lg text-gray-500 line-through mr-2'>
                                            {formatter(selectedProduct.price)}
                                        </p>
                                        <span className="px-2 py-1 bg-red-100 text-red-700 text-sm font-medium rounded">
                                            -{discountPercentage}%
                                        </span>
                                    </>
                                ) : (
                                    <p className='text-xl font-medium text-gray-700 mb-2'>
                                        {formatter(selectedProduct.price)}
                                    </p>
                                )}
                            </div>

                            <div className='mb-4'>
                                {isOutOfStock ? (
                                    <span className='inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full font-medium'>
                                        Hết hàng
                                    </span>
                                ) : (
                                    <span className='inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full font-medium'>
                                        Còn hàng: {selectedProduct.countInStock}
                                    </span>
                                )}
                            </div>
                            <div className="overflow-y-auto max-h-[300px] pr-4 mb-6 ">
                                <p className='text-gray-600 mb-4'>
                                    {selectedProduct.description}
                                </p>
                                <div className='mb-4'>
                                    <p className='text-gray-700'>Màu sắc:</p>
                                    <div className='flex flex-wrap gap-2 mt-2'>
                                        {selectedProduct.colors.map((color) => (
                                            <button key={color}
                                                onClick={() => !isOutOfStock && setSelectedColor(color)}
                                                className={`relative w-10 h-10 rounded-full border-2 
                                                ${selectedColor === color ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-300'}
                                                ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 transition-transform'}`}
                                                style={{
                                                    backgroundColor: colorHexMap[color] || color.toLowerCase()
                                                }}
                                                disabled={isOutOfStock}
                                                title={colorMap[color] || color}
                                            >
                                                {selectedColor === color && (
                                                    <span className="absolute inset-0 flex items-center justify-center text-white text-sm font-bold">
                                                        ✓
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                    {selectedColor && (
                                        <p className="mt-2 text-sm text-gray-600">
                                            Màu đã chọn: {colorMap[selectedColor] || selectedColor}
                                        </p>
                                    )}
                                </div>
                                <div className='mb-4'>
                                    <p className='text-gray-700'>Kích cỡ:</p>
                                    <div className='flex gap-2 mt-2'>
                                        {selectedProduct.sizes.map((size) => (
                                            <button key={size}
                                                onClick={() => !isOutOfStock && setSelectedSize(size)}
                                                className={`px-4 py-2 rounded border 
                                                ${selectedSize === size ? 'bg-black text-white' : ''}
                                                ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                disabled={isOutOfStock}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {!isOutOfStock && (
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
                                )}
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
                                            <tr>
                                                <td className='py-1'>Giới tính:</td>
                                                <td className='py-1'>{selectedProduct.gender}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                            </div>
                            <button onClick={handleAddToCart}
                                disabled={isButtonDisabled || isOutOfStock}
                                className={`bg-black text-white py-2 px-6 rounded w-full mb-4 
                                    ${(isButtonDisabled || isOutOfStock) ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-900'}`}>
                                {isOutOfStock
                                    ? "Hết hàng"
                                    : isButtonDisabled
                                        ? "Đang thêm..."
                                        : "Thêm vào giỏ hàng"}
                            </button>


                        </div>
                    </div>

                    {similarProducts?.length > 0 && (
                        <div className='mt-16'>
                            <h2 className='text-2xl font-bold mb-6 text-center'>Sản Phẩm Tương Tự</h2>
                            <ProductGrid products={similarProducts} />
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default ProductDetails