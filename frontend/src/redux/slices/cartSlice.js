import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const loadCartFromStorage = () => {
    const storedCart = localStorage.getItem("cart");
    return storedCart ? JSON.parse(storedCart) : {products: []};
};

const saveCartToStorage = (cart) => {
    localStorage.setItem("cart", JSON.stringify(cart));
};

export const fetchCart = createAsyncThunk("cart/fetchCart", async ({userId, guestId}, {rejectWithValue}) => {
    try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/cart`, {
            params: {userId, guestId},
        });
        return response.data;
    } catch (error) {
        console.error(error);
        return rejectWithValue(error.response.data);
    }
});

export const addToCart = createAsyncThunk("cart/addToCart", async ({productId, quantity, size, color, guestId, userId}, {rejectWithValue}) => {
    try {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/cart`, {productId, quantity, size, color, guestId, userId});
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const updateCartItemQuantity = createAsyncThunk("cart/updateCartItemQuantity", async ({productId, quantity, guestId, userId, size, color}, {rejectWithValue}) => {
    try {
        const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/cart`, {productId, quantity, guestId, userId, size, color});
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const removeFromCart = createAsyncThunk("cart/removeFromCart", async ({productId, guestId, userId, size, color}, {rejectWithValue}) => {
    try {
        const response = await axios({
            method: "DELETE",
            url: `${import.meta.env.VITE_BACKEND_URL}/api/cart`,
            data: {productId, guestId, userId, size, color},
        });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const mergeCart = createAsyncThunk("cart/mergeCart", async ({guestId, user}, {rejectWithValue}) => {
    try {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/cart/merge`, {guestId, user},
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("userToken")}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const cleanupExpiredCart = createAsyncThunk("cart/cleanupExpiredCart", async ({userId, guestId}, {rejectWithValue}) => {
    try {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/cart/cleanup`, {userId, guestId});
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

const cartSlice = createSlice({
    name: "cart",
    initialState: {
        cart: loadCartFromStorage(),
        loading: false,
        error: null,
        expiredItems: [],
        expirationNotified: false,
    },
    reducers: {
        clearCart: (state) => {
            state.cart = {products: []};
            localStorage.removeItem("cart");
        },
        clearExpiredItems: (state) => {
            state.expiredItems = [];
            state.expirationNotified = false;
        },
        setExpirationNotified: (state, action) => {
            state.expirationNotified = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
        .addCase(fetchCart.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchCart.fulfilled, (state, action) => {
            state.loading = false;
            const cartData = action.payload.cart || action.payload;
            const removedItems = action.payload.removedItems;
            
            state.cart = cartData;
            saveCartToStorage(cartData);
            
            if (removedItems && removedItems.length > 0) {
                state.expiredItems = removedItems;
                state.expirationNotified = false;
            }
        })
        .addCase(fetchCart.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message || "Lấy giỏ hàng thất bại";
        })
        .addCase(addToCart.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(addToCart.fulfilled, (state, action) => {
            state.loading = false;
            const cartData = action.payload.cart || action.payload;
            const removedItems = action.payload.removedItems;
            
            state.cart = cartData;
            saveCartToStorage(cartData);
            
            if (removedItems && removedItems.length > 0) {
                state.expiredItems = removedItems;
                state.expirationNotified = false;
            }
        })
        .addCase(addToCart.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload?.message || "Thêm vào giỏ hàng thất bại";
        })
        .addCase(updateCartItemQuantity.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(updateCartItemQuantity.fulfilled, (state, action) => {
            state.loading = false;
            const cartData = action.payload.cart || action.payload;
            const removedItems = action.payload.removedItems;
            
            state.cart = cartData;
            saveCartToStorage(cartData);
            
            if (removedItems && removedItems.length > 0) {
                state.expiredItems = removedItems;
                state.expirationNotified = false;
            }
        })
        .addCase(updateCartItemQuantity.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload?.message || "Cập nhật số lượng đơn hàng thất bại";
        })
        .addCase(removeFromCart.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(removeFromCart.fulfilled, (state, action) => {
            state.loading = false;
            const cartData = action.payload.cart || action.payload;
            const removedItems = action.payload.removedItems;
            
            state.cart = cartData;
            saveCartToStorage(cartData);
            
            if (removedItems && removedItems.length > 0) {
                state.expiredItems = removedItems;
                state.expirationNotified = false;
            }
        })
        .addCase(removeFromCart.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload?.message || "Xóa đơn hàng thất bại";
        })
        .addCase(mergeCart.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(mergeCart.fulfilled, (state, action) => {
            state.loading = false;
            const cartData = action.payload.cart || action.payload;
            const removedItems = action.payload.removedItems;
            
            state.cart = cartData;
            saveCartToStorage(cartData);
            
            if (removedItems && removedItems.length > 0) {
                state.expiredItems = removedItems;
                state.expirationNotified = false;
            }
        })
        .addCase(mergeCart.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload?.message || "Hợp nhất giỏ hàng thất bại";
        })
        .addCase(cleanupExpiredCart.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(cleanupExpiredCart.fulfilled, (state, action) => {
            state.loading = false;
            const cartData = action.payload.cart || action.payload;
            const removedItems = action.payload.removedItems;
            
            state.cart = cartData;
            saveCartToStorage(cartData);
            
            if (removedItems && removedItems.length > 0) {
                state.expiredItems = removedItems;
                state.expirationNotified = false;
            }
        })
        .addCase(cleanupExpiredCart.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload?.message || "Dọn dẹp giỏ hàng thất bại";
        });
    }
});

export const { clearCart, clearExpiredItems, setExpirationNotified } = cartSlice.actions;
export default cartSlice.reducer;