
import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { getCart, removeFromCart, refreshUserData, getCurrentUser, checkoutCart } from '../services/storageService';
import { useCart } from '../contexts/CartContext';
import { CartItem } from '../types';
import { Loader2, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Wallet, ChevronRight, Truck, Phone, MapPin, User as UserIcon, Copy, Hash, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Cart: React.FC = () => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'review' | 'shipping' | 'success'>('review');
  const [checkingOut, setCheckingOut] = useState(false);
  const [lastTrackingId, setLastTrackingId] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Form State
  const [shippingData, setShippingData] = useState({
      name: '',
      phone: '',
      address: '',
      paymentMethod: 'BALANCE' as 'BALANCE' | 'COD'
  });

  const navigate = useNavigate();
  const user = getCurrentUser();
  const { refreshCartCount } = useCart();

  const loadCart = async () => {
    if (user) {
      setLoading(true);
      const data = await getCart(user.id);
      setItems(data);
      setLoading(false);
    }
  };

  useEffect(() => { loadCart(); }, []);

  const total = items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  const hasInsufficientBalance = user ? user.balance < total : false;

  const handleCheckout = async () => {
    setError(null);
    if (!user || total === 0) return;
    
    if (!shippingData.name || !shippingData.phone || !shippingData.address) {
        setError("Please fill in all shipping details.");
        return;
    }
    
    if (shippingData.paymentMethod === 'BALANCE' && hasInsufficientBalance) {
        setError("Insufficient Wallet Balance. Please top up or select Pay on Delivery.");
        return;
    }
    
    setCheckingOut(true);
    try {
      const trackingId = await checkoutCart(user.id, total, shippingData);

      // UI state transition
      setLastTrackingId(trackingId);
      setItems([]);
      await refreshUserData();
      await refreshCartCount();
      setStep('success');
    } catch (e: any) {
      setError(e.message || "Checkout Failed.");
    } finally {
      setCheckingOut(false);
    }
  };

  const handleCopyTrackId = () => {
      navigator.clipboard.writeText(lastTrackingId);
      alert("Track ID copied!");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500" size={48} /></div>;

  if (step === 'success') {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center animate-spring-in">
              <div className="w-24 h-24 bg-emerald-500/20 rounded-[40px] flex items-center justify-center mb-8 border border-emerald-500/20 animate-bounce-subtle shadow-2xl">
                  <ShieldCheck size={48} className="text-emerald-500" />
              </div>
              <h2 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">Order Confirmed</h2>
              <p className="text-gray-500 text-sm max-w-xs mb-10 leading-relaxed font-medium">Your gadget request is now active on the neural grid.</p>
              
              <div className="bg-[#0a0a0f] border border-emerald-500/20 rounded-[32px] p-8 w-full max-w-sm mb-10 shadow-2xl relative overflow-hidden group">
                  <div className="relative z-10">
                      <p className="text-[9px] text-emerald-400 font-black uppercase tracking-[0.3em] mb-3 flex items-center justify-center gap-2">
                         <Hash size={10} /> Unique Track ID
                      </p>
                      <h3 className="text-2xl font-mono font-black text-white tracking-widest mb-6">{lastTrackingId}</h3>
                      <button 
                        onClick={handleCopyTrackId}
                        className="flex items-center justify-center gap-2 mx-auto text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-widest transition-colors"
                      >
                          <Copy size={14} /> Copy to Clipboard
                      </button>
                  </div>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-[40px] pointer-events-none"></div>
              </div>

              <div className="space-y-3 w-full max-w-sm">
                  <button onClick={() => navigate('/history')} className="w-full h-16 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all">
                      <Truck size={18} /> Track Lifecycle
                  </button>
                  <button onClick={() => navigate('/')} className="w-full h-16 bg-white/5 border border-white/5 text-gray-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:text-white transition-all">
                      Return to Shop
                  </button>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen pb-24">
      <Header title="Shopping Bag" />
      <div className="max-w-4xl mx-auto p-4 md:p-10">
        
        {items.length === 0 ? (
          <div className="py-32 text-center animate-spring-in">
             <div className="w-24 h-24 bg-white/5 rounded-[40px] flex items-center justify-center mx-auto mb-8 border border-white/5">
                <ShoppingBag size={48} className="text-gray-700" />
             </div>
             <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Empty Bag</h2>
             <button onClick={() => navigate('/')} className="bg-emerald-600 text-white px-10 py-5 rounded-3xl font-black uppercase text-[10px] tracking-widest shadow-xl mt-4">Browse Gadgets</button>
          </div>
        ) : (
          <div className="space-y-8 animate-spring-in">
             {step === 'review' ? (
                <>
                  <div className="flex items-center justify-between px-2">
                    <h2 className="text-xs font-black text-white uppercase tracking-[0.4em]">Review Items</h2>
                    <span className="text-[10px] text-gray-500 font-bold uppercase">{items.length} Items</span>
                  </div>

                  <div className="space-y-4">
                    {items.map(item => (
                      <div key={item.id} className="bg-[#0a0a0f]/60 backdrop-blur-xl rounded-[32px] p-6 border border-white/5 flex items-center gap-6 group hover:border-white/10 transition-colors">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-black/40 border border-white/5">
                            <img src={item.product?.image_url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-black text-white text-lg tracking-tight uppercase leading-none mb-1">{item.product?.name}</h4>
                            <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-black text-white leading-none mb-2">SLE {(item.product?.price || 0).toLocaleString()}</p>
                            <button onClick={() => removeFromCart(item.id).then(() => { loadCart(); refreshCartCount(); })} className="p-2 text-gray-700 hover:text-rose-500 transition-colors">
                              <Trash2 size={16} />
                            </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-[#111111] border border-white/5 rounded-[40px] p-10 shadow-2xl">
                    <div className="flex justify-between items-center mb-10">
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Bag Total</p>
                        <p className="text-4xl font-black text-white tracking-tighter">SLE {total.toLocaleString()}</p>
                    </div>
                    <button 
                      onClick={() => setStep('shipping')}
                      className="w-full h-20 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-black text-[11px] tracking-[0.3em] flex items-center justify-center gap-4 shadow-2xl transition-all"
                    >
                        SHIPPING DETAILS <ArrowRight size={20} />
                    </button>
                  </div>
                </>
             ) : (
                <div className="space-y-8">
                    <button onClick={() => setStep('review')} className="text-gray-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:text-white transition-colors">
                        <ChevronRight size={14} className="rotate-180" /> Back to summary
                    </button>

                    <div className="bg-[#0a0a0f] border border-white/5 rounded-[48px] p-10 space-y-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[40px] pointer-events-none"></div>
                        <h3 className="text-2xl font-black text-white tracking-tighter uppercase relative z-10">Delivery Protocol</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <UserIcon size={12} /> Receiver Name
                                </label>
                                <input 
                                    type="text" 
                                    value={shippingData.name}
                                    onChange={e => {setShippingData({...shippingData, name: e.target.value}); setError(null);}}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-white focus:outline-none focus:border-emerald-500/40"
                                    placeholder="Full Name"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Phone size={12} /> Contact Node
                                </label>
                                <input 
                                    type="tel" 
                                    value={shippingData.phone}
                                    onChange={e => {setShippingData({...shippingData, phone: e.target.value}); setError(null);}}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-white focus:outline-none focus:border-emerald-500/40"
                                    placeholder="07... ..."
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <MapPin size={12} /> Target Address
                                </label>
                                <textarea 
                                    value={shippingData.address}
                                    onChange={e => {setShippingData({...shippingData, address: e.target.value}); setError(null);}}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-white focus:outline-none focus:border-emerald-500/40 font-medium"
                                    placeholder="House, Street, Hub City..."
                                    rows={3}
                                />
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 relative z-10">
                            <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Payment Channel</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button 
                                    onClick={() => {setShippingData({...shippingData, paymentMethod: 'BALANCE'}); setError(null);}}
                                    className={`p-6 rounded-[24px] border flex flex-col items-start gap-2 transition-all relative overflow-hidden ${shippingData.paymentMethod === 'BALANCE' ? 'bg-emerald-600/10 border-emerald-500 text-emerald-400' : 'bg-white/5 border-white/5 text-gray-500'}`}
                                >
                                    <Wallet size={20} />
                                    <span className="font-black text-sm uppercase">Wallet Balance</span>
                                    <span className={`text-[9px] font-bold ${hasInsufficientBalance ? 'text-rose-500' : 'opacity-60'}`}>
                                        {hasInsufficientBalance ? 'Insufficient Funds' : `Balance: SLE ${user?.balance.toLocaleString()}`}
                                    </span>
                                    {shippingData.paymentMethod === 'BALANCE' && hasInsufficientBalance && (
                                        <div className="absolute top-2 right-2 text-rose-500">
                                            <AlertCircle size={14} />
                                        </div>
                                    )}
                                </button>
                                <button 
                                    onClick={() => {setShippingData({...shippingData, paymentMethod: 'COD'}); setError(null);}}
                                    className={`p-6 rounded-[24px] border flex flex-col items-start gap-2 transition-all ${shippingData.paymentMethod === 'COD' ? 'bg-blue-600/10 border-blue-500 text-blue-400' : 'bg-white/5 border-white/5 text-gray-500'}`}
                                >
                                    <Truck size={20} />
                                    <span className="font-black text-sm uppercase">Pay on Delivery</span>
                                    <span className="text-[9px] opacity-60">Settle when package arrives.</span>
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-rose-500/10 border border-rose-500/20 p-5 rounded-2xl flex items-center gap-4 animate-in zoom-in duration-300 relative z-10">
                                <AlertCircle className="text-rose-500 shrink-0" size={20} />
                                <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest leading-relaxed">
                                    {error}
                                </p>
                            </div>
                        )}

                        <button 
                            onClick={handleCheckout}
                            disabled={checkingOut}
                            className="w-full h-20 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-black uppercase text-[11px] tracking-[0.3em] flex items-center justify-center gap-4 shadow-2xl transition-all active:scale-95 disabled:opacity-50 relative z-10"
                        >
                            {checkingOut ? <Loader2 className="animate-spin" /> : (
                              <div className="flex items-center justify-between w-full px-10">
                                <span className="flex-1 text-center">COMMIT HARDWARE REQUEST</span>
                                <ShieldCheck size={24} />
                              </div>
                            )}
                        </button>
                    </div>
                </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
