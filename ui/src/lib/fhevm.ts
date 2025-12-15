// CDN 加载的全局变量是 relayerSDK
declare global {
  interface Window {
    relayerSDK: any;
    ethereum: any;
  }
}

export interface FhevmInstance {
  createEncryptedInput: (
    contractAddress: string,
    userAddress: string,
  ) => {
    add32: (value: number) => { encrypt: () => Promise<{ handles: string[]; inputProof: string }> };
  };
  generateKeypair: () => { privateKey: string; publicKey: string };
  userDecrypt: (
    handles: { handle: string; contractAddress: string }[],
    privateKey: string,
    publicKey: string,
    signature: string,
    contractAddresses: string[],
    userAddress: string,
    timestamp: string,
    ttl: string,
  ) => Promise<Record<string, bigint>>;
}

// Mock instance for local network
class MockFhevmInstance implements FhevmInstance {
  createEncryptedInput(contractAddress: string, userAddress: string) {
    return {
      add32: (value: number) => ({
        encrypt: async () => {
          // 生成一个模拟的加密值（实际上就是原始值的 bytes32 表示）
          const handle = "0x" + value.toString(16).padStart(64, "0");
          const inputProof = "0x" + "00".repeat(32);
          return { handles: [handle], inputProof };
        },
      }),
    };
  }

  generateKeypair() {
    return {
      privateKey: "0x" + "00".repeat(32),
      publicKey: "0x" + "00".repeat(32),
    };
  }

  async userDecrypt(
    handles: { handle: string; contractAddress: string }[],
    _privateKey: string,
    _publicKey: string,
    _signature: string,
    _contractAddresses: string[],
    _userAddress: string,
    _timestamp: string,
    _ttl: string,
  ): Promise<Record<string, bigint>> {
    const result: Record<string, bigint> = {};
    for (const h of handles) {
      // 从 handle 中提取原始值
      result[h.handle] = BigInt(h.handle);
    }
    return result;
  }
}

let fhevmInstance: FhevmInstance | null = null;
let isSDKInitialized = false;

export async function initializeFHEVM(chainId?: number): Promise<FhevmInstance> {
  if (!fhevmInstance) {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("window.ethereum is not available");
    }

    // 本地网络 (31337) 使用 mock 模式
    const isLocalNetwork = chainId === 31337;

    if (isLocalNetwork) {
      console.log("Using mock FHEVM for local network");
      fhevmInstance = new MockFhevmInstance();
      return fhevmInstance;
    }

    // Sepolia 或其他网络使用真实的 SDK
    const sdk = window.relayerSDK;
    if (!sdk) {
      throw new Error("relayerSDK not loaded from CDN");
    }

    console.log("relayerSDK loaded:", sdk);

    if (!isSDKInitialized) {
      await sdk.initSDK();
      isSDKInitialized = true;
    }

    const config = {
      ...sdk.SepoliaConfig,
      network: window.ethereum,
    };

    fhevmInstance = await sdk.createInstance(config);
  }

  return fhevmInstance;
}

export async function encryptNumber(
  fhevm: FhevmInstance,
  contractAddress: string,
  userAddress: string,
  number: number,
) {
  let address = userAddress;
  if (!address) {
    if (typeof window !== "undefined" && window.ethereum) {
      const { BrowserProvider } = await import("ethers");
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      address = await signer.getAddress();
    } else {
      throw new Error("User address is required");
    }
  }

  const encryptedInput = fhevm.createEncryptedInput(contractAddress, address).add32(number);

  return await encryptedInput.encrypt();
}

export async function decryptNumber(
  fhevm: FhevmInstance,
  encryptedValue: string,
  contractAddress: string,
  signer: any,
  chainId?: number,
): Promise<number> {
  try {
    if (!encryptedValue || encryptedValue === "0x0000000000000000000000000000000000000000000000000000000000000000") {
      return 0;
    }

    // 本地网络直接从 handle 解析
    if (chainId === 31337) {
      return parseInt(encryptedValue, 16);
    }

    const isSepolia = chainId === 11155111;
    if (isSepolia) {
      const keypair = fhevm.generateKeypair();
      const userAddress = await signer.getAddress();
      const result = await fhevm.userDecrypt(
        [{ handle: encryptedValue, contractAddress }],
        keypair.privateKey,
        keypair.publicKey,
        "",
        [contractAddress],
        userAddress,
        Math.floor(Date.now() / 1000).toString(),
        "10",
      );
      return Number(result[encryptedValue] || 0);
    }
    return 0;
  } catch (error: any) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
}
