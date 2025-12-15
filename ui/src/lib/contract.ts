import { ethers } from "ethers";

const CONTRACT_ADDRESSES: Record<number, string> = {
  31337: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // MockLottery for local testing
  11155111: "0xAe3a33b4E9F75D697291772cc2Dd651AC9E818fb", // FHELottery on Sepolia
};

export function getContractAddress(chainId?: number): string {
  if (chainId && CONTRACT_ADDRESSES[chainId]) {
    return CONTRACT_ADDRESSES[chainId];
  }
  return CONTRACT_ADDRESSES[31337];
}

const ABI = [
  "function createLottery(string memory _name, uint256 _maxParticipants) external returns (uint256)",
  "function registerParticipant(uint256 _lotteryId, bytes32 _encryptedNumber, bytes calldata _inputProof) external",
  "function drawWinner(uint256 _lotteryId) external",
  "function getLotteryInfo(uint256 _lotteryId) external view returns (uint256, address, string memory, uint256, uint256, bool, bool, address)",
  "function getWinningNumber(uint256 _lotteryId) external view returns (bytes32)",
  "function isParticipant(uint256 _lotteryId, address _participant) external view returns (bool)",
  "function getLotteryCount() external view returns (uint256)",
  "event LotteryCreated(uint256 indexed lotteryId, address indexed creator, string name, uint256 maxParticipants)",
  "event ParticipantRegistered(uint256 indexed lotteryId, address indexed participant, bytes32 encryptedNumber)",
  "event WinnerDrawn(uint256 indexed lotteryId, bytes32 winningNumber)",
];

export async function getContract(signerOrProvider?: any, chainId?: number) {
  const address = getContractAddress(chainId);
  if (!address) throw new Error("Contract address not set");

  if (!signerOrProvider) {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      signerOrProvider = await provider.getSigner();
    } else {
      throw new Error("No signer or provider available");
    }
  }

  try {
    return new ethers.Contract(address, ABI, signerOrProvider);
  } catch (error: any) {
    throw new Error(`Failed to create contract instance: ${error.message}`);
  }
}
