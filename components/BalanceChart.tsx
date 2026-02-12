
import React, { useMemo } from 'react';
import { Transaction, TransactionType } from '../types';

interface BalanceChartProps {
  currentBalance: number;
  transactions: Transaction[];
  days?: number;
}

export const BalanceChart: React.FC<BalanceChartProps> = ({ currentBalance, transactions, days = 7 }) => {
  
  // Calculate historical balance points
  const dataPoints = useMemo(() => {
    const points: { date: string; value: number }[] = [];
    const now = new Date();
    
    // Create array of last 7 days dates
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        points.push({ date: d.toLocaleDateString('en-US', { weekday: 'short' }), value: 0 });
    }

    // "Replay" transactions backwards to find balance at start of each day
    // This is a simplified approximation for visual flair
    let runningBalance = currentBalance;
    
    // Sort transactions latest first
    const sortedTx = [...transactions].sort((a, b) => b.date - a.date);
    
    // For visual simplicity, we'll map actual balance today, and deduct/add past txs
    // to reconstruct history.
    
    const chartData = points.map((point, index) => {
        // Find txs that happened AFTER this day
        // In a real app, this logic would be more precise time-series math
        // Here we simulate randomness for the "demo" feel if no transactions, 
        // or simple math if there are.
        
        if (transactions.length === 0) {
            // Demo mode: slight random variance if no data
            return { ...point, value: currentBalance * (0.9 + (index * 0.02)) };
        }
        
        // Accurate reconstruction
        // To get balance at end of Day X, take Now and undo all txs that happened after Day X
        const dateLimit = new Date();
        dateLimit.setDate(now.getDate() - (days - 1 - index));
        dateLimit.setHours(23, 59, 59, 999);

        // Filter txs that happened AFTER this date
        const futureTxs = sortedTx.filter(t => t.date > dateLimit.getTime());
        
        let historicalBal = currentBalance;
        futureTxs.forEach(tx => {
            if (tx.type === TransactionType.DEPOSIT || tx.type === TransactionType.EARNING) {
                historicalBal -= tx.amount;
            } else if (tx.type === TransactionType.WITHDRAWAL || tx.type === TransactionType.PURCHASE) {
                historicalBal += tx.amount;
            }
        });
        
        return { ...point, value: Math.max(0, historicalBal) };
    });

    return chartData;
  }, [currentBalance, transactions, days]);

  // SVG Math
  const width = 100;
  const height = 40;
  const maxVal = Math.max(...dataPoints.map(p => p.value)) * 1.1; // Add 10% headroom
  const minVal = Math.min(...dataPoints.map(p => p.value)) * 0.9;
  
  const getX = (index: number) => (index / (dataPoints.length - 1)) * width;
  const getY = (value: number) => height - ((value - minVal) / (maxVal - minVal || 1)) * height;

  const pointsStr = dataPoints.map((p, i) => `${getX(i)},${getY(p.value)}`).join(' ');
  const areaPath = `${pointsStr} ${width},${height} 0,${height}`;

  return (
    <div className="w-full h-32 relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="0.2" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Area Fill */}
        <path d={`M ${areaPath}`} fill="url(#chartGradient)" />
        
        {/* Line */}
        <polyline 
            points={pointsStr} 
            fill="none" 
            stroke="white" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="drop-shadow-lg"
        />
        
        {/* Dots */}
        {dataPoints.map((p, i) => (
             <circle key={i} cx={getX(i)} cy={getY(p.value)} r="1.5" fill="white" className="opacity-0 hover:opacity-100 transition-opacity" />
        ))}
      </svg>
      
      {/* X Axis Labels */}
      <div className="flex justify-between mt-2 px-1">
          {dataPoints.map((p, i) => (
              <span key={i} className="text-[8px] text-white/40 font-bold uppercase">{p.date}</span>
          ))}
      </div>
    </div>
  );
};
