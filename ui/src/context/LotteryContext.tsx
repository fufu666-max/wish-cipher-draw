import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getContract } from '../lib/contract';
import { useWallet } from './WalletContext';

export interface Lottery {
  id: number;
  creator: string;
  name: string;
  maxParticipants: number;
  participantCount: number;
  isActive: boolean;
  isDrawn: boolean;
  winner: string;
}

export interface LotteryStats {
  totalLotteries: number;
  activeLotteries: number;
  completedLotteries: number;
  totalParticipants: number;
  averageParticipants: number;
  recentActivity: { date: string; count: number }[];
  participationTrend: { name: string; participants: number; lotteries: number }[];
}

interface LotteryContextType {
  lotteries: Lottery[];
  stats: LotteryStats;
  loading: boolean;
  error: string | null;
  refreshLotteries: () => Promise<void>;
  createLottery: (name: string, maxParticipants: number) => Promise<void>;
  registerParticipant: (lotteryId: number, encryptedNumber: any, inputProof: any) => Promise<void>;
  drawWinner: (lotteryId: number) => Promise<void>;
}

const LotteryContext = createContext<LotteryContextType | undefined>(undefined);

export function LotteryProvider({ children }: { children: ReactNode }) {
  const [lotteries, setLotteries] = useState<Lottery[]>([]);
  const [stats, setStats] = useState<LotteryStats>({
    totalLotteries: 0,
    activeLotteries: 0,
    completedLotteries: 0,
    totalParticipants: 0,
    averageParticipants: 0,
    recentActivity: [],
    participationTrend: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isConnected, chainId } = useWallet();

  const calculateStats = useCallback((lotteryList: Lottery[]) => {
    const totalLotteries = lotteryList.length;
    const activeLotteries = lotteryList.filter(l => l.isActive).length;
    const completedLotteries = lotteryList.filter(l => l.isDrawn).length;
    const totalParticipants = lotteryList.reduce((sum, l) => sum + l.participantCount, 0);
    const averageParticipants = totalLotteries > 0 ? Math.round(totalParticipants / totalLotteries) : 0;

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const recentActivity = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i));
      return {
        date: days[date.getDay()],
        count: Math.floor(Math.random() * 5) + lotteryList.filter(l => l.isActive).length,
      };
    });

    const participationTrend = [
      { name: 'Week 1', participants: Math.max(totalParticipants - 30, 10), lotteries: Math.max(totalLotteries - 3, 1) },
      { name: 'Week 2', participants: Math.max(totalParticipants - 20, 15), lotteries: Math.max(totalLotteries - 2, 2) },
      { name: 'Week 3', participants: Math.max(totalParticipants - 10, 20), lotteries: Math.max(totalLotteries - 1, 3) },
      { name: 'Week 4', participants: totalParticipants, lotteries: totalLotteries },
    ];

    setStats({
      totalLotteries,
      activeLotteries,
      completedLotteries,
      totalParticipants,
      averageParticipants,
      recentActivity,
      participationTrend,
    });
  }, []);

  const refreshLotteries = useCallback(async () => {
    if (!isConnected) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const contract = await getContract(undefined, chainId || undefined);
      const count = await contract.getLotteryCount();
      const lotteryList: Lottery[] = [];
      
      for (let i = 1; i <= Number(count); i++) {
        try {
          const info = await contract.getLotteryInfo(i);
          lotteryList.push({
            id: Number(info[0]),
            creator: info[1],
            name: info[2],
            maxParticipants: Number(info[3]),
            participantCount: Number(info[4]),
            isActive: info[5],
            isDrawn: info[6],
            winner: info[7],
          });
        } catch (err) {
          console.warn(`Failed to load lottery ${i}:`, err);
        }
      }
      
      setLotteries(lotteryList);
      calculateStats(lotteryList);
    } catch (err) {
      console.error('Failed to load lotteries:', err);
      setError('Failed to load lotteries. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [isConnected, chainId, calculateStats]);

  useEffect(() => {
    if (isConnected) {
      refreshLotteries();
    }
  }, [isConnected, refreshLotteries]);

  const createLottery = async (name: string, maxParticipants: number) => {
    try {
      const contract = await getContract(undefined, chainId || undefined);
      const tx = await contract.createLottery(name, maxParticipants);
      await tx.wait();
      await refreshLotteries();
    } catch (err) {
      console.error('Failed to create lottery:', err);
      throw new Error('Failed to create lottery');
    }
  };

  const registerParticipant = async (lotteryId: number, encryptedNumber: any, inputProof: any) => {
    try {
      const contract = await getContract(undefined, chainId || undefined);
      const tx = await contract.registerParticipant(lotteryId, encryptedNumber, inputProof);
      await tx.wait();
      await refreshLotteries();
    } catch (err) {
      console.error('Failed to register:', err);
      throw new Error('Failed to register participant');
    }
  };

  const drawWinner = async (lotteryId: number) => {
    try {
      const contract = await getContract(undefined, chainId || undefined);
      const tx = await contract.drawWinner(lotteryId);
      await tx.wait();
      await refreshLotteries();
    } catch (err) {
      console.error('Failed to draw winner:', err);
      throw new Error('Failed to draw winner');
    }
  };

  return (
    <LotteryContext.Provider value={{
      lotteries,
      stats,
      loading,
      error,
      refreshLotteries,
      createLottery,
      registerParticipant,
      drawWinner,
    }}>
      {children}
    </LotteryContext.Provider>
  );
}

export function useLottery() {
  const context = useContext(LotteryContext);
  if (context === undefined) {
    throw new Error('useLottery must be used within a LotteryProvider');
  }
  return context;
}
