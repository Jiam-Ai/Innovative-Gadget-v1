
import { supabase } from './supabaseClient';
import { 
  User, 
  Transaction, 
  TransactionType, 
  TransactionStatus, 
  Product, 
  Order,
  OrderStatus,
  WishlistItem,
  CartItem
} from '../types';

const USER_KEY = 'innovative_gadget_user';

const handleSupabaseError = (error: any) => {
  console.error('System Error:', error);
  throw new Error(error.message);
};

export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
};

export const logoutUser = () => {
  localStorage.removeItem(USER_KEY);
};

export const refreshUserData = async (): Promise<User | null> => {
  const user = getCurrentUser();
  if (!user) return null;
  const { data, error } = await supabase.from('users').select('*').eq('id', user.id).single();
  if (error) return user;
  
  const updatedUser: User = {
    ...data,
    registeredAt: data.registered_at,
    verificationCode: data.verification_code,
    isAdmin: data.is_admin,
    withdrawalAccount: data.withdrawal_account,
    invitedBy: data.invited_by,
    member_level: data.member_level,
    loyalty_points: data.loyalty_points
  };
  localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  return updatedUser;
};

// --- Wishlist Logic ---
export const toggleWishlist = async (userId: string, productId: string) => {
  const { data: existing } = await supabase
    .from('wishlist')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .maybeSingle();

  if (existing) {
    await supabase.from('wishlist').delete().eq('id', existing.id);
    return false;
  } else {
    await supabase.from('wishlist').insert({ user_id: userId, product_id: productId, created_at: Date.now() });
    return true;
  }
};

export const getWishlist = async (userId: string) => {
  const { data, error } = await supabase.from('wishlist').select('*, products(*)').eq('user_id', userId);
  if (error) return [];
  return data.map(item => ({ ...item, product: item.products }));
};

// --- Products & Orders ---
export const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false });
  if (error) return [];
  return data;
};

export const getProductById = async (id: string): Promise<Product | null> => {
  const { data, error } = await supabase.from('products').select('*').eq('id', id).maybeSingle();
  if (error) return null;
  return data;
};

export const getCart = async (userId: string): Promise<CartItem[]> => {
  const { data, error } = await supabase.from('cart_items').select('*, products(*)').eq('user_id', userId);
  if (error) return [];
  return data.map(item => ({ ...item, product: item.products }));
};

export const addToCart = async (userId: string, productId: string, quantity: number = 1) => {
  const { data: existing } = await supabase.from('cart_items').select('*').eq('user_id', userId).eq('product_id', productId).maybeSingle();
  if (existing) {
    const { error } = await supabase.from('cart_items').update({ quantity: existing.quantity + quantity }).eq('id', existing.id);
    if (error) handleSupabaseError(error);
  } else {
    const { error } = await supabase.from('cart_items').insert({ user_id: userId, product_id: productId, quantity });
    if (error) handleSupabaseError(error);
  }
};

export const removeFromCart = async (cartItemId: string) => {
  await supabase.from('cart_items').delete().eq('id', cartItemId);
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  const { data, error } = await supabase.from('orders').select('*, products(name, image_url)').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) return [];
  return data.map(o => ({ ...o, product_name: o.products?.name, product_image: o.products?.image_url }));
};

export const trackOrderById = async (searchId: string): Promise<Order | null> => {
    if (!searchId || searchId.trim() === '') return null;
    
    const search = searchId.trim().toUpperCase();
    
    // Try RPC function first (most reliable)
    const { data, error } = await supabase.rpc('track_order', { p_search_id: search });
    
    if (!error && data && data.length > 0) {
        const order = data[0];
        return {
            ...order,
            product_name: order.product_name,
            product_image: order.product_image
        };
    }
    
    // Fallback: direct query with ilike
    const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*, products(name, image_url)')
        .or(`tracking_number.ilike.${search},id.ilike.${search}`)
        .limit(1)
        .maybeSingle();
    
    if (orderError) {
        console.error('Track order error:', orderError);
        return null;
    }
    
    if (orderData) {
        return {
            ...orderData,
            product_name: orderData.products?.name,
            product_image: orderData.products?.image_url
        };
    }
    
    return null;
};

export const userConfirmDelivery = async (orderId: string) => {
  const user = getCurrentUser();
  if (!user) throw new Error("Unauthenticated session");
  
  console.log('Confirming delivery for order:', orderId, 'user:', user.id);
  
  // Use the new function that also expires tracking
  const { error } = await supabase.rpc('user_confirm_delivery', { 
    p_user_id: user.id, 
    p_order_id: orderId 
  });
  
  console.log('RPC result:', error ? error.message : 'success');
  
  if (error) {
    // Fallback: direct update
    console.warn('Confirm delivery RPC failed, using fallback:', error.message);
    
    const { data: order } = await supabase.from('orders').select('user_id, status').eq('id', orderId).eq('user_id', user.id).single();
    
    console.log('Order data:', order);
    
    if (order && (order.status === 'DELIVERED' || order.status === 'SHIPPED')) {
      const { error: updateError } = await supabase.from('orders').update({
        status: 'COMPLETED',
        tracking_number: null, // Expire tracking
        updated_at: Date.now()
      }).eq('id', orderId);
      
      if (!updateError) {
        // Create notification
        const notifId = 'NOTIF-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        await supabase.from('notifications').insert({
          id: notifId,
          user_id: user.id,
          title: 'Order Completed',
          message: `Thank you! Order ${orderId} is complete. Tracking expired.`,
          date: Date.now(),
          type: 'success'
        });
        return;
      }
    }
    throw new Error(error.message || 'Failed to confirm delivery');
  }
};

// --- Auth ---
export const loginUser = async (phone: string, password: string): Promise<User> => {
  const { data, error } = await supabase.from('users').select('*').eq('phone', phone).eq('password', password).maybeSingle();
  if (error) handleSupabaseError(error);
  if (!data) throw new Error('Invalid credentials');
  const user: User = { ...data, registeredAt: data.registered_at, verificationCode: data.verification_code, isAdmin: data.is_admin, invitedBy: data.invited_by };
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
};

export const registerUser = async (phone: string, password: string, invitedBy: string = '', bonus: number = 0): Promise<User> => {
  const newUser = {
    id: Math.random().toString(36).substring(2, 11), phone, password, balance: bonus,
    verification_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
    is_admin: phone === '076000000', registered_at: Date.now(), invited_by: invitedBy.trim() === '' ? null : invitedBy.trim(),
    full_name: 'Customer', avatar_url: 'https://images.unsplash.com/photo-1633332755-1ba8b97f60c1?w=200&q=80', bio: 'Gadget Enthusiast'
  };
  const { data, error } = await supabase.from('users').insert(newUser).select().single();
  if (error) handleSupabaseError(error);
  const user: User = { ...data, registeredAt: data.registered_at, verificationCode: data.verification_code, isAdmin: data.is_admin };
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
};

export const updateUserInfo = async (userId: string, fullName: string, bio: string) => {
  await supabase.from('users').update({ full_name: fullName, bio }).eq('id', userId);
};

export const getTransactions = async (userId?: string): Promise<Transaction[]> => {
  let q = supabase.from('transactions').select('*');
  if (userId) q = q.eq('user_id', userId);
  const { data, error } = await q.order('date', { ascending: false });
  if (error) return [];
  return data.map(t => ({ ...t, userId: t.user_id, userPhone: t.user_phone, referenceId: t.reference_id }));
};

export const createDeposit = async (userId: string, amount: number, referenceId: string) => {
  const { data: user } = await supabase.from('users').select('phone').eq('id', userId).single();
  await supabase.from('transactions').insert({ id: 'DEP-' + Date.now(), user_id: userId, user_phone: user?.phone, type: TransactionType.DEPOSIT, amount, status: TransactionStatus.PENDING, date: Date.now(), reference_id: referenceId, method: 'Payment' });
};

// Admin
export const getAllUsers = async (): Promise<User[]> => {
  const { data } = await supabase.from('users').select('*').order('registered_at', { ascending: false });
  return (data || []).map(d => ({ ...d, registeredAt: d.registered_at, verificationCode: d.verification_code, isAdmin: d.is_admin }));
};

export const getAllOrders = async (): Promise<Order[]> => {
  const { data } = await supabase.from('orders').select('*, products(name, image_url), users(phone)').order('created_at', { ascending: false });
  return (data || []).map(o => ({ ...o, product_name: o.products?.name, product_image: o.products?.image_url }));
};

export const adminApproveDeposit = async (txId: string) => {
  const { error } = await supabase.rpc('admin_approve_deposit', { p_tx_id: txId });
  if (error) handleSupabaseError(error);
};

export const adminRejectTransaction = async (txId: string) => {
  const { error } = await supabase.rpc('admin_reject_transaction', { p_tx_id: txId });
  if (error) handleSupabaseError(error);
};

export const adminUpdateOrderStatus = async (orderId: string, status: OrderStatus, trackingNumber: string = '') => {
  // Try specific functions first based on status
  let success = false;
  
  if (status === OrderStatus.SHIPPED) {
    // Use admin_ship_order which generates tracking
    const { data, error } = await supabase.rpc('admin_ship_order', { 
      p_order_id: orderId, 
      p_tracking_number: trackingNumber || null 
    });
    if (!error) {
      console.log('Order shipped with tracking:', data);
      success = true;
    } else {
      console.warn('Ship RPC failed:', error.message);
    }
  } else if (status === OrderStatus.DELIVERED) {
    const { error } = await supabase.rpc('admin_deliver_order', { p_order_id: orderId });
    if (!error) success = true;
    else console.warn('Deliver RPC failed:', error.message);
  }
  
  if (!success) {
    // Fallback: use generic update function
    console.warn('Using fallback update_order_status');
    const { error } = await supabase.rpc('update_order_status', {
      p_order_id: orderId,
      p_new_status: status,
      p_tracking: trackingNumber
    });
    
    if (error) {
      // Final fallback: direct update
      const { data: order } = await supabase.from('orders').select('user_id').eq('id', orderId).single();
      if (order) {
        await supabase.from('orders').update({
          status: status,
          tracking_number: trackingNumber || undefined,
          updated_at: Date.now()
        }).eq('id', orderId);
        
        // Create notification
        const notifId = 'NOTIF-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        await supabase.from('notifications').insert({
          id: notifId,
          user_id: order.user_id,
          title: 'Order Update',
          message: `Order ${orderId} status: ${status}`,
          date: Date.now(),
          type: 'info'
        });
      }
    }
  }
};

export const updateUserBalance = async (userId: string, balance: number) => {
  const { error } = await supabase.from('users').update({ balance }).eq('id', userId);
  if (error) handleSupabaseError(error);
};

export const adminCreateProduct = async (product: Partial<Product>) => {
  const { error } = await supabase.from('products').insert({ ...product, created_at: Date.now(), is_active: true });
  if (error) handleSupabaseError(error);
};

export const adminDeleteProduct = async (productId: string) => {
  // Try RPC first
  const { error } = await supabase.rpc('admin_delete_product', { p_product_id: productId });
  
  if (error) {
    // Fallback: direct delete
    console.warn('RPC failed, using direct delete:', error.message);
    const { error: deleteError } = await supabase.from('products').delete().eq('id', productId);
    if (deleteError) handleSupabaseError(deleteError);
  }
};

export const checkoutCart = async (userId: string, totalAmount: number, shippingData: any) => {
  const trackingId = 'TRK-' + Math.random().toString(36).substring(2, 10).toUpperCase();
  const { error } = await supabase.rpc('atomic_cart_checkout', {
    p_user_id: userId, p_total_amount: totalAmount, p_payment_method: shippingData.paymentMethod,
    p_receiver_name: shippingData.name, p_receiver_phone: shippingData.phone, p_address: shippingData.address, p_tracking_id: trackingId 
  });
  if (error) handleSupabaseError(error);
  return trackingId;
};

export const getNotifications = async (userId: string) => {
  const { data, error } = await supabase.from('notifications').select('*').eq('user_id', userId).order('date', { ascending: false });
  if (error) return [];
  return data || [];
};

export const markNotificationRead = async (id: string) => {
  const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
  if (error) handleSupabaseError(error);
};

// Withdrawal Logic
export const createWithdrawal = async (userId: string, amount: number, details: string) => {
  const { data: user, error: userError } = await supabase.from('users').select('phone, balance').eq('id', userId).single();
  if (userError) handleSupabaseError(userError);
  
  if ((user?.balance || 0) < amount) {
    throw new Error("Insufficient balance for withdrawal request.");
  }

  const { error } = await supabase.from('transactions').insert({ 
    id: 'WTH-' + Date.now(), 
    user_id: userId, 
    user_phone: user?.phone, 
    type: TransactionType.WITHDRAWAL, 
    amount, 
    status: TransactionStatus.PENDING, 
    date: Date.now(), 
    details 
  });
  if (error) handleSupabaseError(error);
};

export const adminApproveWithdrawal = async (txId: string) => {
  const { error } = await supabase.rpc('admin_approve_withdrawal', { p_tx_id: txId });
  if (error) handleSupabaseError(error);
};

// Security and User Settings
export const changePassword = async (userId: string, oldPass: string, newPass: string) => {
  const { data: user } = await supabase.from('users').select('password').eq('id', userId).single();
  if (user?.password !== oldPass) throw new Error('Incorrect current password');
  await supabase.from('users').update({ password: newPass }).eq('id', userId);
};

export const updateWithdrawalAccount = async (userId: string, account: string) => {
  await supabase.from('users').update({ withdrawal_account: account }).eq('id', userId);
};

export const updateProfilePicture = async (userId: string, url: string) => {
  await supabase.from('users').update({ avatar_url: url }).eq('id', userId);
};

// Product Management
export const adminUpdateProduct = async (product: Partial<Product>) => {
  const { error } = await supabase.from('products').update(product).eq('id', product.id);
  if (error) handleSupabaseError(error);
};

export const deleteUser = async (userId: string) => {
  const { error } = await supabase.from('users').delete().eq('id', userId);
  if (error) handleSupabaseError(error);
};

export const uploadProductImage = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `products/${fileName}`;
  
  try {
    const { error } = await supabase.storage.from('images').upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });
    
    if (error) {
      console.error('Supabase storage error:', error);
      
      // Fallback: Use a placeholder service for demo/development
      // In production, ensure the storage bucket 'images' exists in Supabase
      const placeholderUrl = `https://placehold.co/400x400/1a1a1a/ffffff?text=${encodeURIComponent(file.name.substring(0, 10))}`;
      console.warn('Using placeholder image. Ensure Supabase storage bucket "images" exists and is public.');
      return placeholderUrl;
    }
    
    const { data } = supabase.storage.from('images').getPublicUrl(filePath);
    return data.publicUrl;
  } catch (err) {
    console.error('Upload error:', err);
    // Return placeholder on any error
    return `https://placehold.co/400x400/1a1a1a/ffffff?text=Image`;
  }
};
