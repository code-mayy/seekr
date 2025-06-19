import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '@/hooks/useWeb3';
import { toast } from 'sonner';

// Contract ABI (Application Binary Interface)
const ESCROW_ABI = [
  "function createEscrow(address seller, string memory itemDescription, uint256 deliveryDays) external payable returns (uint256)",
  "function confirmDelivery(uint256 escrowId) external",
  "function requestRefund(uint256 escrowId) external",
  "function raiseDispute(uint256 escrowId) external",
  "function getEscrow(uint256 escrowId) external view returns (tuple(address buyer, address seller, uint256 amount, uint8 status, uint256 createdAt, uint256 deliveryDeadline, string itemDescription, bool buyerConfirmed, bool sellerConfirmed))",
  "function getUserEscrows(address user) external view returns (uint256[])",
  "function isDeliveryOverdue(uint256 escrowId) external view returns (bool)",
  "function nextEscrowId() external view returns (uint256)",
  "function platformFee() external view returns (uint256)",
  "event EscrowCreated(uint256 indexed escrowId, address indexed buyer, address indexed seller, uint256 amount, string itemDescription)",
  "event DeliveryConfirmed(uint256 indexed escrowId, address indexed confirmer)",
  "event EscrowCompleted(uint256 indexed escrowId, uint256 sellerAmount, uint256 platformFeeAmount)",
  "event EscrowRefunded(uint256 indexed escrowId, uint256 refundAmount)",
  "event DisputeRaised(uint256 indexed escrowId, address indexed raiser)"
];

// Placeholder contract address - MUST be updated with actual deployed contract address
const ESCROW_CONTRACT_ADDRESS = null; // Set to null to prevent invalid contract calls

export enum EscrowStatus {
  PENDING = 0,
  DELIVERED = 1,
  REFUNDED = 2,
  DISPUTED = 3
}

export interface EscrowTransaction {
  buyer: string;
  seller: string;
  amount: bigint;
  status: EscrowStatus;
  createdAt: bigint;
  deliveryDeadline: bigint;
  itemDescription: string;
  buyerConfirmed: boolean;
  sellerConfirmed: boolean;
}

export interface EscrowWithId extends EscrowTransaction {
  id: number;
  isOverdue: boolean;
}

export function useEscrow() {
  const { signer, account, isConnected } = useWeb3();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [userEscrows, setUserEscrows] = useState<EscrowWithId[]>([]);
  const [loading, setLoading] = useState(false);
  const [platformFee, setPlatformFee] = useState<number>(2.5); // Default platform fee
  const [contractDeployed, setContractDeployed] = useState(false);

  useEffect(() => {
    if (signer && isConnected && ESCROW_CONTRACT_ADDRESS) {
      const escrowContract = new ethers.Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, signer);
      setContract(escrowContract);
      setContractDeployed(true);
      loadPlatformFee(escrowContract);
    } else {
      setContract(null);
      setContractDeployed(false);
      if (isConnected && !ESCROW_CONTRACT_ADDRESS) {
        toast.warning('Smart contract not deployed. Please deploy the Escrow contract first.');
      }
    }
  }, [signer, isConnected]);

  useEffect(() => {
    if (contract && account && contractDeployed) {
      loadUserEscrows();
    }
  }, [contract, account, contractDeployed]);

  const loadPlatformFee = async (contractInstance: ethers.Contract) => {
    try {
      const fee = await contractInstance.platformFee();
      setPlatformFee(Number(fee) / 100); // Convert from basis points to percentage
    } catch (error) {
      console.error('Error loading platform fee:', error);
      // Keep default platform fee if contract call fails
      toast.info('Using default platform fee of 2.5%');
    }
  };

  const loadUserEscrows = async () => {
    if (!contract || !account || !contractDeployed) return;

    setLoading(true);
    try {
      const escrowIds = await contract.getUserEscrows(account);
      const escrows: EscrowWithId[] = [];

      for (const id of escrowIds) {
        const escrowData = await contract.getEscrow(id);
        const isOverdue = await contract.isDeliveryOverdue(id);
        
        escrows.push({
          id: Number(id),
          buyer: escrowData[0],
          seller: escrowData[1],
          amount: escrowData[2],
          status: escrowData[3],
          createdAt: escrowData[4],
          deliveryDeadline: escrowData[5],
          itemDescription: escrowData[6],
          buyerConfirmed: escrowData[7],
          sellerConfirmed: escrowData[8],
          isOverdue
        });
      }

      setUserEscrows(escrows.sort((a, b) => Number(b.createdAt) - Number(a.createdAt)));
    } catch (error) {
      console.error('Error loading user escrows:', error);
      toast.error('Failed to load escrow transactions.');
    } finally {
      setLoading(false);
    }
  };

  const createEscrow = async (
    sellerAddress: string,
    amount: string,
    itemDescription: string,
    deliveryDays: number
  ): Promise<number | null> => {
    if (!contract || !contractDeployed) {
      toast.error('Smart contract not available. Please deploy the Escrow contract first.');
      return null;
    }

    try {
      const amountWei = ethers.parseEther(amount);
      
      toast.info('Creating escrow transaction...');
      const tx = await contract.createEscrow(
        sellerAddress,
        itemDescription,
        deliveryDays,
        { value: amountWei }
      );

      toast.info('Transaction submitted. Waiting for confirmation...');
      const receipt = await tx.wait();

      // Find the EscrowCreated event to get the escrow ID
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed?.name === 'EscrowCreated';
        } catch {
          return false;
        }
      });

      if (event) {
        const parsedEvent = contract.interface.parseLog(event);
        const escrowId = Number(parsedEvent?.args[0]);
        
        toast.success(`Escrow created successfully! ID: ${escrowId}`);
        await loadUserEscrows(); // Refresh the list
        return escrowId;
      }

      toast.success('Escrow created successfully!');
      await loadUserEscrows();
      return null;
    } catch (error: any) {
      console.error('Error creating escrow:', error);
      
      if (error.code === 'ACTION_REJECTED') {
        toast.error('Transaction rejected by user.');
      } else if (error.message?.includes('insufficient funds')) {
        toast.error('Insufficient funds for this transaction.');
      } else {
        toast.error('Failed to create escrow. Please try again.');
      }
      return null;
    }
  };

  const confirmDelivery = async (escrowId: number): Promise<boolean> => {
    if (!contract || !contractDeployed) {
      toast.error('Smart contract not available.');
      return false;
    }

    try {
      toast.info('Confirming delivery...');
      const tx = await contract.confirmDelivery(escrowId);
      
      toast.info('Transaction submitted. Waiting for confirmation...');
      await tx.wait();
      
      toast.success('Delivery confirmed successfully!');
      await loadUserEscrows();
      return true;
    } catch (error: any) {
      console.error('Error confirming delivery:', error);
      
      if (error.code === 'ACTION_REJECTED') {
        toast.error('Transaction rejected by user.');
      } else {
        toast.error('Failed to confirm delivery. Please try again.');
      }
      return false;
    }
  };

  const requestRefund = async (escrowId: number): Promise<boolean> => {
    if (!contract || !contractDeployed) {
      toast.error('Smart contract not available.');
      return false;
    }

    try {
      toast.info('Requesting refund...');
      const tx = await contract.requestRefund(escrowId);
      
      toast.info('Transaction submitted. Waiting for confirmation...');
      await tx.wait();
      
      toast.success('Refund processed successfully!');
      await loadUserEscrows();
      return true;
    } catch (error: any) {
      console.error('Error requesting refund:', error);
      
      if (error.code === 'ACTION_REJECTED') {
        toast.error('Transaction rejected by user.');
      } else if (error.message?.includes('Cannot refund before delivery deadline')) {
        toast.error('Cannot refund before delivery deadline has passed.');
      } else {
        toast.error('Failed to process refund. Please try again.');
      }
      return false;
    }
  };

  const raiseDispute = async (escrowId: number): Promise<boolean> => {
    if (!contract || !contractDeployed) {
      toast.error('Smart contract not available.');
      return false;
    }

    try {
      toast.info('Raising dispute...');
      const tx = await contract.raiseDispute(escrowId);
      
      toast.info('Transaction submitted. Waiting for confirmation...');
      await tx.wait();
      
      toast.success('Dispute raised successfully!');
      await loadUserEscrows();
      return true;
    } catch (error: any) {
      console.error('Error raising dispute:', error);
      
      if (error.code === 'ACTION_REJECTED') {
        toast.error('Transaction rejected by user.');
      } else {
        toast.error('Failed to raise dispute. Please try again.');
      }
      return false;
    }
  };

  const getEscrowById = async (escrowId: number): Promise<EscrowWithId | null> => {
    if (!contract || !contractDeployed) return null;

    try {
      const escrowData = await contract.getEscrow(escrowId);
      const isOverdue = await contract.isDeliveryOverdue(escrowId);
      
      return {
        id: escrowId,
        buyer: escrowData[0],
        seller: escrowData[1],
        amount: escrowData[2],
        status: escrowData[3],
        createdAt: escrowData[4],
        deliveryDeadline: escrowData[5],
        itemDescription: escrowData[6],
        buyerConfirmed: escrowData[7],
        sellerConfirmed: escrowData[8],
        isOverdue
      };
    } catch (error) {
      console.error('Error getting escrow:', error);
      return null;
    }
  };

  return {
    contract,
    userEscrows,
    loading,
    platformFee,
    contractDeployed,
    createEscrow,
    confirmDelivery,
    requestRefund,
    raiseDispute,
    getEscrowById,
    loadUserEscrows
  };
}