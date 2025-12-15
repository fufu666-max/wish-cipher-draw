import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Lock, Sparkles, ArrowRight, Ticket, Users, Trophy } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useLottery } from '../context/LotteryContext';

const features = [
  {
    icon: Shield,
    title: 'Fully Encrypted',
    description: 'All lottery numbers are encrypted using FHE technology, ensuring complete privacy.',
  },
  {
    icon: Lock,
    title: 'Tamper-Proof',
    description: 'Smart contracts guarantee fair and transparent lottery draws on the blockchain.',
  },
  {
    icon: Sparkles,
    title: 'Instant Results',
    description: 'Winners are determined instantly through secure on-chain computation.',
  },
];

export default function HomePage() {
  const { isConnected, connect } = useWallet();
  const { stats } = useLottery();

  return (
    <div className="relative overflow-hidden">
      <section className="relative py-20 lg:py-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 mb-8"
            >
              <Sparkles className="w-4 h-4 text-primary-400 mr-2" />
              <span className="text-sm text-primary-300">Powered by Zama FHE</span>
            </motion.div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              <span className="gradient-text">Privacy-First</span>
              <br />
              <span className="text-white">Encrypted Lottery</span>
            </h1>

            <p className="text-lg md:text-xl text-dark-300 max-w-2xl mx-auto mb-10">
              Experience the future of fair and transparent lotteries with fully homomorphic encryption.
              Your numbers stay private, results stay verifiable.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isConnected ? (
                <Link to="/lotteries" className="btn-primary flex items-center space-x-2">
                  <Ticket className="w-5 h-5" />
                  <span>Browse Lotteries</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <button onClick={connect} className="btn-primary flex items-center space-x-2">
                  <span>Connect to Start</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
              <Link to="/dashboard" className="btn-secondary flex items-center space-x-2">
                <span>View Dashboard</span>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              { icon: Ticket, label: 'Total Lotteries', value: stats.totalLotteries },
              { icon: Users, label: 'Total Participants', value: stats.totalParticipants },
              { icon: Trophy, label: 'Winners Drawn', value: stats.completedLotteries },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="card-glow text-center"
              >
                <stat.icon className="w-8 h-8 text-primary-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-dark-400">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Choose <span className="gradient-text">Wish Cipher Draw</span>?
            </h2>
            <p className="text-dark-400 max-w-2xl mx-auto">
              Built on cutting-edge FHE technology for maximum privacy and fairness
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="card-glow group"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-7 h-7 text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-dark-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="card bg-gradient-to-r from-primary-900/50 to-accent-900/50 border-primary-500/30 text-center py-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Try Your Luck?
            </h2>
            <p className="text-dark-300 max-w-xl mx-auto mb-8">
              Join the most secure and private lottery system on the blockchain.
              Your encrypted number could be the winning one!
            </p>
            <Link to="/lotteries" className="btn-primary inline-flex items-center space-x-2">
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
