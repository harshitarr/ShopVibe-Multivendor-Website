import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

export const fetchAddress = createAsyncThunk('address/fetchAddress', 
    async ({ getToken }, thunkAPI) => {
        try {
            const token = await getToken()
            const { data } = await axios.get('/api/address', {headers: {
                Authorization: `Bearer ${token}`
            }})
            console.log('fetchAddress API response:', data);
            // API returns addresses directly, not wrapped in {addresses: []}
            return Array.isArray(data) ? data : (data.addresses || [])
        } catch (error) {
            console.error('fetchAddress error:', error.response?.data);
            return thunkAPI.rejectWithValue(error.response?.data)
        }
    }
)

const addressSlice = createSlice({
    name: 'address',
    initialState: {
        list: [],
        loading: false,
        error: null,
    },
    reducers: {
        addAddress: (state, action) => {
            console.log('=== AddAddress Reducer Debug ===');
            console.log('Current state:', JSON.stringify(state, null, 2));
            console.log('Action payload:', JSON.stringify(action.payload, null, 2));
            console.log('State.list type:', typeof state.list);
            console.log('State.list is array:', Array.isArray(state.list));
            console.log('State.list value:', state.list);
            
            // Ensure state exists
            if (!state) {
                console.error('State is null or undefined!');
                return;
            }
            
            // Ensure list is always an array
            if (!Array.isArray(state.list)) {
                console.warn('state.list was not an array, initializing as empty array. Current value:', state.list);
                state.list = [];
            }
            
            console.log('About to push to list. Current list length:', state.list.length);
            try {
                state.list.push(action.payload);
                console.log('Successfully pushed to list. New length:', state.list.length);
            } catch (pushError) {
                console.error('Error pushing to list:', pushError);
                throw pushError;
            }
            console.log('=== AddAddress Reducer Complete ===');
        },
        removeAddress: (state, action) => {
            if (!Array.isArray(state.list)) {
                state.list = [];
                return;
            }
            state.list = state.list.filter(address => address._id !== action.payload);
        },
    },
    extraReducers: (builder) => {
        builder
        .addCase(fetchAddress.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchAddress.fulfilled, (state, action) => {
            console.log('fetchAddress fulfilled with payload:', action.payload);
            state.loading = false;
            state.list = Array.isArray(action.payload) ? action.payload : [];
            console.log('Address list updated to:', state.list);
        })
        .addCase(fetchAddress.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
            console.error('Redux: fetchAddress rejected with:', action.payload);
        })
    }
})

export const { addAddress, removeAddress } = addressSlice.actions

export default addressSlice.reducer