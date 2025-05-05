import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import register from '../assets/banner.png'
import { registerUser } from '../redux/slices/authSlice'
import { useDispatch, useSelector } from 'react-redux'
import { mergeCart } from '../redux/slices/cartSlice'

const Register = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, guestId, loading } = useSelector((state) => state.auth);
    const { cart } = useSelector((state) => state.cart);

    const redirect = new URLSearchParams(location.search).get("redirect") || "/";
    const isCheckoutRedirect = redirect.includes("checkout");

    useEffect(() => {
        if (user) {
            if (cart?.products.length > 0 && guestId) {
                dispatch(mergeCart({ guestId, user })).then(() => {
                    navigate(isCheckoutRedirect ? "/checkout" : "/");
                });
            } else {
                navigate(isCheckoutRedirect ? "/checkout" : "/");
            }
        }
    }, [user, guestId, cart, navigate, isCheckoutRedirect, dispatch]);

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(registerUser({name, email, password}));
    };

  return (
    <div className='flex'>
        <div className='w-full md:w-1/2 flex flex-col justify-center items-center p-8 md:p-12'>
            <form onSubmit={handleSubmit} className='w-full max-w-md bg-white p-8 rounded-lg border shadow-sm'>
                <div className='flex justify-center mb-6'>
                    <h2 className='text-xl font-medium'>FM Style</h2>
                </div>
                <h2 className='text-2xl font-bold text-center mb-6'>Chào bạn!</h2>
                <p className='text-center mb-6'>
                    Nhập tên người dùng và mật khẩu của bạn để đăng nhập.
                </p>
                <div className='mb-4'>
                    <label className='block text-sm font-semibold mb-2'>Tên đăng nhập</label>
                    <input type='text' 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className='w-full p-2 border rounded'
                    placeholder='Nhập tên đăng nhập của bạn' />
                </div>
                <div className='mb-4'>
                    <label className='block text-sm font-semibold mb-2'>Email</label>
                    <input type='email' 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    className='w-full p-2 border rounded'
                    placeholder='Nhập địa chỉ email của bạn' />
                </div>
                <div className='mb-4'>
                    <label className='block text-sm font-semibold mb-2'>Mật khẩu</label>
                    <input type='password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className='w-full p-2 border rounded'
                    placeholder='Nhập mật khẩu của bạn' />
                </div>
                <button type='submit'
                className='w-full bg-black text-white p-2 rounded-lg font-semibold hover:bg-gray-800 transition' >
                    {loading ? "Đang tải..." : "Đăng ký"}
                </button>
                <p className='mt-6 text-center text-sm'>
                    Chưa có tài khoản? {" "}
                    <Link to={`/login?redirect=${encodeURIComponent(redirect)}`} className='text-blue-500'>
                        Đăng nhập
                    </Link>
                </p>
            </form>
        </div>
        <div className='hidden md:block w-1/2 bg-gray-800'>
            <div className='h-full flex flex-col justify-center items-center'>
                <img src={register} alt='Login to Account' className='h-[750] w-full object-cover' />
            </div>
        </div>
    </div>
  )
}

export default Register