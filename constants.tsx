
import { VipPackage, StakingPool } from "./types.ts";

export const VIP_PACKAGES: VipPackage[] = [
  // Entry Tiers
  { id: 1, name: "Nano-Logic Sprint", price: 200, dailyRate: 45, duration: 75, image: "https://images.unsplash.com/photo-1620712943543-bcc4628c9757?w=400&q=80" },
  { id: 2, name: "Micro-Compute Hub", price: 300, dailyRate: 68, duration: 75, image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80" },
  { id: 3, name: "Vector-Core Alpha", price: 400, dailyRate: 92, duration: 75, image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&q=80" },
  { id: 4, name: "Bio-Neural Mesh", price: 500, dailyRate: 115, duration: 75, image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&q=80" },
  { id: 5, name: "Synaptic Relay", price: 600, dailyRate: 138, duration: 75, image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=80" },
  { id: 6, name: "Tensor-Flow Unit", price: 700, dailyRate: 162, duration: 75, image: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=400&q=80" },
  { id: 7, name: "Quantum-Bridge Node", price: 800, dailyRate: 185, duration: 75, image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&q=80" },
  { id: 8, name: "Logic-Gate Array", price: 900, dailyRate: 208, duration: 75, image: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=400&q=80" },
  
  // Mid Tiers
  { id: 9, name: "Quant-Vision Sprint", price: 1000, dailyRate: 240, duration: 75, image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&q=80" },
  { id: 10, name: "Cyber-Pulse Core", price: 1200, dailyRate: 288, duration: 75, image: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&q=80" },
  { id: 11, name: "Neural-Link Base", price: 1500, dailyRate: 365, duration: 75, image: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=400&q=80" },
  { id: 12, name: "Data-Matrix Prime", price: 2000, dailyRate: 490, duration: 75, image: "https://images.unsplash.com/photo-1518433278988-2956d7045f08?w=400&q=80" },
  { id: 13, name: "Cortex-Sync Grid", price: 2200, dailyRate: 540, duration: 75, image: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&q=80" },
  { id: 14, name: "Cognitive Array X", price: 2500, dailyRate: 620, duration: 75, image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&q=80" },
  
  // High Tiers
  { id: 15, name: "Deep-Mind Cluster", price: 3000, dailyRate: 750, duration: 75, image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=80" },
  { id: 16, name: "Hyper-Thread Hub", price: 4000, dailyRate: 1020, duration: 75, image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc51?w=400&q=80" },
  { id: 17, name: "Neural-Nexus Base", price: 5000, dailyRate: 1300, duration: 75, image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&q=80" },
  { id: 18, name: "Omni-Logic Grid", price: 7500, dailyRate: 2050, duration: 75, image: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=400&q=80" },
  
  // Enterprise Tiers
  { id: 19, name: "Synaptic Core Omega", price: 10000, dailyRate: 2800, duration: 75, image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&q=80" },
  { id: 20, name: "Titan-Compute Array", price: 15000, dailyRate: 4350, duration: 75, image: "https://images.unsplash.com/photo-1535375971632-155353759716?w=400&q=80" },
  { id: 21, name: "Galaxy Brain Grid", price: 20000, dailyRate: 6200, duration: 75, image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80" },
];

export const STAKING_POOLS: StakingPool[] = [
  { id: 'pool-1', name: 'Alpha-Edge Cluster', targetLiquidity: 10000, currentLiquidity: 7420, minEntry: 50, estimatedApy: 142, status: 'FILLING', participants: 128, tier: 'ALPHA' },
  { id: 'pool-2', name: 'Sigma-Core Epoch', targetLiquidity: 50000, currentLiquidity: 12500, minEntry: 500, estimatedApy: 185, status: 'FILLING', participants: 45, tier: 'SIGMA' },
  { id: 'pool-3', name: 'Omega-Zenith Mesh', targetLiquidity: 250000, currentLiquidity: 0, minEntry: 5000, estimatedApy: 240, status: 'FILLING', participants: 0, tier: 'OMEGA' },
];

export const ORANGE_MONEY_NUMBER = "078800441";
export const ORANGE_MONEY_DIAL_CODE = "#144*42#";
export const SOCIAL_LINKS = {
  WHATSAPP: "https://chat.whatsapp.com/BqABJJuJONE9JE5To4F1Gx",
  FACEBOOK: "https://facebook.com/groups/720942580673119/",
  YOUTUBE: "https://youtube.com/@quickvaultpay?si=F3Nvx8LDozKQjjj8",
};
