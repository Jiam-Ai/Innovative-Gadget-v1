import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { getProducts, addToCart, getCurrentUser } from '../services/storageService';
import { useCart } from '../contexts/CartContext';
import { Product } from '../types';
import { Loader2, ShoppingCart, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = ["All", "Laptops", "Phones", "Watches", "Speakers", "Smart Home", "Cameras"];

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState("All");
  const navigate = useNavigate();
  const user = getCurrentUser();
  const { refreshCartCount } = useCart();

  const loadProducts = async () => {
    setLoading(true);
    const data = await getProducts();
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => { loadProducts(); }, []);

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

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Header title="Innovative Gadget" />
      <div className="p-3 md:p-4 space-y-5 pb-24 max-w-6xl mx-auto">
        
        {/* Hero Search Banner */}
        <div className="bg-white dark:bg-[#0a0a0f]/60 backdrop-blur-xl rounded-[28px] md:rounded-[36px] p-6 md:p-10 border border-slate-200 dark:border-white/5 relative overflow-hidden animate-spring-in shadow-xl shadow-slate-200/50 dark:shadow-none">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="max-w-md">
                    <h2 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-2">The Future of Hardware</h2>
                    <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-[0.3em]">Next-Gen Delivery & Authentic Quality</p>
                </div>
                
                <div className="relative group w-full max-w-sm">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none transition-transform group-focus-within:scale-110">
                        <Search size={18} />
                    </div>
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search high-tech gadgets..."
                        className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all font-bold placeholder-slate-400"
                    />
                </div>
            </div>
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-emerald-500/[0.03] blur-[80px] rounded-full"></div>
        </div>

        {/* Category Scroll */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {CATEGORIES.map(cat => (
                <button 
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border whitespace-nowrap ${
                        activeCategory === cat 
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-500/30' 
                        : 'bg-white dark:bg-white/5 text-slate-500 dark:text-gray-500 border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/10 shadow-sm'
                    }`}
                >
                    {cat}
                </button>
            ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {loading ? (
                <div className="col-span-full py-20 text-center"><Loader2 className="animate-spin text-emerald-500 mx-auto" size={40} /></div>
            ) : filteredProducts.length === 0 ? (
                <div className="col-span-full py-20 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest bg-slate-100 rounded-[32px] border-2 border-dashed border-slate-200">
                    No matching gadgets found.
                </div>
            ) : filteredProducts.map((product) => (
                <div 
                    key={product.id} 
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="bg-white dark:bg-[#0a0a0a]/80 backdrop-blur-sm rounded-[24px] p-2.5 border border-slate-100 dark:border-white/5 group hover:border-emerald-500/40 transition-all duration-300 cursor-pointer flex flex-col shadow-lg shadow-slate-200/40 dark:shadow-none hover:shadow-2xl hover:-translate-y-1"
                >
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-white/5">
                        <img 
                          src={product.image_url} 
                          className="w-full h-full object-cover opacity-90 dark:opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700" 
                          alt={product.name} 
                        />
                    </div>

                    <div className="px-1.5 pb-1 flex-1">
                        <h4 className="text-[13px] font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none line-clamp-1 mb-1">{product.name}</h4>
                        <p className="text-[8px] text-slate-400 dark:text-gray-600 font-bold uppercase tracking-widest mb-3">{product.category}</p>

                        <div className="mt-auto flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="font-black text-xs text-slate-900 dark:text-white">SLE {product.price.toLocaleString()}</span>
                            </div>
                            <button 
                                onClick={(e) => handleAddToCart(e, product)}
                                disabled={addingId === product.id}
                                className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all active:scale-90 ${
                                    addingId === product.id 
                                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500 cursor-wait' 
                                    : 'bg-slate-50 dark:bg-white/5 text-slate-400 hover:bg-emerald-600 hover:text-white border-slate-200 dark:border-white/10'
                                }`}
                            >
                                {addingId === product.id ? (
                                    <Loader2 className="animate-spin" size={14} />
                                ) : (
                                    <ShoppingCart size={15} />
                                )}
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