'use client'
import { Suspense } from "react"
import ProductCard from "@/components/ProductCard"
import ProductFilter from "@/components/ProductFilter"
import { MoveLeftIcon } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSelector } from "react-redux"


import { useState, useMemo } from "react"

function ShopContent() {
    // get query params ?search=abc
    const searchParams = useSearchParams()
    const search = searchParams.get('search')
    const router = useRouter()

    const products = useSelector(state => state.product.list)

    // Filter state
    const [filters, setFilters] = useState({
        category: '',
        price: [100, 10100],
        discount: '',
    })

    // Filtering logic
    const filteredProducts = useMemo(() => {
        let result = products
        if (search) {
            result = result.filter(product =>
                product.name.toLowerCase().includes(search.toLowerCase())
            )
        }
        if (filters.category) {
            result = result.filter(product => product.category === filters.category)
        }
        result = result.filter(product => {
            const price = product.price || 0
            return price >= filters.price[0] && price <= filters.price[1]
        })
        if (filters.discount) {
            const minDiscount = parseInt(filters.discount)
            result = result.filter(product => {
                if (!product.mrp || !product.price) return false
                const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100)
                return discount >= minDiscount
            })
        }
        return result
    }, [products, search, filters])

    return (
        <div className="min-h-[70vh] mx-2 md:mx-4">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:gap-8">
                {/* Left Filter Panel */}
                <div className="md:w-1/4 w-full md:sticky md:top-24 z-10">
                    <ProductFilter filters={filters} setFilters={setFilters} />
                </div>
                {/* Products Grid */}
                <div className="flex-1">
                    <h1 onClick={() => router.push('/shop')} className="text-2xl text-slate-500 my-6 flex items-center gap-2 cursor-pointer"> {search && <MoveLeftIcon size={20} />}  All <span className="text-slate-700 font-medium">Products</span></h1>
                    {filteredProducts.length === 0 ? (
                        <div className="text-center text-slate-400 py-16">No products found.</div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 xl:gap-8 mb-32">
                            {filteredProducts.map((product) => <ProductCard key={product._id} product={product} />)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}


export default function Shop() {
  return (
    <Suspense fallback={<div>Loading shop...</div>}>
      <ShopContent />
    </Suspense>
  );
}