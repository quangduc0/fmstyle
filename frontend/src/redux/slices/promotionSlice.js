import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
    promotions: [],
    activePromotions: [],
    loading: false,
    error: null,
};

export const fetchPromotions = createAsyncThunk(
    'promotions/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('/api/promotions');
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const fetchActivePromotions = createAsyncThunk(
    'promotions/fetchActive',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('/api/promotions/active');
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const createPromotion = createAsyncThunk(
    'promotions/create',
    async (promoData, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                '/api/promotions',
                promoData,
                { headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` } }
            );
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const updatePromotion = createAsyncThunk(
    'promotions/update',
    async ({ id, updates }, { rejectWithValue }) => {
        try {
            const response = await axios.put(
                `/api/promotions/${id}`,
                updates,
                { headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` } }
            );
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const deletePromotion = createAsyncThunk(
    'promotions/delete',
    async (id, { rejectWithValue }) => {
        try {
            await axios.delete(
                `/api/promotions/${id}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` } }
            );
            return id;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

const promotionSlice = createSlice({
    name: 'promotions',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchPromotions.pending, (state) => {
            state.loading = true;
            state.error = null;
        }).addCase(fetchPromotions.fulfilled, (state, action) => {
            state.loading = false;
            state.promotions = action.payload;
        }).addCase(fetchPromotions.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        }).addCase(fetchActivePromotions.pending, (state) => {
            state.loading = true;
            state.error = null;
        }).addCase(fetchActivePromotions.fulfilled, (state, action) => {
            state.loading = false;
            state.activePromotions = action.payload;
        }).addCase(fetchActivePromotions.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        }).addCase(createPromotion.fulfilled, (state, action) => {
            state.promotions.push(action.payload);
        }).addCase(updatePromotion.fulfilled, (state, action) => {
            const idx = state.promotions.findIndex(p => p._id === action.payload._id);
            if (idx !== -1) state.promotions[idx] = action.payload;
        }).addCase(deletePromotion.fulfilled, (state, action) => {
            state.promotions = state.promotions.filter(p => p._id !== action.payload);
        });
    }
});

export default promotionSlice.reducer;