
import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { getWishlist, toggleWishlist, getCurrentUser, addToCart } from '../services/storageService';
import { useCart } from '../contexts/CartContext';
import { WishlistItem } from '../types';
import { Loader2, ShoppingCart, Heart, Trash2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Wishlist: React.FC = () => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = getCurrentUser();
  const { refreshCartCount } = useCart();

  const load = async () => {
    if (user) {
      setLoading(true);
      const data = await getWishlist(user.id);
      setItems(data);
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleRemove = async (productId: string) => {
    if (!user) return;
    await toggleWishlist(user.id, productId);
    setItems(prev => prev.filter(i => i.product_id !== productId));
  };

  const handleAddToCart = async (productId: string) => {
    if (!user) return;
    await addToCart(user.id, productId, 1);
    await refreshCartCount();
    alert("Moved to Bag.");
  };

  return (
    <div className="min-h-screen pb-24">
      <Header title="Saved Gadgets" />
      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
        
        <div className="flex items-center gap-3 animate-reveal">
            <button onClick={() => navigate(-1)} className="p-2 text-gray-500 hover:text-white transition-all"><ArrowLeft size={20}/></button>
            <div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">My Wishlist</h2>
                <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Future Hardware Collection</p>
            </div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>
        ) : items.length === 0 ? (
          <div className="py-24 text-center bg-[#0a0a0f] border border-white/5 rounded-[40px] animate-reveal">
             <Heart size={48} className="mx-auto mb-4 text-gray-800" />
             <p className="text-gray-500 font-black uppercase text-[10px] tracking-widest">Wishlist Vault Empty</p>
             <button onClick={() => navigate('/')} className="mt-6 text-emerald-500 font-black text-[10px] uppercase tracking-[0.3em] hover:underline">Explore Marketplace</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item) => (
              <div key={item.id} className="bg-[#0a0a0f] border border-white/5 p-6 rounded-[32px] flex items-center gap-6 group hover:border-white/10 transition-all animate-reveal">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-black/40 border border-white/5 shrink-0">
                    <img src={item.product?.image_url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all" />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-black text-white text-lg tracking-tight uppercase truncate">{item.product?.name}</h4>
                    <p className="text-emerald-500 font-black text-sm">SLE {item.product?.price.toLocaleString()}</p>
                </div>
                <div className="flex flex-col gap-2">
                    <button onClick={() => handleAddToCart(item.product_id)} className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center hover:bg-emerald-500 transition-all"><ShoppingCart size={16}/></button>
                    <button onClick={() => handleRemove(item.product_id)} className="w-10 h-10 bg-white/5 text-gray-500 rounded-xl flex items-center justify-center hover:text-rose-500 border border-white/5 transition-all"><Trash2 size={16}/></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
