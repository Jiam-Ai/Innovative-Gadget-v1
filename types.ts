
// Transaction types for tracking financial operations
export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  PURCHASE = 'PURCHASE',
  REFUND = 'REFUND',
  // Added missing transaction types
  EARNING = 'EARNING',
  REFERRAL = 'REFERRAL',
}

// Status of financial transactions
export enum TransactionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
}

// Status of e-commerce orders
export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
}

// User account information
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
}

// Product catalog item
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
  created_at: number;
}

// Shopping cart item
export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  product?: Product;
}

// Customer order details
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

// Financial transaction record
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

// In-app notification
export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  date: number;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

// Added missing VIP Package interface
export interface VipPackage {
  id: number;
  name: string;
  price: number;
  dailyRate: number;
  duration: number;
  image: string;
}

// Added missing Staking Pool interfaces
export interface StakingPool {
  id: string;
  name: string;
  targetLiquidity: number;
  currentLiquidity: number;
  minEntry: number;
  estimatedApy: number;
  status: 'FILLING' | 'ACTIVE' | 'COMPLETED';
  participants: number;
  tier: 'ALPHA' | 'SIGMA' | 'OMEGA';
}

export interface UserStake {
  id: string;
  userId: string;
  poolId: string;
  amount: number;
  stakedAt: number;
}

// Added missing User Product interface for earnings tracking
export interface UserProduct {
  id: string;
  userId: string;
  vipName: string;
  dailyRate: number;
  expiryDate: number;
  lastRewardDate: number;
}

// Added missing Bond interfaces
export interface BondTemplate {
  id: string;
  name: string;
  description: string;
  durationDays: number;
  interestRatePercent: number;
  minInvestment: number;
  tierLabel: string;
}

export interface UserBond {
  id: string;
  userId: string;
  bondId: string;
  bondName: string;
  amount: number;
  totalReturn: number;
  startDate: number;
  endDate: number;
  status: 'ACTIVE' | 'COMPLETED';
}

// Added missing Epoch interfaces
export interface TrainingEpoch {
  id: string;
  name: string;
  minInvestment: number;
  rewardMultiplier: number;
  currentFilled: number;
  totalTarget: number;
}

export interface UserEpochInvestment {
  id: string;
  userId: string;
  epochId: string;
  amount: number;
  investedAt: number;
}
