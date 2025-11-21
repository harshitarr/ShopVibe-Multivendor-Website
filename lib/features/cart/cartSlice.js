import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

// Upload cart to server
export const uploadCart = createAsyncThunk(
'cart/uploadCart',
async ({ getToken }, thunkAPI) => {
try {
const { cartItems } = thunkAPI.getState().cart
console.log('Uploading cart to server:', cartItems)


  const token = await getToken()
  const response = await axios.post('/api/cart', cartItems, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  
  console.log('Cart upload successful:', response.data)
  return { success: true }
} catch (error) {
  console.error('Upload cart error:', error.response?.data || error.message)
  return thunkAPI.rejectWithValue(error.response?.data || error.message)
}


}
)

// Fetch cart from server
export const fetchCart = createAsyncThunk(
'cart/fetchCart',
async ({ getToken }, thunkAPI) => {
try {
      console.log('Fetching cart from server...')
      const token = await getToken()
      const { data } = await axios.get('/api/cart', {
      headers: {
      Authorization: `Bearer ${token}`
  }
})
console.log('Cart fetched from server:', data)
return data
} catch (error) {
    console.error('Fetch cart error:', error.response?.data || error.message)
    return thunkAPI.rejectWithValue(error.response?.data || error.message)
   }
  }
)

const cartSlice = createSlice({
    name: 'cart',
      initialState: {
          total: 0,
          cartItems: {},
          loading: false,
      },
reducers: {
    addToCart: (state, action) => {
      const { productId } = action.payload
      if (state.cartItems[productId]) {
          state.cartItems[productId]++
      } else {
          state.cartItems[productId] = 1
      }
      state.total += 1
},
removeFromCart: (state, action) => {
      const { productId } = action.payload
      if (state.cartItems[productId]) {
      state.cartItems[productId]--
      if (state.cartItems[productId] === 0) {
      delete state.cartItems[productId]
}
    state.total -= 1
}
},
    deleteItemFromCart: (state, action) => {
      const { productId } = action.payload
      state.total -= state.cartItems[productId] || 0
      delete state.cartItems[productId]
  },
clearCart: (state) => {
    state.cartItems = {}
    state.total = 0
  },
},
extraReducers: (builder) => {
    builder
    .addCase(fetchCart.pending, (state) => {
    state.loading = true
})
.addCase(fetchCart.fulfilled, (state, action) => {
state.loading = false
console.log('Redux: fetchCart fulfilled with:', action.payload);

  // Get the cart data - handle legacy nested structure
  let cartData = action.payload.cart || {};
  if (cartData.cartItems && typeof cartData.cartItems === 'object') {
  // Handle legacy nested structure
  cartData = cartData.cartItems;
}

  console.log('Setting cart items to:', cartData);
  state.cartItems = cartData
  state.total = Object.values(cartData).reduce((acc, item) => acc + item, 0)
  console.log('Redux: New cart state:', { cartItems: state.cartItems, total: state.total });
  console.log('Redux: Cart state updated:', state)
})
.addCase(fetchCart.rejected, (state, action) => {
    state.loading = false
    console.error('Redux: fetchCart rejected with:', action.payload)
    })
  }
})

export const { addToCart, removeFromCart, clearCart, deleteItemFromCart } = cartSlice.actions
export default cartSlice.reducer
