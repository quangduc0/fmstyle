import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchProductDetails, updateProduct } from '../../redux/slices/productSlice';
import axios from 'axios';
import colorMap from '../../utils/colorMap';
import { colorHexMap } from '../../utils/colorMap';
import { formatter } from '../../utils/fomater';

const EditProduct = ({ productId }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    const { selectedProduct, loading, error } = useSelector((state) => state.products)

    const [productData, setProductData] = useState({
        name: "",
        description: "",
        price: 0,
        discountPrice: 0,
        countInStock: 0,
        sku: "",
        category: "",
        brand: "",
        sizes: [],
        colors: [],
        collections: "",
        material: "",
        gender: "",
        images: [],
    });

    const MAX_IMAGES = 5;

    const [discountType, setDiscountType] = useState('direct');
    const [discountPercentage, setDiscountPercentage] = useState('');

    const [uploading, setUploading] = useState(false);
    const productFetchId = productId || id;

    const availableSizes = ["S", "M", "L", "XL", "XXL"];
    const availableColors = Object.keys(colorMap);

    useEffect(() => {
        if (id) {
            dispatch(fetchProductDetails({ id: productFetchId }));
        }
    }, [dispatch, id]);

    useEffect(() => {
        if (selectedProduct) {
            setProductData(selectedProduct);

            if (selectedProduct.discountPrice && selectedProduct.discountPrice > 0) {
                setDiscountType('direct');
            }
        }
    }, [selectedProduct])

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        
        if (name === 'price' || name === 'discountPrice') {
            let numValue;
            
            if (value === '' || isNaN(parseFloat(value))) {
                numValue = 0;
            } else {
                numValue = parseFloat(value);
                numValue = Math.max(0, numValue);
            }
            
            setProductData((prevData) => ({ ...prevData, [name]: numValue }));
        } else {
            setProductData((prevData) => ({ ...prevData, [name]: value }));
        }
    }

    const calculateDiscountPrice = () => {
        if (!discountPercentage || !productData.price) return;

        const discountValue = parseFloat(discountPercentage.replace(/[+\-%]/g, '')) || 0;
        const isIncrease = discountPercentage.includes('+');

        let calculatedPrice;
        if (isIncrease) {
            calculatedPrice = productData.price * (1 + discountValue / 100);
        } else {
            calculatedPrice = productData.price * (1 - discountValue / 100);
        }

        const roundedPrice = Math.round(calculatedPrice);
        setProductData(prev => ({
            ...prev,
            discountPrice: roundedPrice
        }));
    };

    const handleSizeToggle = (size) => {
        setProductData((prevData) => {
            const sizeIndex = prevData.sizes.indexOf(size);

            if (sizeIndex !== -1) {
                const newSizes = [...prevData.sizes];
                newSizes.splice(sizeIndex, 1);
                return { ...prevData, sizes: newSizes };
            }
            else {
                return { ...prevData, sizes: [...prevData.sizes, size] };
            }
        });
    };

    const handleColorToggle = (color) => {
        setProductData((prevData) => {
            const colorIndex = prevData.colors.indexOf(color);

            if (colorIndex !== -1) {
                const newColors = [...prevData.colors];
                newColors.splice(colorIndex, 1);
                return { ...prevData, colors: newColors };
            }
            else {
                return { ...prevData, colors: [...prevData.colors, color] };
            }
        });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];

        if (productData.images.length >= MAX_IMAGES) {
            toast.error(`Bạn chỉ có thể tải lên tối đa ${MAX_IMAGES} hình ảnh cho mỗi sản phẩm.`, {
                duration: 3000
            });
            return;
        }

        const formData = new FormData();
        formData.append("image", file);

        try {
            setUploading(true);
            const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/upload`, formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );
            setProductData((prevData) => ({
                ...prevData,
                images: [...prevData.images, { url: data.imageUrl, altText: "" }],
            }));
            setUploading(false);
        } catch (error) {
            console.error(error);
            setUploading(false);
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(updateProduct({ id, productData }));
        navigate("/admin/products")
    }

    if (loading) return <p>Đang tải...</p>;
    if (error) return <p>Lỗi: {error}</p>;

    return (
        <div className='max-w-5xl mx-auto p-6 shadow-md rounded-md'>
            <h2 className='text-3xl font-bold mb-6'>Chỉnh sửa sản phẩm</h2>
            <form onSubmit={handleSubmit}>
                <div className='mb-6'>
                    <label className='block font-semibold mb-2'>Tên sản phẩm</label>
                    <input type="text"
                        name='name'
                        value={productData.name}
                        onChange={handleChange}
                        className='w-full border border-gray-300 rounded-md p-2'
                        required />
                </div>

                <div className='mb-6'>
                    <label className='block font-semibold mb-2'>Mô tả</label>
                    <textarea name="description"
                        value={productData.description}
                        onChange={handleChange}
                        className='w-full border border-gray-300 rounded-md p-2'
                        rows={4}
                        required ></textarea>
                </div>

                <div className='mb-6'>
                    <label className='block font-semibold mb-2'>Giá</label>
                    <input type="number"
                        name='price'
                        value={productData.price}
                        onChange={handleChange}
                        className='w-full border border-gray-300 rounded-md p-2' />
                </div>

                <div className='mb-6'>
                    <label className='block font-semibold mb-2'>Giá khuyến mãi</label>
                    <div className="flex mb-2">
                        <label className="inline-flex items-center mr-4">
                            <input
                                type="radio"
                                value="direct"
                                checked={discountType === 'direct'}
                                onChange={() => setDiscountType('direct')}
                                className="mr-2"
                            />
                            <span>Nhập trực tiếp</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                value="percentage"
                                checked={discountType === 'percentage'}
                                onChange={() => setDiscountType('percentage')}
                                className="mr-2"
                            />
                            <span>Tính theo phần trăm</span>
                        </label>
                    </div>

                    {discountType === 'direct' ? (
                        <input
                            type="number"
                            name='discountPrice'
                            value={productData.discountPrice}
                            onChange={handleChange}
                            min="0"
                            className='w-full border border-gray-300 rounded-md p-2'
                        />
                    ) : (
                        <div className="flex items-center">
                            <input
                                type="text"
                                value={discountPercentage}
                                onChange={(e) => setDiscountPercentage(e.target.value)}
                                className='border border-gray-300 rounded-md p-2 mr-2'
                                placeholder="-10% hoặc +5%"
                            />
                            <button
                                type="button"
                                onClick={calculateDiscountPrice}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                Tính
                            </button>

                            {productData.discountPrice > 0 && (
                                <div className="ml-4">
                                    <span className="text-gray-700">Giá sau giảm: </span>
                                    <span className="font-semibold">{formatter(productData.discountPrice)}</span>
                                </div>
                            )}
                        </div>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                        {discountType === 'direct'
                            ? "Nhập giá muốn giảm"
                            : "Nhập số phần trăm muốn giảm."}
                    </p>
                </div>

                <div className='mb-6'>
                    <label className='block font-semibold mb-2'>Số lượng còn lại</label>
                    <input type="number"
                        name='countInStock'
                        value={productData.countInStock}
                        onChange={handleChange}
                        className='w-full border border-gray-300 rounded-md p-2' />
                </div>

                <div className='mb-6'>
                    <label className='block font-semibold mb-2'>SKU</label>
                    <input type="text"
                        name='sku'
                        value={productData.sku}
                        onChange={handleChange}
                        className='w-full border border-gray-300 rounded-md p-2' />
                </div>

                <div className='mb-6'>
                    <label className='block font-semibold mb-2'>Kích cỡ</label>
                    <div className='flex flex-wrap gap-2'>
                        {availableSizes.map((size) => (
                            <button
                                type="button"
                                key={size}
                                onClick={() => handleSizeToggle(size)}
                                className={`px-4 py-2 rounded border ${productData.sizes.includes(size)
                                    ? 'bg-black text-white'
                                    : 'bg-white text-black'
                                    }`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                    <div className='mt-2 text-sm text-gray-600'>
                        Kích cỡ đã chọn: {productData.sizes.join(", ")}
                    </div>
                </div>

                <div className='mb-6'>
                    <label className='block font-semibold mb-2'>Màu sắc</label>
                    <div className='flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded'>
                        {availableColors.map((color) => (
                            <button
                                type="button"
                                key={color}
                                onClick={() => handleColorToggle(color)}
                                className={`px-3 py-1 rounded border flex items-center ${productData.colors.includes(color)
                                    ? 'bg-gray-100 border-gray-400'
                                    : 'bg-white border-gray-200'
                                    }`}
                            >
                                <span
                                    className="w-4 h-4 inline-block mr-2 rounded-full border border-gray-300"
                                    style={{ backgroundColor: colorHexMap[color] || color.toLowerCase() }}
                                ></span>
                                <span className="text-sm">
                                    {colorMap[color] || color}
                                </span>
                                {productData.colors.includes(color) && (
                                    <span className="ml-1 text-green-600">✓</span>
                                )}
                            </button>
                        ))}
                    </div>
                    <div className='mt-2 text-sm text-gray-600'>
                        Màu sắc đã chọn: {productData.colors.map(color => colorMap[color] || color).join(", ")}
                    </div>
                </div>

                <div className='mb-6'>
                    <label className='block font-semibold mb-2'>Danh mục</label>
                    <input type="text"
                        name='category'
                        value={productData.category || ""}
                        onChange={handleChange}
                        className='w-full border border-gray-300 rounded-md p-2' />
                </div>

                <div className='mb-6'>
                    <label className='block font-semibold mb-2'>Thương hiệu</label>
                    <input type="text"
                        name='brand'
                        value={productData.brand || ""}
                        onChange={handleChange}
                        className='w-full border border-gray-300 rounded-md p-2' />
                </div>

                <div className='mb-6'>
                    <label className='block font-semibold mb-2'>Bộ sưu tập</label>
                    <input type="text"
                        name='collections'
                        value={productData.collections || ""}
                        onChange={handleChange}
                        className='w-full border border-gray-300 rounded-md p-2' />
                </div>

                <div className='mb-6'>
                    <label className='block font-semibold mb-2'>Chất liệu</label>
                    <input type="text"
                        name='material'
                        value={productData.material || ""}
                        onChange={handleChange}
                        className='w-full border border-gray-300 rounded-md p-2' />
                </div>

                <div className='mb-6'>
                    <label className='block font-semibold mb-2'>Giới tính</label>
                    <input type="text"
                        name='gender'
                        value={productData.gender || ""}
                        onChange={handleChange}
                        className='w-full border border-gray-300 rounded-md p-2' />
                </div>

                <div className='mb-6'>
                    <label className='block font-semibold mb-2'>
                        Tải hình ảnh lên ({productData.images.length}/{MAX_IMAGES})
                    </label>
                    <input
                        type="file"
                        onChange={handleImageUpload}
                        disabled={productData.images.length >= MAX_IMAGES || uploading}
                    />
                    {productData.images.length >= MAX_IMAGES && (
                        <p className="text-red-500 text-sm mt-1">
                            Bạn đã đạt giới hạn số lượng hình ảnh
                        </p>
                    )}
                    <div className='flex flex-wrap gap-4 mt-4'>
                        {productData.images.map((image, index) => (
                            <div key={index} className="relative">
                                <img
                                    src={image.url}
                                    alt={image.altText || "Product Image"}
                                    className='w-20 h-20 object-cover rounded-md shadow-md'
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setProductData(prev => ({
                                            ...prev,
                                            images: prev.images.filter((_, i) => i !== index)
                                        }))
                                    }}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                                >
                                    &times;
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <button type='submit'
                    className='w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition-colors'
                    disabled={loading || uploading}
                >
                    {loading
                        ? "Đang cập nhật..."
                        : uploading
                            ? "Đang tải ảnh lên..."
                            : "Cập nhật sản phẩm"}
                </button>
            </form>
        </div>
    )
}

export default EditProduct