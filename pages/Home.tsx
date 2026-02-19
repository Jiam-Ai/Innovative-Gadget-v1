
import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { getProducts, addToCart, getCurrentUser, getWishlist, toggleWishlist } from '../services/storageService';
import { useCart } from '../contexts/CartContext';
import { Product } from '../types';
import { Loader2, ShoppingCart, Search, Heart, SlidersHorizontal, ArrowUpDown, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = ["All", "Laptops", "Phones", "Watches", "Speakers", "Cameras"];

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
    const [pData, wData] = await Promise.all([
      getProducts(),
      user ? getWishlist(user.id) : Promise.resolve([])
    ]);
    setProducts(pData);
    setWishlistIds(new Set(wData.map(w => w.product_id)));
    setLoading(false);
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
      <Header title="Innovative Catalog" />
      <div className="p-3 md:p-6 space-y-6 pb-24 max-w-7xl mx-auto">
        
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center animate-reveal">
            <div className="relative group w-full flex-1">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
                <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search gadgets..."
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all font-bold placeholder-gray-600 shadow-inner"
                />
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:flex-none">
                    <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="w-full bg-[#0a0a0f] border border-white/10 rounded-2xl py-4 pl-5 pr-10 text-[10px] font-black uppercase text-gray-400 outline-none focus:border-emerald-500 appearance-none cursor-pointer"
                    >
                        <option>Newest</option>
                        <option>Price: Low</option>
                        <option>Price: High</option>
                    </select>
                    <ArrowUpDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" size={14} />
                </div>
            </div>
        </div>

        {/* Category Scroll */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {CATEGORIES.map(cat => (
                <button 
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border whitespace-nowrap ${
                        activeCategory === cat 
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg' 
                        : 'bg-white/5 text-gray-500 border-white/5 hover:bg-white/10'
                    }`}
                >
                    {cat}
                </button>
            ))}
        </div>

        {/* Enhanced Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
            {loading ? (
                <div className="col-span-full py-20 flex justify-center"><Loader2 className="animate-spin text-emerald-500" size={48} /></div>
            ) : filteredProducts.length === 0 ? (
                <div className="col-span-full py-20 text-center text-gray-600 font-black uppercase text-[10px] tracking-widest bg-white/5 rounded-[40px] border border-dashed border-white/10">
                    Inventory node empty.
                </div>
            ) : filteredProducts.map((product) => (
                <div 
                    key={product.id} 
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="bg-[#0a0a0f]/80 backdrop-blur-xl rounded-[32px] p-3 border border-white/5 group hover:border-emerald-500/30 transition-all duration-500 cursor-pointer flex flex-col shadow-2xl relative"
                >
                    {/* Visual Badges */}
                    {product.stock_quantity < 10 && (
                        <div className="absolute top-5 left-5 z-20 bg-rose-500 text-white px-2 py-1 rounded-lg text-[7px] font-black uppercase tracking-tighter animate-pulse border border-rose-400">
                            Low Stock
                        </div>
                    )}
                    {product.is_trending && (
                        <div className="absolute top-5 left-5 z-20 bg-orange-500 text-white px-2 py-1 rounded-lg text-[7px] font-black uppercase tracking-tighter border border-orange-400 flex items-center gap-1">
                            <Flame size={8} /> Trending
                        </div>
                    )}

                    <button 
                        onClick={(e) => handleToggleWishlist(e, product.id)}
                        className={`absolute top-5 right-5 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            wishlistIds.has(product.id) ? 'bg-rose-500 text-white' : 'bg-black/40 text-gray-500 hover:text-white border border-white/10'
                        }`}
                    >
                        <Heart size={14} fill={wishlistIds.has(product.id) ? "currentColor" : "none"} />
                    </button>

                    <div className="relative aspect-square w-full rounded-[24px] overflow-hidden mb-4 bg-black/40 border border-white/5">
                        <img 
                          src={product.image_url} 
                          className="w-full h-full object-cover opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700" 
                          alt={product.name} 
                        />
                    </div>

                    <div className="px-2 pb-2 flex-1 flex flex-col">
                        <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest mb-1">{product.category}</p>
                        <h4 className="text-[13px] font-black text-white tracking-tight uppercase leading-none line-clamp-1 mb-4">{product.name}</h4>

                        <div className="mt-auto flex items-end justify-between gap-2">
                            <div>
                                <p className="text-[7px] text-gray-600 font-bold uppercase mb-0.5">Sale Price</p>
                                <span className="font-black text-lg text-white tracking-tighter">SLE {product.price.toLocaleString()}</span>
                            </div>
                            <button 
                                onClick={(e) => handleAddToCart(e, product)}
                                disabled={addingId === product.id}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all active:scale-90 ${
                                    addingId === product.id 
                                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' 
                                    : 'bg-emerald-600 text-white border-transparent shadow-lg shadow-emerald-900/40'
                                }`}
                            >
                                {addingId === product.id ? <Loader2 className="animate-spin" size={16} /> : <ShoppingCart size={16} />}
                            </button>
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
