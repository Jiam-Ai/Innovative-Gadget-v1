
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, addToCart, getCurrentUser } from '../services/storageService';
import { Product } from '../types';
import { Header } from '../components/Header';
import { Loader2, ShoppingCart, ArrowLeft, ShieldCheck, Zap, Info, ChevronLeft, ChevronRight } from 'lucide-react';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const user = getCurrentUser();

  useEffect(() => {
    const load = async () => {
      if (id) {
        const data = await getProductById(id);
        setProduct(data);
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) return navigate('/login');
    if (!product) return;
    setAdding(true);
    try {
      await addToCart(user.id, product.id, 1);
      alert(`${product.name} added to your bag.`);
    } catch (e) {
      alert("Bag synchronization failed.");
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500" size={48} /></div>;
  if (!product) return <div className="p-10 text-center">Gadget Not Found</div>;

  const gallery = product.images && product.images.length > 0 ? product.images : [product.image_url];

  const nextImg = () => setActiveImageIdx((prev) => (prev + 1) % gallery.length);
  const prevImg = () => setActiveImageIdx((prev) => (prev - 1 + gallery.length) % gallery.length);

  return (
    <div className="min-h-screen pb-24">
      <Header title="Tech Specs" />
      <div className="max-w-6xl mx-auto p-4 md:p-10 space-y-10">
        
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-black text-[10px] uppercase tracking-widest">Store Index</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Pro Gallery System */}
          <div className="space-y-6">
            <div className="relative group aspect-square rounded-[48px] overflow-hidden bg-black border border-white/5 shadow-2xl">
              <img 
                src={gallery[activeImageIdx]} 
                alt={product.name} 
                className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-500" 
              />
              
              {gallery.length > 1 && (
                  <>
                    <button onClick={prevImg} className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 opacity-0 group-hover:opacity-100 transition-all hover:bg-black/60">
                        <ChevronLeft size={24} />
                    </button>
                    <button onClick={nextImg} className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 opacity-0 group-hover:opacity-100 transition-all hover:bg-black/60">
                        <ChevronRight size={24} />
                    </button>
                  </>
              )}

              <div className="absolute top-8 left-8 bg-emerald-500/10 backdrop-blur-xl px-4 py-1.5 rounded-full border border-emerald-500/20">
                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">{product.category}</span>
              </div>
            </div>

            {/* Thumbnail Scroll */}
            {gallery.length > 1 && (
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                    {gallery.map((img, idx) => (
                        <button 
                            key={idx}
                            onClick={() => setActiveImageIdx(idx)}
                            className={`w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${activeImageIdx === idx ? 'border-emerald-500 scale-105' : 'border-white/5 opacity-40 hover:opacity-100'}`}
                        >
                            <img src={img} className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
          </div>

          {/* Product Data */}
          <div className="flex flex-col justify-center space-y-8">
            <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">{product.name}</h1>
                <p className="text-lg text-gray-500 leading-relaxed">{product.description}</p>
            </div>
            
            <div className="flex items-center gap-4 py-8 border-y border-white/5">
                <div className="flex-1">
                    <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-1">Full Price</p>
                    <p className="text-4xl font-black text-white">SLE {product.price.toLocaleString()}</p>
                </div>
                <div className="bg-emerald-500/5 border border-emerald-500/10 px-6 py-4 rounded-3xl text-right">
                    <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest mb-1">Stock Node</p>
                    <p className="text-xl font-black text-white">{product.stock_quantity} Left</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-500">
                    <ShieldCheck size={18} className="text-emerald-500" />
                    <span className="text-xs font-bold uppercase tracking-widest text-[10px]">Quality Certified Hardware</span>
                </div>
                <div className="flex items-center gap-3 text-gray-500">
                    <Zap size={18} className="text-emerald-500" />
                    <span className="text-xs font-bold uppercase tracking-widest text-[10px]">Instant Fulfillment Sequence</span>
                </div>
            </div>

            <div className="flex gap-4 pt-4">
                <button 
                    onClick={handleAddToCart}
                    disabled={adding}
                    className="flex-[2] h-20 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[28px] font-black text-xs uppercase tracking-[0.3em] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 relative overflow-hidden"
                >
                    {adding ? <Loader2 className="animate-spin" /> : <><ShoppingCart size={20} /> Checkout to Bag</>}
                </button>
                <button className="flex-1 h-20 bg-white/5 border border-white/10 text-white rounded-[28px] flex items-center justify-center hover:bg-white/10 transition-all">
                    <Info size={24} />
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
