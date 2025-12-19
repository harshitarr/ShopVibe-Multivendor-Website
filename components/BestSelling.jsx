'use client'
import Title from './Title'
import ProductCard from './ProductCard'
import { useSelector } from 'react-redux'

const BestSelling = () => {

    const displayQuantity = 4
    const products = useSelector(state => state.product?.list) || []

    return (
        <div className='px-6 my-30 max-w-6xl mx-auto'>
            <Title title='Best Selling' description={`Showing ${products.length < displayQuantity ? products.length : displayQuantity} of ${products.length} products`} href='/shop' />
            <div className='mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-12'>
                {(Array.isArray(products) ? products : []).slice().sort((a, b) => {
                    const aLen = Array.isArray(a?.rating) ? a.rating.length : 0;
                    const bLen = Array.isArray(b?.rating) ? b.rating.length : 0;
                    return bLen - aLen;
                }).slice(0, displayQuantity).map((product, index) => (
                    <ProductCard key={index} product={product} />
                ))}
            </div>
        </div>
    )
}

export default BestSelling