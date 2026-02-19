
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
  CartItem,
  UserProduct,
  StakingPool,
  UserStake,
  BondTemplate,
  UserBond,
  TrainingEpoch,
  UserEpochInvestment
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

export const trackOrderById = async (trackingId: string): Promise<Order | null> => {
    const { data, error } = await supabase.from('orders').select('*, products(name, image_url)').eq('tracking_number', trackingId).maybeSingle();
    if (error || !data) return null;
    return { ...data, product_name: data.products?.name, product_image: data.products?.image_url };
};

export const userConfirmDelivery = async (orderId: string) => {
  const user = getCurrentUser();
  if (!user) throw new Error("Unauthenticated session");
  const { error } = await supabase.rpc('user_confirm_order_delivery_v2', { p_user_id: user.id, p_order_id: orderId });
  if (error) handleSupabaseError(error);
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
  await supabase.rpc('admin_approve_deposit', { p_tx_id: txId });
};

export const adminRejectTransaction = async (txId: string) => {
  await supabase.from('transactions').update({ status: TransactionStatus.REJECTED }).eq('id', txId);
};

export const adminUpdateOrderStatus = async (orderId: string, status: OrderStatus, trackingNumber: string = '') => {
  await supabase.from('orders').update({ status, tracking_number: trackingNumber, updated_at: Date.now() }).eq('id', orderId);
};

export const updateUserBalance = async (userId: string, balance: number) => {
  await supabase.from('users').update({ balance }).eq('id', userId);
};

export const adminCreateProduct = async (product: Partial<Product>) => {
  await supabase.from('products').insert({ ...product, created_at: Date.now(), is_active: true });
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
  const { data } = await supabase.from('notifications').select('*').eq('user_id', userId).order('date', { ascending: false });
  return data || [];
};

export const markNotificationRead = async (id: string) => {
  await supabase.from('notifications').update({ read: true }).eq('id', id);
};

// --- FIXES: Added missing functions ---

// Withdrawal Logic
export const createWithdrawal = async (userId: string, amount: number, details: string) => {
  const { data: user } = await supabase.from('users').select('phone').eq('id', userId).single();
  await supabase.from('transactions').insert({ 
    id: 'WTH-' + Date.now(), 
    user_id: userId, 
    user_phone: user?.phone, 
    type: TransactionType.WITHDRAWAL, 
    amount, 
    status: TransactionStatus.PENDING, 
    date: Date.now(), 
    details 
  });
};

export const adminApproveWithdrawal = async (txId: string) => {
  await supabase.rpc('admin_approve_withdrawal', { p_tx_id: txId });
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
  await supabase.from('products').update(product).eq('id', product.id);
};

export const uploadProductImage = async (file: File): Promise<string> => {
  // Assuming a generic bucket named 'images' for this implementation
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `products/${fileName}`;
  const { error } = await supabase.storage.from('images').upload(filePath, file);
  if (error) throw error;
  const { data } = supabase.storage.from('images').getPublicUrl(filePath);
  return data.publicUrl;
};

// User Purchased Hardware (Neural Sprints)
export const getAllProducts = async (userId: string): Promise<UserProduct[]> => {
  const { data } = await supabase.from('user_products').select('*').eq('user_id', userId);
  return (data || []).map(d => ({
    ...d,
    userId: d.user_id,
    vipName: d.vip_name,
    dailyRate: d.daily_rate,
    expiryDate: d.expiry_date,
    lastRewardDate: d.last_reward_date
  }));
};

// Earnings Process
export const processAutomaticEarnings = async () => {
  await supabase.rpc('process_automatic_earnings');
};

// Staking Pools
export const getStakingPools = async (): Promise<StakingPool[]> => {
  const { data } = await supabase.from('staking_pools').select('*');
  return data || [];
};

export const injectPoolLiquidity = async (userId: string, poolId: string, amount: number) => {
  const { error } = await supabase.rpc('inject_staking_liquidity', { p_user_id: userId, p_pool_id: poolId, p_amount: amount });
  if (error) throw error;
};

export const getUserStakes = async (userId: string): Promise<UserStake[]> => {
  const { data } = await supabase.from('user_stakes').select('*').eq('user_id', userId);
  return (data || []).map(d => ({ ...d, userId: d.user_id, poolId: d.pool_id, stakedAt: d.staked_at }));
};

// Bonds
export const getBondTemplates = async (): Promise<BondTemplate[]> => {
  const { data } = await supabase.from('bond_templates').select('*');
  return (data || []).map(d => ({
    ...d,
    tierLabel: d.tier_label,
    durationDays: d.duration_days,
    interestRatePercent: d.interest_rate_percent,
    minInvestment: d.min_investment
  }));
};

export const purchaseBond = async (userId: string, templateId: string, amount: number) => {
  const { error } = await supabase.rpc('purchase_bond', { p_user_id: userId, p_template_id: templateId, p_amount: amount });
  if (error) throw error;
};

export const getUserBonds = async (userId: string): Promise<UserBond[]> => {
  const { data } = await supabase.from('user_bonds').select('*').eq('user_id', userId);
  return (data || []).map(d => ({
    ...d,
    userId: d.user_id,
    bondName: d.bond_name,
    endDate: d.end_date,
    totalReturn: d.total_return
  }));
};

// Training Epochs
export const getTrainingEpochs = async (): Promise<TrainingEpoch[]> => {
  const { data } = await supabase.from('training_epochs').select('*');
  return (data || []).map(d => ({
    ...d,
    rewardMultiplier: d.reward_multiplier,
    minInvestment: d.min_investment,
    currentFilled: d.current_filled,
    totalTarget: d.total_target
  }));
};

export const investInEpoch = async (userId: string, epochId: string, amount: number) => {
  const { error } = await supabase.rpc('invest_in_epoch', { p_user_id: userId, p_epoch_id: epochId, p_amount: amount });
  if (error) throw error;
};

export const getUserEpochInvestments = async (userId: string): Promise<UserEpochInvestment[]> => {
  const { data } = await supabase.from('user_epoch_investments').select('*').eq('user_id', userId);
  return (data || []).map(d => ({ ...d, userId: d.user_id, epochId: d.epoch_id }));
};
