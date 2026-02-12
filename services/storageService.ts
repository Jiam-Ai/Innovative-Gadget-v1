
import { supabase } from './supabaseClient';
import { 
  User, 
  Transaction, 
  TransactionType, 
  TransactionStatus, 
  Product, 
  Order,
  OrderStatus,
  AppNotification,
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

// Helper to generate a unique system tracking ID
const generateTrackingId = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const segment = () => Array.from({length: 4}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `TRK-${segment()}-${segment()}`;
};

// Helper to push a notification to a user
export const pushNotification = async (userId: string, title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
  const { error } = await supabase.from('notifications').insert({
    id: 'NT-' + Date.now() + Math.floor(Math.random() * 1000),
    user_id: userId,
    title,
    message,
    date: Date.now(),
    read: false,
    type
  });
  if (error) console.error("Notification push failed:", error);
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
    invitedBy: data.invited_by
  };
  localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  return updatedUser;
};

export const updateProfilePicture = async (userId: string, avatarUrl: string) => {
  const { error } = await supabase.from('users').update({ avatar_url: avatarUrl }).eq('id', userId);
  if (error) handleSupabaseError(error);
  return await refreshUserData();
};

export const updateUserInfo = async (userId: string, fullName: string, bio: string) => {
  const { error } = await supabase.from('users').update({ full_name: fullName, bio: bio }).eq('id', userId);
  if (error) handleSupabaseError(error);
  return await refreshUserData();
};

// --- E-commerce Product Logic ---

export const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false });
  if (error) return [];
  return data;
};

export const getProductById = async (id: string): Promise<Product | null> => {
  const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
  if (error) return null;
  return data;
};

// --- Cart & Checkout Logic ---

export const getCart = async (userId: string): Promise<CartItem[]> => {
  const { data, error } = await supabase
    .from('cart_items')
    .select('*, products(*)').eq('user_id', userId);
  
  if (error) return [];
  return data.map(item => ({
    ...item,
    product: item.products
  }));
};

export const addToCart = async (userId: string, productId: string, quantity: number = 1) => {
  const { data: existing } = await supabase
    .from('cart_items')
    .select('*')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single();

  if (existing) {
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: existing.quantity + quantity })
      .eq('id', existing.id);
    if (error) handleSupabaseError(error);
  } else {
    const { error } = await supabase.from('cart_items').insert({
      user_id: userId,
      product_id: productId,
      quantity
    });
    if (error) handleSupabaseError(error);
  }
};

export const removeFromCart = async (cartItemId: string) => {
  const { error } = await supabase.from('cart_items').delete().eq('id', cartItemId);
  if (error) handleSupabaseError(error);
};

export const checkoutCart = async (userId: string, totalAmount: number, shippingData: any) => {
  const trackingId = generateTrackingId();
  const { error } = await supabase.rpc('atomic_cart_checkout', {
    p_user_id: userId,
    p_total_amount: totalAmount,
    p_payment_method: shippingData.paymentMethod,
    p_receiver_name: shippingData.name,
    p_receiver_phone: shippingData.phone,
    p_address: shippingData.address,
    p_tracking_id: trackingId 
  });
  if (error) handleSupabaseError(error);

  // Send initial notification
  await pushNotification(userId, "Order Placed", `Order successfully logged with ID: ${trackingId}. We are packing your gadgets!`, 'success');

  return trackingId;
};

// --- Order & Tracking Logic ---

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, products(name, image_url)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) return [];
  return data.map(o => ({
    ...o,
    product_name: o.products?.name,
    product_image: o.products?.image_url
  }));
};

export const trackOrderById = async (trackingId: string): Promise<Order | null> => {
    if (!trackingId) return null;
    const { data, error } = await supabase
        .from('orders')
        .select('*, products(name, image_url)')
        .eq('tracking_number', trackingId)
        .single();
    
    if (error || !data) return null;
    return {
        ...data,
        product_name: data.products?.name,
        product_image: data.products?.image_url
    };
};

export const userConfirmDelivery = async (orderId: string) => {
  const { error } = await supabase.from('orders').update({ 
    status: OrderStatus.COMPLETED,
    updated_at: Date.now() 
  }).eq('id', orderId);
  if (error) handleSupabaseError(error);
};

// --- Authentication ---

export const loginUser = async (phone: string, password: string): Promise<User> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('phone', phone)
    .eq('password', password)
    .single();
    
  if (error || !data) throw new Error('Invalid phone or password');
  
  const user: User = {
    ...data,
    registeredAt: data.registered_at,
    verificationCode: data.verification_code,
    isAdmin: data.is_admin,
    withdrawalAccount: data.withdrawal_account,
    invitedBy: data.invited_by
  };
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
};

export const registerUser = async (phone: string, password: string, invitedBy: string = '', bonus: number = 0): Promise<User> => {
  const { data: existing } = await supabase.from('users').select('id').eq('phone', phone).single();
  if (existing) throw new Error('Phone number already in use');

  const newUser = {
    id: Math.random().toString(36).substring(2, 11),
    phone,
    password,
    balance: bonus,
    verification_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
    is_admin: phone === '076000000', 
    registered_at: Date.now(),
    invited_by: invitedBy.trim() === '' ? null : invitedBy.trim()
  };

  const { data, error } = await supabase.from('users').insert(newUser).select().single();
  if (error) handleSupabaseError(error);

  const user: User = {
    ...data,
    registeredAt: data.registered_at,
    verificationCode: data.verification_code,
    isAdmin: data.is_admin,
    invitedBy: data.invited_by
  };
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
};

// --- Wallet & Transactions ---

export const getTransactions = async (userId?: string): Promise<Transaction[]> => {
  let query = supabase.from('transactions').select('*');
  if (userId) query = query.eq('user_id', userId);
  const { data, error } = await query.order('date', { ascending: false });
  if (error) return [];
  return data.map(t => ({
    ...t,
    userId: t.user_id,
    userPhone: t.user_phone,
    referenceId: t.reference_id
  }));
};

export const createDeposit = async (userId: string, amount: number, referenceId: string) => {
  const { data: user } = await supabase.from('users').select('phone').eq('id', userId).single();
  const { error } = await supabase.from('transactions').insert({
    id: 'DEP-' + Date.now(),
    user_id: userId,
    user_phone: user?.phone || 'Unknown',
    type: TransactionType.DEPOSIT,
    amount,
    status: TransactionStatus.PENDING,
    date: Date.now(),
    reference_id: referenceId,
    method: 'Payment'
  });
  if (error) handleSupabaseError(error);
};

export const createWithdrawal = async (userId: string, amount: number, details: string) => {
  const { data: user } = await supabase.from('users').select('phone').eq('id', userId).single();
  const { error } = await supabase.from('transactions').insert({
    id: 'WTH-' + Date.now(),
    user_id: userId,
    user_phone: user?.phone || 'Unknown',
    type: TransactionType.WITHDRAWAL,
    amount,
    status: TransactionStatus.PENDING,
    date: Date.now(),
    details,
    method: 'Withdrawal'
  });
  if (error) handleSupabaseError(error);
  
  const { data: userData } = await supabase.from('users').select('balance').eq('id', userId).single();
  if (userData) {
    await supabase.from('users').update({ balance: userData.balance - amount }).eq('id', userId);
  }
};

export const getNotifications = async (userId: string): Promise<AppNotification[]> => {
  const { data, error } = await supabase.from('notifications').select('*').eq('user_id', userId).order('date', { ascending: false });
  if (error) return [];
  return data.map(n => ({ ...n, userId: n.user_id }));
};

export const markNotificationRead = async (id: string) => {
  await supabase.from('notifications').update({ read: true }).eq('id', id);
};

export const updateUserBalance = async (userId: string, newBalance: number): Promise<void> => {
    await supabase.from('users').update({ balance: newBalance }).eq('id', userId);
};

export const updateWithdrawalAccount = async (userId: string, account: string) => {
  const { error } = await supabase.from('users').update({ withdrawal_account: account }).eq('id', userId);
  if (error) handleSupabaseError(error);
};

export const changePassword = async (userId: string, oldPass: string, newPass: string) => {
    const { data: user, error: fetchErr } = await supabase.from('users').select('password').eq('id', userId).single();
    if (fetchErr) handleSupabaseError(fetchErr);
    if (user.password !== oldPass) throw new Error("Current password is wrong");

    const { error: updateErr } = await supabase.from('users').update({ password: newPass }).eq('id', userId);
    if (updateErr) handleSupabaseError(updateErr);
};

// --- Admin Operations ---

export const getAllOrders = async (): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, products(name, image_url), users(phone)')
    .order('created_at', { ascending: false });
    
  if (error) return [];
  return data;
};

export const adminUpdateOrderStatus = async (orderId: string, status: OrderStatus, tracking?: string) => {
  // 1. Get the order details to find the user_id
  const { data: orderData } = await supabase.from('orders').select('user_id, products(name)').eq('id', orderId).single();
  
  const { error } = await supabase.from('orders').update({ 
    status, 
    tracking_number: tracking,
    updated_at: Date.now() 
  }).eq('id', orderId);
  
  if (error) handleSupabaseError(error);

  // 2. Automatically push a notification to the user
  if (orderData) {
      const prodName = (orderData.products as any)?.name || "Gadget";
      await pushNotification(
          orderData.user_id, 
          "Order Update", 
          `Your order for ${prodName} status is now: ${status}. Tracking: ${tracking || 'N/A'}`,
          status === OrderStatus.DELIVERED ? 'success' : 'info'
      );
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase.from('users').select('*');
  if (error) return [];
  return data.map(u => ({
    ...u,
    registeredAt: u.registered_at,
    verificationCode: u.verification_code,
    isAdmin: u.is_admin,
    withdrawalAccount: u.withdrawal_account
  }));
};

export const adminApproveDeposit = async (txId: string) => {
  const { data: tx } = await supabase.from('transactions').select('*').eq('id', txId).single();
  if (!tx || tx.status !== TransactionStatus.PENDING) return;
  const { error: txErr } = await supabase.from('transactions').update({ status: TransactionStatus.COMPLETED }).eq('id', txId);
  if (txErr) handleSupabaseError(txErr);
  const { data: user } = await supabase.from('users').select('balance').eq('id', tx.user_id).single();
  if (user) {
    await supabase.from('users').update({ balance: user.balance + tx.amount }).eq('id', tx.user_id);
    await pushNotification(tx.user_id, "Deposit Approved", `SLE ${tx.amount} has been added to your vault.`, 'success');
  }
};

export const adminApproveWithdrawal = async (txId: string) => {
  const { data: tx } = await supabase.from('transactions').select('*').eq('id', txId).single();
  const { error } = await supabase.from('transactions').update({ status: TransactionStatus.COMPLETED }).eq('id', txId);
  if (error) handleSupabaseError(error);
  if (tx) await pushNotification(tx.user_id, "Withdrawal Success", `Your extraction of SLE ${tx.amount} has been processed.`, 'success');
};

export const adminRejectTransaction = async (txId: string) => {
  const { data: tx } = await supabase.from('transactions').select('*').eq('id', txId).single();
  if (!tx || tx.status !== TransactionStatus.PENDING) return;

  const { error: txErr } = await supabase.from('transactions').update({ status: TransactionStatus.REJECTED }).eq('id', txId);
  if (txErr) handleSupabaseError(txErr);
  
  if (tx.type === TransactionType.WITHDRAWAL) {
    const { data: user } = await supabase.from('users').select('balance').eq('id', tx.user_id).single();
    if (user) {
      await supabase.from('users').update({ balance: user.balance + tx.amount }).eq('id', tx.user_id);
      await pushNotification(tx.user_id, "Withdrawal Rejected", `Your extraction of SLE ${tx.amount} failed. Funds returned to vault.`, 'error');
    }
  } else {
    await pushNotification(tx.user_id, "Deposit Rejected", `Your deposit request for SLE ${tx.amount} was rejected. Please contact support.`, 'error');
  }
};

export const adminCreateProduct = async (product: Partial<Product>) => {
  const payload = {
    ...product,
    image_url: product.image_url || (product.images && product.images.length > 0 ? product.images[0] : ''),
    created_at: Date.now(),
    is_active: true
  };

  const { error } = await supabase.from('products').insert(payload);
  if (error) handleSupabaseError(error);

  // Broadcast to current admin to show it worked
  const user = getCurrentUser();
  if (user) {
      await pushNotification(user.id, "Product Published", `System Node: ${product.name} is now live in the global catalog.`, 'info');
  }
};

export const adminUpdateProduct = async (product: Partial<Product>) => {
    const { error } = await supabase.from('products').update(product).eq('id', product.id);
    if (error) handleSupabaseError(error);
};

export const uploadProductImage = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`; 

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('gadget-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (uploadError) {
    handleSupabaseError(uploadError);
  }

  const { data } = supabase.storage
    .from('gadget-images')
    .getPublicUrl(filePath);

  return data.publicUrl;
};

// --- Earnings, Staking, Bonds, Epochs ---
export const getAllProducts = async (userId: string): Promise<UserProduct[]> => {
    const { data, error } = await supabase.from('user_products').select('*').eq('user_id', userId);
    if (error) return [];
    return data.map(p => ({
        ...p,
        userId: p.user_id,
        vipName: p.vip_name,
        dailyRate: p.daily_rate,
        expiryDate: p.expiry_date,
        lastRewardDate: p.last_reward_date
    }));
};

export const processAutomaticEarnings = async () => {
    const { data: users, error } = await supabase.from('users').select('*');
    if (error) return;
};

export const getStakingPools = async (): Promise<StakingPool[]> => {
    const { data, error } = await supabase.from('staking_pools').select('*');
    if (error) return [];
    return data;
};

export const injectPoolLiquidity = async (userId: string, poolId: string, amount: number) => {
    const { error } = await supabase.from('user_stakes').insert({
        user_id: userId,
        pool_id: poolId,
        amount,
        staked_at: Date.now()
    });
    if (error) handleSupabaseError(error);
    
    const { data: pool } = await supabase.from('staking_pools').select('currentLiquidity').eq('id', poolId).single();
    if (pool) {
        await supabase.from('staking_pools').update({ currentLiquidity: pool.currentLiquidity + amount }).eq('id', poolId);
    }
    await pushNotification(userId, "Pool Injection", `Liquidity Sync: Successfully added SLE ${amount} to pool cluster.`, 'success');
};

export const getUserStakes = async (userId: string): Promise<UserStake[]> => {
    const { data, error } = await supabase.from('user_stakes').select('*').eq('user_id', userId);
    if (error) return [];
    return data.map(s => ({
        ...s,
        userId: s.user_id,
        poolId: s.pool_id,
        stakedAt: s.staked_at
    }));
};

export const getBondTemplates = async (): Promise<BondTemplate[]> => {
    const { data, error } = await supabase.from('bond_templates').select('*');
    if (error) return [];
    return data;
};

export const purchaseBond = async (userId: string, bondId: string, amount: number) => {
    const { data: template } = await supabase.from('bond_templates').select('*').eq('id', bondId).single();
    if (!template) throw new Error("Template not found");

    const endDate = Date.now() + (template.durationDays * 24 * 60 * 60 * 1000);
    const totalReturn = amount + (amount * template.interestRatePercent / 100);

    const { error } = await supabase.from('user_bonds').insert({
        user_id: userId,
        bond_id: bondId,
        bond_name: template.name,
        amount,
        total_return: totalReturn,
        start_date: Date.now(),
        end_date: endDate,
        status: 'ACTIVE'
    });
    if (error) handleSupabaseError(error);
    await pushNotification(userId, "Bond Activation", `Hardware Lease Secured. Target maturity return: SLE ${totalReturn}.`, 'success');
};

export const getUserBonds = async (userId: string): Promise<UserBond[]> => {
    const { data, error } = await supabase.from('user_bonds').select('*').eq('user_id', userId);
    if (error) return [];
    return data.map(b => ({
        ...b,
        userId: b.user_id,
        bondId: b.bond_id,
        bondName: b.bond_name,
        totalReturn: b.total_return,
        startDate: b.start_date,
        endDate: b.end_date
    }));
};

export const getTrainingEpochs = async (): Promise<TrainingEpoch[]> => {
    const { data, error } = await supabase.from('training_epochs').select('*');
    if (error) return [];
    return data;
};

export const investInEpoch = async (userId: string, epochId: string, amount: number) => {
    const { error } = await supabase.from('user_epoch_investments').insert({
        user_id: userId,
        epoch_id: epochId,
        amount,
        invested_at: Date.now()
    });
    if (error) handleSupabaseError(error);
    await pushNotification(userId, "Training Epoch Active", `Neural Training initiated for plan ${epochId}.`, 'info');
};

export const getUserEpochInvestments = async (userId: string): Promise<UserEpochInvestment[]> => {
    const { data, error } = await supabase.from('user_epoch_investments').select('*').eq('user_id', userId);
    if (error) return [];
    return data.map(i => ({
        ...i,
        userId: i.user_id,
        epochId: i.epoch_id,
        investedAt: i.invested_at
    }));
};
