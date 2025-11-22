'use client'
import Image from "next/image";
import { DotIcon } from "lucide-react";
import { useSelector } from "react-redux";
import Rating from "./Rating";
import { useState } from "react";
import RatingModal from "./RatingModal";

const OrderItem = ({ order }) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';
    const [ratingModal, setRatingModal] = useState(null);

    const { ratings } = useSelector(state => state.rating);

    // Fix: Use orderItems instead of items
    const items = order.orderItems || []; // API returns orderItems
    
    console.log('OrderItem - Full order:', order);
    console.log('OrderItem - Items array:', items);
    console.log('OrderItem - Items length:', items.length);

    return (
        <>
            <tr className="text-sm">
                <td className="text-left">
                    <div className="flex flex-col gap-6">

                        {items.map((item, index) => {
                            const product = item.product || {}; 
                            const productName = product.name || "Unnamed Product";
                            const productImage = product.images?.[0] || "/placeholder.png";
                            const productId = product._id;

                            return (
                                <div
                                    key={`${order._id}-${productId}-${index}`}
                                    className="flex items-center gap-4"
                                >
                                    <div className="w-20 aspect-square bg-slate-100 flex items-center justify-center rounded-md">
                                        <Image
                                            className="h-14 w-auto"
                                            src={productImage}
                                            alt="product_img"
                                            width={50}
                                            height={50}
                                        />
                                    </div>

                                    <div className="flex flex-col justify-center text-sm space-y-1">
                                        <p className="font-medium text-slate-600 text-base">
                                            {productName}
                                        </p>

                                        <p className="text-slate-600 font-medium">
                                            {currency}{item.price} • Qty: {item.quantity}
                                        </p>

                                        <p className="text-slate-500 text-sm">
                                            {new Date(order.createdAt).toDateString()}
                                        </p>

                                        <div>
                                            {/* Check if product already rated */}
                                            {ratings.find(
                                                rating =>
                                                    rating.orderId === order._id &&
                                                    rating.productId === productId
                                            ) ? (
                                                <Rating
                                                    value={
                                                        ratings.find(
                                                            rating =>
                                                                rating.orderId === order._id &&
                                                                rating.productId === productId
                                                        ).rating
                                                    }
                                                />
                                            ) : (
                                                <button
                                                    onClick={() =>
                                                        setRatingModal({
                                                            orderId: order._id,
                                                            productId: productId
                                                        })
                                                    }
                                                    className={`text-green-500 hover:bg-green-50 transition ${
                                                        order.status.toUpperCase() !== "DELIVERED" &&
                                                        "hidden"
                                                    }`}
                                                >
                                                    Rate Product
                                                </button>
                                            )}
                                        </div>

                                        {ratingModal && (
                                            <RatingModal
                                                ratingModal={ratingModal}
                                                setRatingModal={setRatingModal}
                                            />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </td>

                <td className="text-center max-md:hidden">
                    {currency}{order.total}
                </td>

                <td className="text-left max-md:hidden">
                    <p>{order.address.name}, {order.address.street},</p>
                    <p>{order.address.city}, {order.address.state}, {order.address.zip}, {order.address.country},</p>
                    <p>{order.address.phone}</p>
                </td>

                <td className="text-left space-y-2 text-sm max-md:hidden">
                    <div
                        className={`flex items-center justify-center gap-1 rounded-full p-1 ${
                            order.status === 'ORDER_PLACED'
                                ? 'text-orange-500 bg-orange-100'
                                : order.status === 'PROCESSING'
                                ? 'text-yellow-500 bg-yellow-100'
                                : order.status === 'SHIPPED'
                                ? 'text-blue-500 bg-blue-100'
                                : order.status === 'DELIVERED'
                                ? 'text-green-500 bg-green-100'
                                : 'text-slate-500 bg-slate-100'
                        }`}
                    >
                        <DotIcon size={10} className="scale-250" />
                        {order.status.replace(/_/g, ' ').toLowerCase()}
                    </div>
                </td>
            </tr>

            {/* Mobile */}
            <tr className="md:hidden">
                <td colSpan={5}>
                    <p>{order.address.name}, {order.address.street}</p>
                    <p>{order.address.city}, {order.address.state}, {order.address.zip}, {order.address.country}</p>
                    <p>{order.address.phone}</p>
                    <br />
                    <div className="flex items-center">
                        <span className={`text-center mx-auto px-6 py-1.5 rounded ${
                            order.status === 'ORDER_PLACED'
                                ? 'bg-orange-100 text-orange-700'
                                : order.status === 'PROCESSING'
                                ? 'bg-yellow-100 text-yellow-700'
                                : order.status === 'SHIPPED'
                                ? 'bg-blue-100 text-blue-700'
                                : order.status === 'DELIVERED'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-slate-100 text-slate-700'
                        }`}>
                            {order.status.replace(/_/g, ' ').toLowerCase()}
                        </span>
                    </div>
                </td>
            </tr>

            <tr>
                <td colSpan={4}>
                    <div className="border-b border-slate-300 w-6/7 mx-auto" />
                </td>
            </tr>
        </>
    );
};

export default OrderItem;
