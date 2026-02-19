
export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  PURCHASE = 'PURCHASE',
  REFUND = 'REFUND',
  REFERRAL = 'REFERRAL',
  EARNING = 'EARNING'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
}

export interface User {
  id: string;
  phone: string;
  password?: string;
  balance: number;
  verificationCode: string;
  isAdmin: boolean;
  registeredAt: number;
  withdrawalAccount?: string;
  invitedBy?: string;
  avatar_url?: string;
  full_name?: string;
  bio?: string;
  member_level?: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  loyalty_points?: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  images?: string[]; 
  category: string;
  stock_quantity: number;
  is_active: boolean;
  is_trending?: boolean;
  created_at: number;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  product?: Product;
  created_at: number;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  product?: Product;
}

export interface Order {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  total_price: number;
  status: OrderStatus;
  tracking_number?: string;
  payment_method: 'BALANCE' | 'COD';
  receiver_name: string;
  receiver_phone: string;
  delivery_address: string;
  shipping_details?: string;
  created_at: number;
  updated_at: number;
  product_name?: string; 
  product_image?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  userPhone: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  date: number;
  referenceId?: string;
  method?: string;
  details?: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  read: boolean;
  date: number;
}

export interface UserProduct {
  id: string;
  userId: string;
  vipName: string;
  dailyRate: number;
  expiryDate: number;
  lastRewardDate: number;
}

export interface StakingPool {
  id: string;
  name: string;
  tier: 'ALPHA' | 'SIGMA' | 'OMEGA';
  participants: number;
  estimatedApy: number;
  currentLiquidity: number;
  targetLiquidity: number;
  minEntry: number;
}

export interface UserStake {
  id: string;
  userId: string;
  poolId: string;
  amount: number;
  stakedAt: number;
}

export interface BondTemplate {
  id: string;
  name: string;
  description: string;
  tierLabel: string;
  durationDays: number;
  interestRatePercent: number;
  minInvestment: number;
}

export interface UserBond {
  id: string;
  userId: string;
  bondName: string;
  endDate: number;
  totalReturn: number;
}

export interface TrainingEpoch {
  id: string;
  name: string;
  rewardMultiplier: number;
  minInvestment: number;
  currentFilled: number;
  totalTarget: number;
}

export interface UserEpochInvestment {
  id: string;
  userId: string;
  epochId: string;
  amount: number;
}
