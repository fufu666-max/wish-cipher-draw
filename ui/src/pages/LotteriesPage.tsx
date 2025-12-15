import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, RefreshCw, Users, Clock, CheckCircle, XCircle, Ticket, Search } from 'lucide-react';
import { useLottery, Lottery } from '../context/LotteryContext';
import { useWallet } from '../context/WalletContext';
import CreateLotteryModal from '../components/CreateLotteryModal';
import RegisterModal from '../components/RegisterModal';
import DrawWinnerModal from '../components/DrawWinnerModal';

export default function LotteriesPage() {
  const { lotteries, loading, refreshLotteries } = useLottery();
  const { isConnected, address } = useWallet();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [drawModalOpen, setDrawModalOpen] = useState(false);
  const [selectedLottery, setSelectedLottery] = useState<Lottery | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLotteries = lotteries.filter((lottery) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'active' && lottery.isActive) ||
      (filter === 'completed' && lottery.isDrawn);
    const matchesSearch = lottery.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleRegister = (lottery: Lottery) => {
    setSelectedLottery(lottery);
    setRegisterModalOpen(true);
  };

  const handleDraw = (lottery: Lottery) => {
    setSelectedLottery(lottery);
    setDrawModalOpen(true);
  };

  const getStatusBadge = (lottery: Lottery) => {
    if (lottery.isDrawn) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
          <CheckCircle className="w-3 h-3 mr-1" />
          Completed
        </span>
      );
    }
    if (lottery.isActive) {
      if (lottery.participantCount >= lottery.maxParticipants) {
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
            <Clock className="w-3 h-3 mr-1" />
            Ready to Draw
          </span>
        );
      }
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-500/20 text-primary-400 border border-primary-500/30">
          <Ticket className="w-3 h-3 mr-1" />
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-dark-600/50 text-dark-400 border border-dark-500/30">
        <XCircle className="w-3 h-3 mr-1" />
        Inactive
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Lotteries</h1>
          <p className="text-dark-400">Browse and participate in encrypted lotteries</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <button
            onClick={() => refreshLotteries()}
            disabled={loading}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          {isConnected && (
            <button
              onClick={() => setCreateModalOpen(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Lottery</span>
            </button>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col md:flex-row gap-4 mb-8"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
          <input
            type="text"
            placeholder="Search lotteries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="flex space-x-2">
          {(['all', 'active', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                filter === f
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>

      {!isConnected ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card text-center py-16"
        >
          <Ticket className="w-16 h-16 text-dark-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h3>
          <p className="text-dark-400">Please connect your wallet to view and participate in lotteries</p>
        </motion.div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-6 bg-dark-700 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-dark-700 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-dark-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : filteredLotteries.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card text-center py-16"
        >
          <Ticket className="w-16 h-16 text-dark-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Lotteries Found</h3>
          <p className="text-dark-400 mb-6">
            {searchQuery ? 'Try a different search term' : 'Be the first to create a lottery!'}
          </p>
          {!searchQuery && (
            <button onClick={() => setCreateModalOpen(true)} className="btn-primary">
              Create First Lottery
            </button>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredLotteries.map((lottery, index) => (
              <motion.div
                key={lottery.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className="card-glow group"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white group-hover:text-primary-400 transition-colors">
                    {lottery.name}
                  </h3>
                  {getStatusBadge(lottery)}
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-dark-400">Participants</span>
                    <span className="text-white font-medium">
                      {lottery.participantCount} / {lottery.maxParticipants}
                    </span>
                  </div>
                  <div className="w-full bg-dark-700 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(lottery.participantCount / lottery.maxParticipants) * 100}%` }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                    />
                  </div>
                  <div className="flex items-center text-sm text-dark-400">
                    <Users className="w-4 h-4 mr-2" />
                    <span className="truncate">Creator: {lottery.creator.slice(0, 6)}...{lottery.creator.slice(-4)}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  {lottery.isActive && lottery.participantCount < lottery.maxParticipants && (
                    <button
                      onClick={() => handleRegister(lottery)}
                      className="flex-1 btn-primary text-sm py-2"
                    >
                      Register
                    </button>
                  )}
                  {lottery.isActive &&
                    lottery.participantCount >= lottery.maxParticipants &&
                    lottery.creator.toLowerCase() === address?.toLowerCase() && (
                      <button
                        onClick={() => handleDraw(lottery)}
                        className="flex-1 btn-primary text-sm py-2"
                      >
                        Draw Winner
                      </button>
                    )}
                  {lottery.isDrawn && (
                    <div className="flex-1 text-center py-2 text-green-400 text-sm font-medium">
                      Winner: {lottery.winner.slice(0, 6)}...{lottery.winner.slice(-4)}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <CreateLotteryModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} />
      <RegisterModal
        open={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        lottery={selectedLottery}
      />
      <DrawWinnerModal
        open={drawModalOpen}
        onClose={() => setDrawModalOpen(false)}
        lottery={selectedLottery}
      />
    </div>
  );
}
