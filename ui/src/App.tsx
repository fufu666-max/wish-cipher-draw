import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import LotteriesPage from "./pages/LotteriesPage";
import DashboardPage from "./pages/DashboardPage";
import WinnersPage from "./pages/WinnersPage";
import { LotteryProvider } from "./context/LotteryContext";
import { WalletProvider } from "./context/WalletContext";

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-950 bg-mesh flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full border-4 border-primary-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-500 animate-spin"></div>
            <div
              className="absolute inset-2 rounded-full border-4 border-transparent border-t-accent-500 animate-spin"
              style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
            ></div>
          </div>
          <h1 className="text-2xl font-bold gradient-text">Wish Cipher Draw</h1>
          <p className="text-dark-400 mt-2">Loading encrypted lottery...</p>
        </div>
      </div>
    );
  }

  return (
    <WalletProvider>
      <LotteryProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/lotteries" element={<LotteriesPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/winners" element={<WinnersPage />} />
          </Routes>
        </Layout>
      </LotteryProvider>
    </WalletProvider>
  );
}

export default App;
