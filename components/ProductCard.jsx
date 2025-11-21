'use client'
import { StarIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const ProductCard = ({ product }) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

    // Safe MongoDB rating calculation
    const ratings = product.ratings || [];
    const avgRating = ratings.length > 0
        ? ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length
        : 0;

    // Round to nearest 0.5 (for half-star support)
    const rating = Math.round(avgRating * 2) / 2;

    return (
        <Link href={`/product/${product._id}`} className='group max-xl:mx-auto'>
            <div className='bg-[#F5F5F5] h-40 sm:w-60 sm:h-68 rounded-lg flex items-center justify-center'>
                <Image
                    width={500}
                    height={500}
                    className='max-h-30 sm:max-h-40 w-auto group-hover:scale-115 transition duration-300'
                    src={product.images[0]}
                    alt={product.name}
                />
            </div>

            <div className='flex justify-between gap-3 text-sm text-slate-800 pt-2 max-w-60'>
                <div>
                    <p>{product.name}</p>

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

                <p>{currency}{product.price}</p>
            </div>
        </Link>
    )
}

export default ProductCard
