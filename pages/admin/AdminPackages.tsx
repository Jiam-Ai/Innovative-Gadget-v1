
import React, { useState, useEffect } from 'react';
import { getProducts, adminCreateProduct, adminUpdateProduct, uploadProductImage } from '../../services/storageService';
import { Product } from '../../types';
import { Plus, Package, Edit2, X, Image as ImageIcon, Loader2, Save, Upload, Check, Trash2, Search } from 'lucide-react';

const AdminPackages: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
      name: '',
      description: '',
      price: 0,
      image_url: '',
      images: [],
      category: 'Laptops',
      stock_quantity: 50
  });

  const load = async () => {
    setLoading(true);
    const data = await getProducts();
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!newProduct.name || !newProduct.price) return;
    setLoading(true);
    try {
        const payload = { ...newProduct };
        if (!payload.image_url && payload.images && payload.images.length > 0) {
            payload.image_url = payload.images[0];
        }
        await adminCreateProduct(payload);
        setShowAddModal(false);
        setNewProduct({ name: '', description: '', price: 0, image_url: '', images: [], category: 'Laptops', stock_quantity: 50 });
        await load();
    } catch (e) {
        alert("Failed to save product.");
    } finally {
        setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const uploadedUrls: string[] = [...(newProduct.images || [])];
    try {
        for (let i = 0; i < files.length; i++) {
            const url = await uploadProductImage(files[i]);
            uploadedUrls.push(url);
        }
        setNewProduct({ ...newProduct, images: uploadedUrls });
    } catch (err: any) {
        alert("Upload Protocol Error.");
    } finally {
        setUploading(false);
    }
  };

  const removeImage = (index: number) => {
      const updated = [...(newProduct.images || [])];
      updated.splice(index, 1);
      setNewProduct({ ...newProduct, images: updated });
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tighter">Inventory Control</h2>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Global Gadget Mesh</p>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
                <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search catalog..."
                    className="bg-black/20 border border-white/5 rounded-xl py-2 pl-9 pr-4 text-[11px] text-white focus:outline-none focus:border-emerald-500/40 w-48 lg:w-64"
                />
            </div>
            <button 
                onClick={() => setShowAddModal(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg transition-all flex items-center gap-2 active:scale-95"
            >
                <Plus size={14} /> Add Gadget
            </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 lg:gap-4">
          {loading && products.length === 0 ? (
              <div className="col-span-full py-20 text-center"><Loader2 className="animate-spin text-emerald-500 mx-auto" size={32} /></div>
          ) : filtered.map((pkg) => (
              <div key={pkg.id} className="bg-[#0a0a0f]/80 border border-white/5 rounded-2xl p-2.5 group hover:border-emerald-500/40 transition-all flex flex-col shadow-xl">
                  <div className="h-32 w-full rounded-xl overflow-hidden mb-3 bg-black relative border border-white/5">
                      <img src={pkg.image_url} alt="" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute top-2 right-2 bg-black/60 px-1.5 py-0.5 rounded-md border border-white/10 flex items-center gap-1">
                          <ImageIcon size={8} className="text-emerald-400" />
                          <span className="text-[7px] font-black text-white">{pkg.images?.length || 1}</span>
                      </div>
                  </div>

                  <div className="flex-1 px-1">
                      <h4 className="font-black text-white text-[11px] leading-tight mb-2 uppercase tracking-tight line-clamp-1">{pkg.name}</h4>
                      
                      <div className="grid grid-cols-1 gap-1.5 mb-3">
                          <div className="flex justify-between items-center bg-white/5 rounded-lg px-2 py-1 border border-white/5">
                              <span className="text-[7px] text-gray-500 font-bold uppercase">Price</span>
                              <span className="text-[10px] font-black text-white">SLE {pkg.price.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center bg-white/5 rounded-lg px-2 py-1 border border-white/5">
                              <span className="text-[7px] text-gray-500 font-bold uppercase">Stock</span>
                              <span className={`text-[10px] font-black ${pkg.stock_quantity < 10 ? 'text-rose-500' : 'text-emerald-400'}`}>{pkg.stock_quantity}</span>
                          </div>
                      </div>
                  </div>

                  <div className="flex gap-1.5 mt-auto">
                      <button className="flex-1 py-1.5 text-[8px] font-black uppercase bg-white/5 hover:bg-emerald-600 text-gray-400 hover:text-white rounded-lg border border-white/5 transition-all">Quick Edit</button>
                      <button className="p-1.5 bg-white/5 text-gray-600 rounded-lg hover:text-rose-500 transition-all border border-white/5"><Trash2 size={12} /></button>
                  </div>
              </div>
          ))}
      </div>

      {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
              <div className="bg-[#111111] border border-white/10 rounded-[32px] p-8 w-full max-w-lg shadow-2xl relative overflow-y-auto max-h-[90vh] custom-scrollbar">
                  <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
                      <X size={24} />
                  </button>
                  
                  <h3 className="text-xl font-black text-white tracking-tighter uppercase mb-6">New Catalog Entry</h3>

                  <div className="space-y-4">
                      <div className="space-y-1.5">
                          <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest ml-1">Device Identity</label>
                          <input 
                            type="text" 
                            value={newProduct.name}
                            onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                            placeholder="e.g. iPhone 15 Pro Max"
                          />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                              <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest ml-1">Price (SLE)</label>
                              <input 
                                type="number" 
                                value={newProduct.price}
                                onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                                placeholder="0"
                              />
                          </div>
                          <div className="space-y-1.5">
                              <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest ml-1">Stock Units</label>
                              <input 
                                type="number" 
                                value={newProduct.stock_quantity}
                                onChange={(e) => setNewProduct({...newProduct, stock_quantity: parseInt(e.target.value)})}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                                placeholder="50"
                              />
                          </div>
                      </div>

                      <div className="space-y-1.5">
                          <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest ml-1">Visual Array</label>
                          <div className="grid grid-cols-5 gap-2">
                              {newProduct.images?.map((img, idx) => (
                                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-white/10 bg-black group">
                                      <img src={img} className="w-full h-full object-cover" />
                                      <button 
                                        onClick={() => removeImage(idx)}
                                        className="absolute top-1 right-1 bg-rose-600 text-white p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <X size={10} />
                                      </button>
                                  </div>
                              ))}
                              <label className="aspect-square rounded-lg border border-dashed border-white/20 flex flex-col items-center justify-center text-gray-600 hover:border-emerald-500/50 hover:text-emerald-500 transition-all cursor-pointer">
                                  {uploading ? <Loader2 size={12} className="animate-spin" /> : <Plus size={16} />}
                                  <input type="file" multiple className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                              </label>
                          </div>
                      </div>
                  </div>

                  <div className="flex gap-3 mt-8">
                      <button 
                        onClick={() => setShowAddModal(false)}
                        className="flex-1 py-3.5 rounded-xl font-black text-[9px] uppercase tracking-widest text-gray-600 bg-white/5 hover:bg-white/10 transition-all"
                      >
                          Abort
                      </button>
                      <button 
                        onClick={handleCreate}
                        disabled={loading || uploading}
                        className="flex-[2] py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 transition-all"
                      >
                          {loading ? <Loader2 size={14} className="animate-spin" /> : <><Save size={14} /> Commit to Ledger</>}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default AdminPackages;
