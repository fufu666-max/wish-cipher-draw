import { useState, useEffect } from 'react';
import { CreateLotteryDialog } from '../components/CreateLotteryDialog';
import { RegisterDialog } from '../components/RegisterDialog';
import { getContract } from '../lib/contract';
import { initializeFHEVM, encryptNumber } from '../lib/fhevm';

export default function Index() {
  const [lotteries, setLotteries] = useState<any[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [selectedLottery, setSelectedLottery] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    loadLotteries();
  }, []);

  const loadLotteries = async () => {
    setLoading(true);
    try {
      const contract = await getContract();
      const count = await contract.getLotteryCount();
      const lotteryList = [];
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
            winner: info[7]
          });
        } catch (err) {
          console.warn(`Failed to load lottery ${i}:`, err);
        }
      }
      setLotteries(lotteryList);
    } catch (error) {
      console.error('Failed to load lotteries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLottery = async (name: string, maxParticipants: number) => {
    try {
      const contract = await getContract();
      const tx = await contract.createLottery(name, maxParticipants);
      await tx.wait();
      await loadLotteries();
    } catch (error) {
      console.error('Failed to create lottery:', error);
      alert('Failed to create lottery. Please try again.');
    }
  };

  const handleRegister = async (number: number) => {
    if (!selectedLottery) return;
    try {
      const fhevm = await initializeFHEVM();
      const contract = await getContract();
      const contractAddress = await contract.getAddress();
      const encrypted = await encryptNumber(fhevm, contractAddress, '', number);
      const tx = await contract.registerParticipant(selectedLottery.id, encrypted.handles[0], encrypted.inputProof);
      await tx.wait();
      await loadLotteries();
    } catch (error) {
      console.error('Failed to register:', error);
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Encrypted Number Lottery</h1>
        <button 
          onClick={() => setCreateDialogOpen(true)}
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Create Lottery
        </button>
        <div className="space-y-4">
          {lotteries.length === 0 ? (
            <p className="text-gray-500">No lotteries available. Create one to get started!</p>
          ) : (
            lotteries.map((lottery) => (
              <div key={lottery.id} className="border p-4 rounded">
                <h2 className="text-xl font-semibold">{lottery.name}</h2>
                <p>Participants: {lottery.participantCount} / {lottery.maxParticipants}</p>
                <p className="text-sm text-gray-600">
                  Status: {lottery.isActive ? 'Active' : lottery.isDrawn ? 'Drawn' : 'Inactive'}
                </p>
                {lottery.isActive && (
                  <button 
                    onClick={() => {
                      setSelectedLottery(lottery);
                      setRegisterDialogOpen(true);
                    }}
                    className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Register
                  </button>
                )}
              </div>
            ))
          )}
        </div>
        <CreateLotteryDialog 
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onCreate={handleCreateLottery}
        />
        <RegisterDialog
          open={registerDialogOpen}
          onOpenChange={setRegisterDialogOpen}
          onRegister={handleRegister}
        />
      </div>
    </div>
  );
}

