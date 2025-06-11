import React, { useEffect } from 'react'
import { formatter } from '../../utils/fomater'
import { RiDeleteBin3Line } from 'react-icons/ri'
import { useDispatch, useSelector } from 'react-redux'
import { removeFromCart, updateCartItemQuantity, clearExpiredItems, setExpirationNotified } from '../../redux/slices/cartSlice'
import { getVietnameseColor } from '../../utils/colorMap'
import { toast } from 'sonner'

const CartContent = ({ cart, userId, guestId }) => {
    const dispatch = useDispatch();
    const { expiredItems, expirationNotified } = useSelector(state => state.cart);

    useEffect(() => {
        if (expiredItems && expiredItems.length > 0 && !expirationNotified) {
            toast.warning(`Đã xóa ${expiredItems.length} sản phẩm chưa thanh toán quá lâu khỏi giỏ hàng`, {
                duration: 5000,
                action: {
                    label: "Đóng",
                    onClick: () => {
                        dispatch(clearExpiredItems());
                    }
                }
            });
            dispatch(setExpirationNotified(true));
        }
    }, [expiredItems, expirationNotified, dispatch]);

    const handleAddToCart = (productId, delta, quantity, size, color) => {
        const newQuantity = quantity + delta;
        if (newQuantity >= 1) {
            dispatch(
                updateCartItemQuantity({
                    productId,
                    quantity: newQuantity,
                    guestId,
                    userId,
                    size,
                    color,
                })
            )
        }
    };

    const handleRemoveFromCart = (productId, size, color) => {
        dispatch(removeFromCart({ productId, guestId, userId, size, color }));
    };

    const getDaysRemaining = (addedAt) => {
        if (!addedAt) return 5;
        
        const added = new Date(addedAt);
        const now = new Date();
        const diffTime = now - added;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        return Math.max(0, 5 - diffDays);
    };

    const getExpirationColor = (daysRemaining) => {
        if (daysRemaining <= 1) return 'text-red-600 font-medium';
        if (daysRemaining <= 2) return 'text-orange-600';
        return 'text-gray-500';
    };

    return (
        <div>
            {cart.products.map((product, index) => {
                const daysRemaining = getDaysRemaining(product.addedAt);
                const expirationColorClass = getExpirationColor(daysRemaining);
                
                return (
                    <div key={index} className='flex items-start justify-between py-4 border-b'>
                        <div className='flex items-start flex-1'>
                            <img src={product.image} alt={product.name} className='w-20 h-24 object-cover mr-4 rounded flex-shrink-0' />
                            <div className='flex-1 min-w-0'>
                                <h3 className='font-medium text-gray-900 mb-2 pr-4'>{product.name}</h3>
                                <p className='text-sm text-gray-500 mb-1'>
                                    Cỡ: {product.size} | Màu: {getVietnameseColor(product.color) || product.color}
                                </p>
                                <p className={`text-xs mb-3 ${expirationColorClass}`}>
                                    {daysRemaining > 0 ? (
                                        daysRemaining === 1 ? 
                                        "Hết hạn sau 1 ngày" : 
                                        `Hết hạn sau ${daysRemaining} ngày`
                                    ) : (
                                        "Sắp hết hạn"
                                    )}
                                </p>
                                <div className='flex items-center'>
                                    <button
                                        onClick={() => handleAddToCart(product.productId, -1, product.quantity, product.size, product.color)}
                                        className='border rounded px-2 py-1 text-xl font-medium hover:bg-gray-50'>
                                        -
                                    </button>
                                    <span className='mx-4 min-w-[2rem] text-center'>{product.quantity}</span>
                                    <button
                                        onClick={() => handleAddToCart(product.productId, 1, product.quantity, product.size, product.color)}
                                        className='border rounded px-2 py-1 text-xl font-medium hover:bg-gray-50'>
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        {/* Phần giá và nút xóa */}
                        <div className='flex flex-col items-end justify-between h-24 ml-4 flex-shrink-0'>
                            <p className='font-semibold text-gray-900'>{formatter(product.price * product.quantity)}</p>
                            <button 
                                onClick={() => handleRemoveFromCart(product.productId, product.size, product.color)}
                                className='p-1 hover:bg-red-50 rounded transition-colors duration-200'
                            >
                                <RiDeleteBin3Line className='h-5 w-5 text-red-600' />
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    )
}

export default CartContent