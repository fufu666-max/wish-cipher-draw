import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Sparkles, Star } from 'lucide-react';
import { useLottery, Lottery } from '../context/LotteryContext';

interface DrawWinnerModalProps {
  open: boolean;
  onClose: () => void;
  lottery: Lottery | null;
}

export default function DrawWinnerModal({ open, onClose, lottery }: DrawWinnerModalProps) {
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<'confirm' | 'drawing' | 'complete'>('confirm');
  const [winner, setWinner] = useState<string | null>(null);
  const [error, setError] = useState('');
  const { drawWinner, refreshLotteries } = useLottery();

  useEffect(() => {
    if (!open) {
      setStage('confirm');
      setWinner(null);
      setError('');
    }
  }, [open]);

  const handleDraw = async () => {
    if (!lottery) return;

    setLoading(true);
    setStage('drawing');
    setError('');

    try {
      await drawWinner(lottery.id);
      await refreshLotteries();
      
      setStage('complete');
      setWinner(lottery.winner || 'Winner determined!');
    } catch (err) {
      console.error('Draw failed:', err);
      setError('Failed to draw winner. Please try again.');
      setStage('confirm');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && lottery && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm" />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="relative w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card border-yellow-500/30 overflow-hidden">
              {stage === 'drawing' && (
                <div className="absolute inset-0 overflow-hidden">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ y: -20, x: Math.random() * 400, opacity: 0 }}
                      animate={{
                        y: 500,
                        opacity: [0, 1, 1, 0],
                        rotate: Math.random() * 360,
                      }}
                      transition={{
                        duration: 2,
                        delay: Math.random() * 2,
                        repeat: Infinity,
                      }}
                      className="absolute w-2 h-2 bg-yellow-400"
                      style={{ left: `${Math.random() * 100}%` }}
                    />
                  ))}
                </div>
              )}

              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Draw Winner</h2>
                      <p className="text-sm text-dark-400">{lottery.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    disabled={loading}
                    className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-dark-400" />
                  </button>
                </div>

                {stage === 'confirm' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                      <div className="flex items-start space-x-3">
                        <Sparkles className="w-5 h-5 text-yellow-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-yellow-300 font-medium">
                            Ready to draw the winner!
                          </p>
                          <p className="text-xs text-dark-400 mt-1">
                            This action will randomly select a winner from {lottery.participantCount} participants
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-dark-800/50 rounded-xl text-center">
                        <div className="text-2xl font-bold text-white">{lottery.participantCount}</div>
                        <div className="text-xs text-dark-400">Participants</div>
                      </div>
                      <div className="p-4 bg-dark-800/50 rounded-xl text-center">
                        <div className="text-2xl font-bold text-white">{lottery.maxParticipants}</div>
                        <div className="text-xs text-dark-400">Max Capacity</div>
                      </div>
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm"
                      >
                        {error}
                      </motion.div>
                    )}

                    <button
                      onClick={handleDraw}
                      disabled={loading}
                      className="w-full btn-primary flex items-center justify-center space-x-2 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500"
                    >
                      <Trophy className="w-5 h-5" />
                      <span>Draw Winner</span>
                    </button>
                  </motion.div>
                )}

                {stage === 'drawing' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-12 text-center"
                  >
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 360],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center"
                    >
                      <Trophy className="w-12 h-12 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-white mb-2">Drawing Winner...</h3>
                    <p className="text-dark-400">Please wait while we select the lucky winner</p>
                    <div className="flex justify-center mt-4 space-x-1">
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{ y: [0, -10, 0] }}
                          transition={{
                            duration: 0.5,
                            delay: i * 0.1,
                            repeat: Infinity,
                          }}
                          className="w-2 h-2 bg-yellow-400 rounded-full"
                        />
                      ))}
                    </div>
                  </motion.div>
                )}

                {stage === 'complete' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-8 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 10 }}
                      className="relative inline-block mb-6"
                    >
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                        <Trophy className="w-10 h-10 text-white" />
                      </div>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="absolute -top-1 -right-1"
                      >
                        <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                      </motion.div>
                    </motion.div>

                    <h3 className="text-xl font-bold text-white mb-2">Winner Selected!</h3>
                    <p className="text-dark-400 mb-6">
                      The winner has been determined on-chain
                    </p>

                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                      <div className="text-xs text-dark-400 mb-1">Winner Address</div>
                      <div className="font-mono text-sm text-green-400 break-all">
                        {winner}
                      </div>
                    </div>

                    <button
                      onClick={handleClose}
                      className="mt-6 btn-secondary"
                    >
                      Close
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
