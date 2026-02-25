
import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { getProducts, addToCart, getCurrentUser, getWishlist, toggleWishlist } from '../services/storageService';
import { useCart } from '../contexts/CartContext';
import { Product } from '../types';
import { Loader2, ShoppingCart, Search, Heart, ArrowUpDown, Flame, Star, Zap, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = ["All", "Laptops", "Phones", "Watches", "Speakers", "Cameras"];

const ProductSkeleton = () => (
  <div className="bg-[#0a0a0f] rounded-2xl p-4 border border-white/5 space-y-4">
    <div className="aspect-square w-full rounded-xl shimmer-bg"></div>
    <div className="h-3 w-1/2 shimmer-bg rounded"></div>
    <div className="h-4 w-full shimmer-bg rounded"></div>
    <div className="h-6 w-1/3 shimmer-bg rounded"></div>
  </div>
);

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState<'Newest' | 'Price: Low' | 'Price: High'>('Newest');
  
  const navigate = useNavigate();
  const user = getCurrentUser();
  const { refreshCartCount } = useCart();

  const loadData = async () => {
    setLoading(true);
    try {
      const [pData, wData] = await Promise.all([
        getProducts(),
        user ? getWishlist(user.id) : Promise.resolve([])
      ]);
      setProducts(pData);
      setWishlistIds(new Set(wData.map(w => w.product_id)));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleToggleWishlist = async (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    if (!user) return navigate('/login');
    const isAdded = await toggleWishlist(user.id, productId);
    setWishlistIds(prev => {
        const next = new Set(prev);
        if (isAdded) next.add(productId);
        else next.delete(productId);
        return next;
    });
  };

  const handleAddToCart = async (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    if (!user) return navigate('/login');
    setAddingId(product.id);
    try {
      await addToCart(user.id, product.id, 1);
      await refreshCartCount();
    } catch (err: any) {
      alert("Failed to add.");
    } finally {
      setAddingId(null);
    }
  };

  const filteredProducts = products
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === "All" || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'Price: Low') return a.price - b.price;
      if (sortBy === 'Price: High') return b.price - a.price;
      return b.created_at - a.created_at;
    });

  return (
    <>
      <Header title="Gadget Store" />
      <div className="p-3 md:p-6 space-y-6 pb-24 max-w-[1600px] mx-auto">
        
        {/* Global Search - Simple Style */}
        <div className="flex flex-col md:flex-row gap-3 items-center sticky top-16 z-30 bg-black/40 backdrop-blur-lg py-2 -mx-3 px-3">
            <div className="relative group w-full flex-1">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for gadgets and tech..."
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-full py-4 pl-14 pr-6 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium placeholder-gray-600"
                />
            </div>
            
            <div className="flex gap-2 w-full md:w-auto shrink-0">
                <div className="relative flex-1 md:w-44">
                    <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="w-full bg-[#0a0a0f] border border-white/10 rounded-full py-4 pl-5 pr-10 text-[11px] font-black uppercase text-gray-400 outline-none focus:border-emerald-500 appearance-none cursor-pointer"
                    >
                        <option>Newest</option>
                        <option>Price: Low</option>
                        <option>Price: High</option>
                    </select>
                    <ArrowUpDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" size={14} />
                </div>
            </div>
        </div>

        {/* Category Scroll - Native App Feel */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 snap-x-mandatory">
            {CATEGORIES.map(cat => (
                <button 
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-7 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap snap-center ${
                        activeCategory === cat 
                        ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)] scale-105' 
                        : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10'
                    }`}
                >
                    {cat}
                </button>
            ))}
        </div>

        {/* Global Marketplace Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-6 animate-reveal">
            {loading ? (
                Array(12).fill(0).map((_, i) => <ProductSkeleton key={i} />)
            ) : filteredProducts.length === 0 ? (
                <div className="col-span-full py-40 text-center bg-[#0a0a0f] rounded-[40px] border border-dashed border-white/5">
                    <ShoppingBag className="mx-auto mb-4 text-gray-800" size={64} />
                    <p className="text-gray-500 font-black uppercase text-[12px] tracking-[0.2em]">No items found</p>
                    <button onClick={() => {setSearchTerm(''); setActiveCategory('All');}} className="mt-4 text-emerald-500 font-bold text-xs uppercase underline">Clear Filters</button>
                </div>
            ) : filteredProducts.map((product) => (
                <div 
                    key={product.id} 
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="bg-[#0a0a0f] rounded-2xl md:rounded-3xl border border-white/5 group hover:border-emerald-500/30 transition-all duration-300 cursor-pointer flex flex-col shadow-lg hover:shadow-2xl product-card-glow overflow-hidden h-full"
                >
                    {/* Visual Badges Layer */}
                    <div className="relative aspect-[1/1] w-full overflow-hidden bg-black">
                        <img 
                          src={product.image_url} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                          alt={product.name}
                          loading="lazy"
                        />
                        
                        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20">
                            {product.stock_quantity < 10 && (
                                <div className="bg-rose-600 text-white px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter shadow-xl">
                                    Only {product.stock_quantity} left
                                </div>
                            )}
                            {product.is_trending && (
                                <div className="bg-orange-500 text-white px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter flex items-center gap-1 shadow-xl">
                                    <Flame size={10} fill="currentColor" /> Best Seller
                                </div>
                            )}
                        </div>

                        <button 
                            onClick={(e) => handleToggleWishlist(e, product.id)}
                            className={`absolute top-3 right-3 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-xl backdrop-blur-md ${
                                wishlistIds.has(product.id) ? 'bg-rose-500 text-white scale-110' : 'bg-black/30 text-gray-400 hover:text-white border border-white/10'
                            }`}
                        >
                            <Heart size={16} fill={wishlistIds.has(product.id) ? "currentColor" : "none"} />
                        </button>

                        {/* Quick Action Overlay (Alibaba Style) */}
                        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 hidden md:block">
                            <button 
                                onClick={(e) => handleAddToCart(e, product)}
                                disabled={addingId === product.id}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-2xl transition-all"
                            >
                                {addingId === product.id ? <Loader2 className="animate-spin" size={14} /> : <><ShoppingCart size={14} /> Add to Bag</>}
                            </button>
                        </div>
                    </div>

                    <div className="p-3 md:p-5 flex-1 flex flex-col">
                        <div className="flex items-center gap-1 mb-1.5 opacity-60">
                            <div className="flex">
                                {[...Array(5)].map((_, i) => <Star key={i} size={8} className="fill-yellow-500 text-yellow-500" />)}
                            </div>
                            <span className="text-[8px] font-black uppercase tracking-tighter">Quality Guaranteed</span>
                        </div>

                        <h4 className="text-[12px] md:text-[14px] font-bold text-gray-200 tracking-tight leading-snug line-clamp-2 mb-2 h-10 group-hover:text-white transition-colors uppercase">
                          {product.name}
                        </h4>

                        <div className="mt-auto pt-2 flex items-end justify-between border-t border-white/5">
                            <div>
                                <p className="text-[9px] text-gray-500 font-bold uppercase mb-0.5 tracking-tighter">Price</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="font-black text-lg md:text-xl text-white tracking-tighter">SLE {product.price.toLocaleString()}</span>
                                </div>
                            </div>
                            
                            {/* Mobile Quick Action - Cart Button */}
                            <button 
                                onClick={(e) => handleAddToCart(e, product)}
                                disabled={addingId === product.id}
                                className={`md:hidden w-10 h-10 rounded-full flex items-center justify-center border transition-all active:scale-90 ${
                                    addingId === product.id 
                                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' 
                                    : 'bg-emerald-600 text-white border-transparent shadow-lg'
                                }`}
                            >
                                {addingId === product.id ? <Loader2 className="animate-spin" size={16} /> : <ShoppingCart size={16} />}
                            </button>
                        </div>
                        
                        <div className="mt-3 flex items-center gap-1.5 text-[9px] text-gray-500 font-medium uppercase tracking-tight">
                            <ShoppingCart size={10} className="text-emerald-500" />
                            <span>Fast Delivery in Freetown</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </>
  );
};

export default Home;
