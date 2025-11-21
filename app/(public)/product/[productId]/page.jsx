'use client'
import ProductDescription from "@/components/ProductDescription";
import ProductDetails from "@/components/ProductDetails";
import Loading from "@/components/Loading";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchProducts } from "@/lib/features/product/productSlice";
import axios from "axios";

export default function Product() {

    const { productId } = useParams();
    const dispatch = useDispatch();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const products = useSelector(state => state.product.list);

    const fetchProduct = async () => {
        try {
            // First try to find product in Redux store
            let foundProduct = products.find((product) => product._id === productId);
            
            if (foundProduct) {
                setProduct(foundProduct);
                setLoading(false);
                return;
            }

            // If not found in store, fetch from API
            const { data } = await axios.get(`/api/products?productId=${productId}`);
            if (data.success && data.product) {
                setProduct(data.product);
            } else {
                console.error('Product not found');
            }
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (productId) {
            // If products array is empty, fetch all products first
            if (products.length === 0) {
                dispatch(fetchProducts({})).then(() => {
                    fetchProduct();
                });
            } else {
                fetchProduct();
            }
        }
        scrollTo(0, 0);
    }, [productId, products]);

    if (loading) {
        return <Loading />;
    }

    if (!product) {
        return (
            <div className="mx-6">
                <div className="max-w-7xl mx-auto text-center py-16">
                    <h2 className="text-2xl font-semibold text-gray-900">Product not found</h2>
                    <p className="text-gray-600 mt-2">The product you're looking for doesn't exist.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-6">
            <div className="max-w-7xl mx-auto">

                {/* Breadcrums */}
                <div className="  text-gray-600 text-sm mt-8 mb-5">
                    Home / Products / {product?.category}
                </div>

                {/* Product Details */}
                {product && (<ProductDetails product={product} />)}

                {/* Description & Reviews */}
                {product && (<ProductDescription product={product} />)}
            </div>
        </div>
    );
}