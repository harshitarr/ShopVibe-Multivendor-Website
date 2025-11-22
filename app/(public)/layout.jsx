'use client'
import Banner from "@/components/Banner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchProducts } from "@/lib/features/product/productSlice";
import { useUser, useAuth } from "@clerk/nextjs";
import { fetchCart, uploadCart } from "@/lib/features/cart/cartSlice";
import { fetchAddress } from "@/lib/features/address/addressSlice";

export default function PublicLayout({ children }) {
const dispatch = useDispatch();
const { user } = useUser();
const { getToken } = useAuth();

const { cartItems, loading: cartLoading } = useSelector(state => state.cart);

// Fetch products on mount
useEffect(() => {
dispatch(fetchProducts({}));
}, [dispatch]);

// Fetch cart when user logs in
useEffect(() => {
if (user) {
console.log('Loading cart from database...');
dispatch(fetchCart({ getToken }));
dispatch(fetchAddress({ getToken }) );
}
}, [user, getToken, dispatch]);

// Upload cart when cartItems change and fetch is complete
useEffect(() => {
if (user && !cartLoading) {
console.log('Cart items changed, uploading to server...', cartItems);


  const debounceTimer = setTimeout(() => {
    dispatch(uploadCart({ getToken }));
  }, 1000);

  return () => clearTimeout(debounceTimer);
} else if (cartLoading) {
  console.log('Skipping cart upload - cart is still loading from database');
}

}, [cartItems, user, cartLoading, getToken, dispatch]);

return (
<> <Banner /> <Navbar />
{children} <Footer />
</>
);
}
