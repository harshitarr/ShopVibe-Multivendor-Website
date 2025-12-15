'use client'
import { PackageIcon, Search, ShoppingCart, Menu as MenuIcon, X as CloseIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useUser, useClerk, UserButton, Protect } from '@clerk/nextjs';


const Navbar = () => {
    const { user } = useUser();
    const { openSignIn } = useClerk();
    const router = useRouter();

    const [search, setSearch] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const cartCount = useSelector(state => state.cart.total);
    const safeCartCount = Number(cartCount) || 0;

    // Store state
    const [hasStore, setHasStore] = useState(false);

    useEffect(() => {
        const checkStore = async () => {
            if (!user) {
                setHasStore(false);
                return;
            }
            try {
                const res = await fetch('/api/store/is-seller');
                if (!res.ok) return setHasStore(false);
                const data = await res.json();
                // Only show if store is approved and active
                if (data.storeInfo && data.storeInfo.status === 'approved' && data.storeInfo.isActive) {
                    setHasStore(true);
                } else {
                    setHasStore(false);
                }
            } catch {
                setHasStore(false);
            }
        };
        checkStore();
    }, [user]);

    const handleSearch = (e) => {
        e.preventDefault();
        router.push(`/shop?search=${search}`);
    };

    const handleOrdersClick = () => {
        router.push('/orders');
    };

    const handleCartClick = () => {
        router.push('/cart');
    };

    return (
    <nav className="relative bg-white">
        <div className="mx-6">
            <div className="flex items-center justify-between max-w-7xl mx-auto py-4 transition-all">
                
                
                    
               
                {/* Logo */}
               
                <Link href="/" className="relative text-4xl font-semibold text-slate-700">
                     <Protect plan="plus">
                    <span className="text-green-600">Shop</span>Vibe<span className="text-green-600 text-5xl leading-0">.</span>
                    <p className="absolute text-xs font-semibold -top-1 -right-8 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-green-500">
                        plus
                    </p>
                     </Protect>
                </Link>

                

                {/* Mobile Menu Button */}
                <button
                    className="sm:hidden flex items-center justify-center p-2 rounded text-green-600 hover:bg-green-50 focus:outline-none"
                    onClick={() => setMobileMenuOpen(true)}
                    aria-label="Open menu"
                >
                    <MenuIcon size={28} />
                </button>

                {/* Desktop Menu */}
                <div className="hidden sm:flex items-center gap-4 lg:gap-8 text-slate-600">
                    <Link href="/">Home</Link>
                    <Link href="/shop">Shop</Link>
                    <Link href="/about">About</Link>
                    <Link href="/contact">Contact</Link>

                    <form 
                        onSubmit={handleSearch} 
                        className="hidden xl:flex items-center w-xs text-sm gap-2 bg-slate-100 px-4 py-3 rounded-full"
                    >
                        <Search size={18} className="text-slate-600" />
                        <input
                            className="w-full bg-transparent outline-none placeholder-slate-600"
                            type="text"
                            placeholder="Search products"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            required
                        />
                    </form>

                    {/* Cart */}
                    <Link href="/cart" className="relative flex items-center gap-2 text-slate-600">
                        <ShoppingCart size={18} />
                        Cart
                        <span className="absolute -top-1 left-3 text-[8px] text-white bg-slate-600 size-3.5 rounded-full flex items-center justify-center">
                            {safeCartCount}
                        </span>
                    </Link>

                    {/* My Shop Button */}
                    {hasStore && (
                        <Link
                            href="/store"
                            className="ml-2 px-5 py-2 border-2 border-green-500 text-green-600 bg-white rounded-full font-semibold hover:bg-green-50 transition"
                        >
                            My Shop
                        </Link>
                    )}

                    {/* Login / User */}
                    {!user ? (
                        <button 
                            onClick={openSignIn} 
                            className="px-8 py-2 bg-green-500 hover:bg-green-600 transition text-white rounded-full"
                        >
                            Login
                        </button>
                    ) : (
                        <UserButton>
                            <UserButton.MenuItems>
                                <UserButton.Action
                                    labelIcon={<PackageIcon size={16} />}
                                    label="My Orders"
                                    onClick={handleOrdersClick}
                                />
                            </UserButton.MenuItems>
                        </UserButton>
                    )}
                </div>

                {/* Mobile Slide-in Menu */}
                {mobileMenuOpen && (
                    <div className="fixed inset-0 z-50 bg-transparent flex">
                        <div className="bg-white w-72 max-w-full h-full p-6 shadow-2xl animate-slideInLeft relative flex flex-col gap-6">
                            <button
                                className="absolute top-4 right-4 text-green-600 text-2xl font-bold"
                                onClick={() => setMobileMenuOpen(false)}
                                aria-label="Close menu"
                            >
                                <CloseIcon size={28} />
                            </button>
                            <nav className="flex flex-col gap-4 mt-8 text-lg font-medium text-slate-700">
                                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block">Home</Link>
                                <Link href="/shop" onClick={() => setMobileMenuOpen(false)} className="block">Shop</Link>
                                <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="block">About</Link>
                                <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="block">Contact</Link>
                                {hasStore && (
                                    <Link href="/store" onClick={() => setMobileMenuOpen(false)} className="border-2 border-green-500 text-green-600 bg-white rounded-full font-semibold px-4 py-2 mt-2 block">My Shop</Link>
                                )}
                            </nav>
                            <div className="flex flex-col gap-3 mt-8">
                                <Link href="/cart" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-slate-600">
                                    <ShoppingCart size={18} /> Cart
                                    <span className="ml-1 text-xs text-white bg-slate-600 size-4 rounded-full flex items-center justify-center">{safeCartCount}</span>
                                </Link>
                                {user ? (
                                    <UserButton>
                                        <UserButton.MenuItems>
                                            <UserButton.Action
                                                labelIcon={<PackageIcon size={16} />}
                                                label="My Orders"
                                                onClick={() => { setMobileMenuOpen(false); handleOrdersClick(); }}
                                            />
                                        </UserButton.MenuItems>
                                    </UserButton>
                                ) : (
                                    <button
                                        onClick={() => { setMobileMenuOpen(false); openSignIn(); }}
                                        className="px-7 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full mt-2"
                                    >
                                        Login
                                    </button>
                                )}
                            </div>
                        </div>
                        {/* Click outside to close */}
                        <div className="flex-1" onClick={() => setMobileMenuOpen(false)}></div>
                    </div>
                )}
            </div>
        </div>
        <hr className="border-gray-300" />
    </nav>
);


};

export default Navbar;
