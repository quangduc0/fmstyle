import {createSlice, createAsyncThunk} from "@reduxjs/toolkit";
import axios from "axios";

// Truy xuất thông tin người dùng và token từ localStorage nếu có
const userFromStorage = localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo")) : null;

// Kiểm tra guestId hiện có trong localStorage hoặc tạo mới    
const initialGuestId = localStorage.getItem("guestId") || `guest_${new Date().getTime()}`;
localStorage.setItem("guestId", initialGuestId);

const initialState = {
    user: userFromStorage,
    guestId: initialGuestId,
    loading: false,
    error: null,
};

export const loginUser = createAsyncThunk("auth/loginUser", async (userData, {rejectWithValue}) => {
    try {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/user/login`, userData);
        
        localStorage.setItem("userInfo", JSON.stringify(response.data.user));
        localStorage.setItem("userToken", response.data.token);

        return response.data.user
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
})