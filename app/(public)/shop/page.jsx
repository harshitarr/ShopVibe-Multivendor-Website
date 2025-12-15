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

    const [showFilter, setShowFilter] = useState(false);

    return (
        <div className="min-h-[70vh] mx-2 md:mx-4">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:gap-8 h-[calc(100vh-80px)] relative">
                {/* Mobile/Tablet Filter Drawer Tab */}
                <button
                    className="fixed top-1/3 left-0 z-40 md:hidden bg-white border-2 border-green-600 rounded-r-2xl px-2 py-4 shadow-lg flex items-center justify-center"
                    style={{ transform: showFilter ? 'translateX(-100%)' : 'translateX(0)', transition: 'transform 0.3s', minHeight: '110px', minWidth: '38px' }}
                    onClick={() => setShowFilter(true)}
                    aria-label="Open Filters"
                >
                    <span className="text-green-600 font-bold tracking-widest text-xs select-none" style={{ writingMode: 'vertical-rl', letterSpacing: '0.3em' }}>FILTER</span>
                </button>

                {/* Filter Overlay for mobile/tablet */}
                {showFilter && (
                    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex">
                        <div className="bg-white w-80 max-w-full h-full p-0 shadow-2xl animate-slideInLeft relative">
                            <button
                                className="absolute top-4 right-4 text-green-600 text-2xl font-bold"
                                onClick={() => setShowFilter(false)}
                                aria-label="Close Filters"
                            >
                                &times;
                            </button>
                            <ProductFilter filters={filters} setFilters={setFilters} />
                            <div className="flex justify-center pb-4">
                                <button
                                    className="mt-4 px-6 py-2 bg-green-600 text-white rounded-full shadow hover:bg-green-700 transition"
                                    onClick={() => setShowFilter(false)}
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                        {/* Click outside to close */}
                        <div className="flex-1" onClick={() => setShowFilter(false)}></div>
                    </div>
                )}

                {/* Left Filter Panel (desktop only) */}
                <div className="md:w-1/4 w-full h-full hidden md:block">
                    <ProductFilter filters={filters} setFilters={setFilters} />
                </div>
                {/* Products Grid */}
                <div className="flex-1 h-full overflow-y-auto no-scrollbar">
                    <h1 onClick={() => router.push('/shop')} className="text-2xl text-slate-500 my-6 flex items-center gap-2 cursor-pointer"> {search && <MoveLeftIcon size={20} />}  All <span className="text-slate-700 font-medium">Products</span></h1>
                    {filteredProducts.length === 0 ? (
                        <div className="text-center text-slate-400 py-16">No products found.</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 xl:gap-14 mb-32 p-3 md:p-5 xl:p-8">
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