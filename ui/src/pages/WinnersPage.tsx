import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles, Star, Crown, PartyPopper } from 'lucide-react';
import { useLottery, Lottery } from '../context/LotteryContext';
import { useWallet } from '../context/WalletContext';

interface Confetti {
  id: number;
  x: number;
  delay: number;
  color: string;
}

function ConfettiEffect() {
  const [confetti, setConfetti] = useState<Confetti[]>([]);

  useEffect(() => {
    const colors = ['#6366f1', '#d946ef', '#22c55e', '#f59e0b', '#ec4899'];
    const particles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 3,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setConfetti(particles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {confetti.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{ y: -20, x: `${particle.x}vw`, opacity: 1, rotate: 0 }}
          animate={{
            y: '100vh',
            rotate: 720,
            opacity: 0,
          }}
          transition={{
            duration: 4,
            delay: particle.delay,
            ease: 'linear',
            repeat: Infinity,
          }}
          className="absolute w-3 h-3"
          style={{ backgroundColor: particle.color }}
        />
      ))}
    </div>
  );
}

function WinnerRevealModal({
  lottery,
  onClose,
}: {
  lottery: Lottery | null;
  onClose: () => void;
}) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (lottery) {
      const timers = [
        setTimeout(() => setStage(1), 500),
        setTimeout(() => setStage(2), 1500),
        setTimeout(() => setStage(3), 2500),
      ];
      return () => timers.forEach(clearTimeout);
    }
  }, [lottery]);

  if (!lottery) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-dark-950/90 backdrop-blur-xl" />
        <ConfettiEffect />
        
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: 'spring', damping: 15 }}
          className="relative z-10 text-center p-12"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: stage >= 1 ? 1 : 0 }}
            transition={{ type: 'spring', damping: 10, delay: 0.2 }}
            className="mb-8"
          >
            <div className="relative inline-block">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 w-32 h-32 rounded-full bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500 blur-xl opacity-50"
              />
              <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center mx-auto animate-pulse-glow">
                <Trophy className="w-16 h-16 text-white" />
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: stage >= 2 ? 1 : 0 }}
                className="absolute -top-2 -right-2"
              >
                <Crown className="w-10 h-10 text-yellow-400" />
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: stage >= 2 ? 1 : 0, y: stage >= 2 ? 0 : 20 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-white mb-2">Winner Revealed!</h2>
            <p className="text-dark-400 mb-6">{lottery.name}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: stage >= 3 ? 1 : 0, scale: stage >= 3 ? 1 : 0.8 }}
            transition={{ type: 'spring', damping: 10 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 blur-xl opacity-30 rounded-2xl" />
            <div className="relative bg-dark-800 border border-primary-500/50 rounded-2xl p-6">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <span className="text-sm text-dark-400">Winner Address</span>
                <Sparkles className="w-5 h-5 text-yellow-400" />
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="font-mono text-xl text-white break-all"
              >
                {lottery.winner}
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: stage >= 3 ? 1 : 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8 flex justify-center space-x-2"
          >
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 1,
                  delay: i * 0.1,
                  repeat: Infinity,
                }}
              >
                <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
              </motion.div>
            ))}
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: stage >= 3 ? 1 : 0 }}
            onClick={onClose}
            className="mt-8 btn-primary"
          >
            Close
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function WinnersPage() {
  const { lotteries, loading } = useLottery();
  const { isConnected } = useWallet();
  const [selectedWinner, setSelectedWinner] = useState<Lottery | null>(null);

  const completedLotteries = lotteries.filter((l) => l.isDrawn);

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card text-center py-16"
        >
          <Trophy className="w-16 h-16 text-dark-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h3>
          <p className="text-dark-400">Please connect your wallet to view winners</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center space-x-3 mb-2">
          <Trophy className="w-8 h-8 text-yellow-400" />
          <h1 className="text-3xl font-bold text-white">Winners Hall</h1>
        </div>
        <p className="text-dark-400">Celebrate the lucky winners of completed lotteries</p>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-20 bg-dark-700 rounded mb-4"></div>
              <div className="h-4 bg-dark-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : completedLotteries.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card text-center py-16"
        >
          <PartyPopper className="w-16 h-16 text-dark-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Winners Yet</h3>
          <p className="text-dark-400">
            Winners will appear here once lotteries are completed
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {completedLotteries.map((lottery, index) => (
              <motion.div
                key={lottery.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedWinner(lottery)}
                className="card-glow cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-500/10 to-transparent rounded-bl-full" />
                
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center space-x-1">
                      {[...Array(3)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 text-yellow-400 fill-yellow-400 opacity-50 group-hover:opacity-100 transition-opacity"
                          style={{ transitionDelay: `${i * 100}ms` }}
                        />
                      ))}
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors">
                    {lottery.name}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="text-sm text-dark-400">
                      Participants: {lottery.participantCount}
                    </div>
                  </div>

                  <div className="p-3 bg-dark-900/50 rounded-xl">
                    <div className="text-xs text-dark-400 mb-1">Winner</div>
                    <div className="font-mono text-sm text-green-400 truncate">
                      {lottery.winner}
                    </div>
                  </div>

                  <div className="mt-4 text-center">
                    <span className="text-xs text-primary-400 group-hover:text-primary-300">
                      Click to reveal celebration
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <WinnerRevealModal lottery={selectedWinner} onClose={() => setSelectedWinner(null)} />
    </div>
  );
}
