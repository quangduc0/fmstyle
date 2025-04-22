import React, { useState } from 'react'

const EditProduct = () => {
    const [productData, setProductData] = useState({
        name: "",
        description: "",
        price: 0,
        countInStock: 0,
        sku: "",
        category: "",
        brand: "",
        sizes: [],
        colors: [],
        collections: "",
        material: "",
        gender: "",
        images: [
            {
                url: "https://picsum.photos/200?random=1",
            },
            {
                url: "https://picsum.photos/200?random=2",
            },
        ]
    });

    const handleChange = (e) => {
        const {name, value} = e.target;
        setProductData((prevData) => ({...prevData, [name]: value}));
    }

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        
        
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(productData);
        
    }

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
                <input type="text"
                 name='sizes'
                 value={productData.sizes.join(", ")}
                 onChange={(e) => setProductData({
                    ...productData, sizes: e.target.value.split(",").map((size) => size.trim()),})}
                 className='w-full border border-gray-300 rounded-md p-2' />
            </div>

            <div className='mb-6'>
                <label className='block font-semibold mb-2'>Màu sắc</label>
                <input type="text"
                 name='colors'
                 value={productData.colors.join(", ")}
                 onChange={(e) => setProductData({
                    ...productData, colors: e.target.value.split(",").map((color) => color.trim()),})}
                 className='w-full border border-gray-300 rounded-md p-2' />
            </div>

            <div className='mb-6'>
                <label className='block font-semibold mb-2'>Tải hình ảnh lên</label>
                <input type="file"
                 onChange={handleImageUpload} />

                <div className='flex gap-4 mt-4'>
                    {productData.images.map((image, index) => (
                        <div key={index}>
                            <img src={image.url} alt={image.altText || "Product Image"}
                             className='w-20 h-20 object-cover rounded-md shadow-md' />
                        </div>
                    ))}
                </div>
            </div>
            <button type='submit'
             className='w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition-colors'>
                Cập nhật sản phẩm
            </button>
        </form>
    </div>
  )
}

export default EditProduct