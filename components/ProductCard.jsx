'use client'
import { StarIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const ProductCard = ({ product }) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

    // Use pre-calculated rating from API or fallback to manual calculation
    const avgRating = product.avgRating || 0;
    const totalRatings = product.totalRatings || 0;
    const ratings = product.ratings || [];
    
    // Debug: Log rating information
    console.log('ProductCard Debug:', {
        productName: product.name,
        productId: product._id,
        avgRating: avgRating,
        totalRatings: totalRatings,
        ratingsArray: ratings.length,
        hasPreCalculatedRating: !!product.avgRating
    });

    // Use the pre-calculated rating (already rounded to nearest 0.5)
    const rating = avgRating;

    return (
        <Link href={`/product/${product._id}`} className='group block w-full h-full'>
            <div className='bg-[#F5F5F5] h-40 sm:h-68 w-full rounded-lg flex items-center justify-center mb-3 sm:mb-4'>
                <Image
                    width={500}
                    height={500}
                    className='max-h-30 sm:max-h-40 w-auto group-hover:scale-115 transition duration-300'
                    src={product.images[0]}
                    alt={product.name}
                />
            </div>

            <div className='flex justify-between gap-3 text-sm pt-2 w-full'>
                <div>
                    <p className="text-green-600 font-medium">{product.name}</p>

                    {/* ⭐ Half-star Rendering */}
                    <div className='flex'>
                        {Array(5).fill('').map((_, index) => {
                            const starNumber = index + 1;

                            const isFull = starNumber <= rating;
                            const isHalf = !isFull && starNumber - 0.5 <= rating;

                            return (
                                <div key={index} className="relative w-4 h-4">
                                    {/* Base star */}
                                    <StarIcon
                                        size={16}
                                        className="absolute top-0 left-0"
                                        fill={isFull ? "#00C950" : "#D1D5DB"}
                                        stroke="none"
                                    />

                                    {/* Half star overlay */}
                                    {isHalf && (
                                        <StarIcon
                                            size={16}
                                            className="absolute top-0 left-0"
                                            fill="#00C950"
                                            stroke="none"
                                            style={{
                                                clipPath: "inset(0 50% 0 0)"
                                            }}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <p className="text-green-600 font-semibold">{currency}{product.price}</p>
            </div>
        </Link>
    )
}

export default ProductCard
