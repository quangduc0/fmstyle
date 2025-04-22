import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BankingButton from './BankingButton'
import { formatter } from '../../utils/fomater'

const cart = {
    products: [
        {
            name: "T-shirt",
            size: "XL",
            color: "Đen",
            price: 150000,
            image: "https://picsum.photos/200?random=1"
        },
        {
            name: "Quan jeans",
            size: "42",
            color: "Xanh dương",
            price: 250000,
            image: "https://picsum.photos/200?random=2"
        },
    ],
    totalPrice: 400000,
}

const Checkout = () => {
    const navigate = useNavigate();
    const [checkoutId, setCheckOutId] = useState(null);
    const [shipAddress, setShipAddress] = useState({
        firstName: "",
        lastName: "",
        address: "",
        city: "",
        postalCode: "",
        country: "",
        phone: "",
    })

    const handleCreateCheckout = (e) => {
        e.preventDefault();
        setCheckOutId(123);
    }

    const handlePaymentSuccess = (details) => {
        console.log("Thanh toan thanh cong", details);
        navigate("/order-confirmation")
    }

  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto py-10 px-6 tracking-tighter'>
        <div className='bg-white rounded-lg p-6'>
            <h2 className='text-2xl uppercase mb-6'>Thanh toán</h2>
            <form onSubmit={handleCreateCheckout}>
                <h3 className='text-lg mb-4'>Thông tin liên hệ</h3>
                <div className='mb-4'>
                    <label className='block text-gray-700'>Email</label>
                    <input type='email'
                    value='aa@gmail.com'
                    className='w-full p-2 border rounded'
                    disabled />
                </div>
                <h3 className='text-lg mb-4'>Thông tin giao hàng</h3>
                <div className='mb-4 grid grid-cols-2 gap-4'>
                    <div>
                        <label className='block text-gray-700'>Tên</label>
                        <input type='text'
                        value={shipAddress.firstName}
                        onChange={(e) => setShipAddress({...shipAddress, firstName: e.target.value})}
                        className='w-full p-2 border rounded'
                        required />
                    </div>
                    <div>
                        <label className='block text-gray-700'>Họ</label>
                        <input type='text'
                        value={shipAddress.lastName}
                        onChange={(e) => setShipAddress({...shipAddress, lastName: e.target.value})}
                        className='w-full p-2 border rounded'
                        required />
                    </div>
                </div>
                <div className='mb-4'>
                    <label className='block text-gray-700'>Địa chỉ</label>
                    <input type='text'
                    value={shipAddress.address}
                    onChange={(e) => setShipAddress({...shipAddress, address: e.target.value})}
                    className='w-full p-2 border rounded'
                    required />
                </div>
                <div className='mb-4 grid grid-cols-2 gap-4'>
                    <div>
                        <label className='block text-gray-700'>Thành phố</label>
                        <input type='text'
                        value={shipAddress.city}
                        onChange={(e) => setShipAddress({...shipAddress, city: e.target.value})}
                        className='w-full p-2 border rounded'
                        required />
                    </div>
                    <div>
                        <label className='block text-gray-700'>Mã bưu chính</label>
                        <input type='text'
                        value={shipAddress.postalCode}
                        onChange={(e) => setShipAddress({...shipAddress, postalCode: e.target.value})}
                        className='w-full p-2 border rounded'
                        required />
                    </div>
                </div>
                <div className='mb-4'>
                    <label className='block text-gray-700'>Quốc gia</label>
                    <input type='text'
                    value={shipAddress.country}
                    onChange={(e) => setShipAddress({...shipAddress, country: e.target.value})}
                    className='w-full p-2 border rounded'
                    required />
                </div>
                <div className='mb-4'>
                    <label className='block text-gray-700'>Điện thoại</label>
                    <input type='tel'
                    value={shipAddress.phone}
                    onChange={(e) => setShipAddress({...shipAddress, phone: e.target.value})}
                    className='w-full p-2 border rounded'
                    required />
                </div>
                <div className='mt-6'>
                    {!checkoutId ? (
                        <button type='submit'
                        className='w-full bg-black text-white py-3 rounded' >
                            Tiến hành thanh toán
                        </button>
                    ) : (
                        <div>
                            <h3 className='text-lg mb-4'>Thanh toán bằng</h3>
                            <BankingButton amount={10000000} 
                            onSuccess={handlePaymentSuccess}
                            onError={(err) => alert("Thanh toán không thành công. Hãy thử lại.")} />
                        </div>
                    )}
                </div>
            </form>
        </div>

        <div className='bg-gray-50 p-6 rounded-lg'>
            <h3 className='text-lg mb-4'>Tổng quan đơn hàng</h3>
            <div className='border-t py-4 mb-4'>
                {cart.products.map((product, index) => (
                    <div key={index}
                    className='flex items-start justify-between py-2 border-b' >
                        <div className='flex items-start'>
                            <img src={product.image}
                            alt={product.name}
                            className='w-20 h-24 object-cover mr-4' />
                            <div>
                                <h3 className='text-md'>{product.name}</h3>
                                <p className='text-gray-500'>Kích cỡ: {product.size}</p>
                                <p className='text-gray-500'>Màu sắc: {product.color}</p>
                            </div>     
                        </div>
                        <p className='text-xl'>{formatter(product.price)}</p>
                    </div>
                ))}
            </div>
            <div className='flex justify-between items-center text-lg mb-4'>
                <p>Số tiền tạm tính</p>
                <p>{formatter(cart.totalPrice)}</p>
            </div>
            <div className='flex justify-between items-center text-lg'>
                <p>Phí giao hàng</p>
                <p>Miễn phí</p>
            </div>
            <div className='flex justify-between items-center text-lg mt-4 border-t pt-4'>
                <p>Tổng tiền</p>
                <p>{formatter(cart.totalPrice)}</p>
            </div>
        </div>
    </div>
  )
}

export default Checkout