import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Hash, Lock, Loader2, Shield } from 'lucide-react';
import { useLottery, Lottery } from '../context/LotteryContext';
import { useWallet } from '../context/WalletContext';
import { initializeFHEVM, encryptNumber } from '../lib/fhevm';
import { getContractAddress } from '../lib/contract';

interface RegisterModalProps {
  open: boolean;
  onClose: () => void;
  lottery: Lottery | null;
}

export default function RegisterModal({ open, onClose, lottery }: RegisterModalProps) {
  const [number, setNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [encryptionStage, setEncryptionStage] = useState(0);
  const [error, setError] = useState('');
  const { registerParticipant } = useLottery();
  const { chainId } = useWallet();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const num = parseInt(number);
    if (isNaN(num) || num < 1 || num > 1000) {
      setError('Please enter a number between 1 and 1000');
      return;
    }

    if (!lottery) return;

    setLoading(true);
    try {
      setEncryptionStage(1);
      const fhevm = await initializeFHEVM(chainId || undefined);
      
      setEncryptionStage(2);
      const contractAddress = getContractAddress(chainId || undefined);
      const encrypted = await encryptNumber(fhevm, contractAddress, '', num);
      
      setEncryptionStage(3);
      await registerParticipant(lottery.id, encrypted.handles[0], encrypted.inputProof);
      
      setNumber('');
      setEncryptionStage(0);
      onClose();
    } catch (err) {
      console.error('Registration failed:', err);
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
      setEncryptionStage(0);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setNumber('');
      setError('');
      setEncryptionStage(0);
      onClose();
    }
  };

  const stages = [
    { label: 'Initializing FHE...', icon: Shield },
    { label: 'Encrypting number...', icon: Lock },
    { label: 'Submitting to blockchain...', icon: Hash },
  ];

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
            <div className="card border-green-500/30">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Register</h2>
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

              {loading && encryptionStage > 0 ? (
                <div className="py-8">
                  <div className="flex flex-col items-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="w-16 h-16 rounded-full border-4 border-primary-500/20 border-t-primary-500 mb-6"
                    />
                    <div className="space-y-4 w-full">
                      {stages.map((stage, index) => {
                        const StageIcon = stage.icon;
                        const isActive = index + 1 === encryptionStage;
                        const isComplete = index + 1 < encryptionStage;
                        
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`flex items-center space-x-3 p-3 rounded-xl ${
                              isActive
                                ? 'bg-primary-500/10 border border-primary-500/30'
                                : isComplete
                                ? 'bg-green-500/10 border border-green-500/30'
                                : 'bg-dark-800/50'
                            }`}
                          >
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                isActive
                                  ? 'bg-primary-500'
                                  : isComplete
                                  ? 'bg-green-500'
                                  : 'bg-dark-700'
                              }`}
                            >
                              {isActive ? (
                                <Loader2 className="w-4 h-4 text-white animate-spin" />
                              ) : (
                                <StageIcon className="w-4 h-4 text-white" />
                              )}
                            </div>
                            <span
                              className={`text-sm ${
                                isActive
                                  ? 'text-primary-400'
                                  : isComplete
                                  ? 'text-green-400'
                                  : 'text-dark-500'
                              }`}
                            >
                              {stage.label}
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="p-4 bg-primary-500/10 border border-primary-500/30 rounded-xl">
                    <div className="flex items-start space-x-3">
                      <Shield className="w-5 h-5 text-primary-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-primary-300 font-medium">
                          Your number will be encrypted
                        </p>
                        <p className="text-xs text-dark-400 mt-1">
                          Using FHE technology, your number stays private until the draw
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Your Lucky Number
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                      <input
                        type="number"
                        value={number}
                        onChange={(e) => setNumber(e.target.value)}
                        placeholder="Enter a number (1-1000)"
                        min={1}
                        max={1000}
                        className="input-field pl-10"
                        disabled={loading}
                      />
                    </div>
                    <p className="text-xs text-dark-500 mt-1">
                      Choose a number between 1 and 1000
                    </p>
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
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400"
                  >
                    <Lock className="w-5 h-5" />
                    <span>Encrypt & Register</span>
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
