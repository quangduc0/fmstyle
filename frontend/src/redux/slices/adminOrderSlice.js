import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchAllOrders = createAsyncThunk("adminOrders/fetchAllOrders", async (_, { rejectWithValue }) => {
    try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/orders`,
            {
                headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
            },
        );
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const updateOrderStatus = createAsyncThunk("adminOrders/updateOrderStatus", async ({ id, status }, { rejectWithValue }) => {
    try {
        const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/admin/orders/${id}`, { status },
            {
                headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
            },
        );
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const updatePaymentStatus = createAsyncThunk("adminOrders/updatePaymentStatus", async ({ id, paymentStatus }, { rejectWithValue }) => {
    try {
        const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/admin/orders/${id}/payment`,
            { paymentStatus },
            {
                headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
            }
        );
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const updateProductInventory = createAsyncThunk(
    "adminOrders/updateProductInventory",
    async (orderId, { rejectWithValue }) => {
        try {
            console.log("Gọi API cập nhật tồn kho với orderId:", orderId);
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/orders/${orderId}/update-inventory`,
                {},
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
                }
            );
            return response.data;
        } catch (error) {
            console.error("Lỗi khi gọi API cập nhật tồn kho:", error.response?.data || error.message);
            return rejectWithValue(error.response?.data || { message: error.message });
        }
    }
);


export const deleteOrder = createAsyncThunk("adminOrders/deleteOrder", async (id, { rejectWithValue }) => {
    try {
        await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/admin/orders/${id}`,
            {
                headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
            },
        );
        return id;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const fetchOrdersByUser = createAsyncThunk("adminOrders/fetchOrdersByUser", async (userId, { rejectWithValue }) => {
    try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/orders/user/${userId}`,
            {
                headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
            }
        );
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || error.message);
    }
}
);


const adminOrderSlice = createSlice({
    name: "adminOrders",
    initialState: {
        orders: [],
        userOrders: [],
        totalOrders: 0,
        totalSales: 0,
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchAllOrders.pending, (state) => {
            state.loading = true;
            state.error = null;
        }).addCase(fetchAllOrders.fulfilled, (state, action) => {
            state.loading = false;
            state.orders = action.payload;
            state.totalOrders = action.payload.length;

            const totalSales = action.payload.reduce((acc, order) => {
                return acc + order.totalPrice;
            }, 0);
            state.totalSales = totalSales;
        }).addCase(fetchAllOrders.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload.message;
        }).addCase(updateOrderStatus.fulfilled, (state, action) => {
            const updatedOrder = action.payload;
            const orderIndex = state.orders.findIndex((order) => order._id === updatedOrder._id);
            if (orderIndex !== -1) {
                state.orders[orderIndex] = updatedOrder;
            }
        }).addCase(updatePaymentStatus.fulfilled, (state, action) => {
            const updatedOrder = action.payload;
            const orderIndex = state.orders.findIndex((order) => order._id === updatedOrder._id);
            if (orderIndex !== -1) {
                state.orders[orderIndex] = updatedOrder;
            }
        }).addCase(updateProductInventory.pending, (state) => {
            state.inventoryUpdateStatus = 'loading';
        }).addCase(updateProductInventory.fulfilled, (state, action) => {
            state.inventoryUpdateStatus = 'succeeded';
        }).addCase(updateProductInventory.rejected, (state, action) => {
            state.inventoryUpdateStatus = 'failed';
            state.inventoryUpdateError = action.payload?.message || action.error.message;
        }).addCase(fetchOrdersByUser.pending, (state) => {
            state.loading = true;
        }).addCase(fetchOrdersByUser.fulfilled, (state, action) => {
            state.loading = false;
            state.userOrders = action.payload;
        }).addCase(fetchOrdersByUser.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload.message;
        }).addCase(deleteOrder.fulfilled, (state, action) => {
            state.orders = state.orders.filter((order) => order._id !== action.payload);
        });
    },
});

export default adminOrderSlice.reducer;