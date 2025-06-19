import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, Plus, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WalletConnection } from '@/components/WalletConnection';
import { EscrowForm } from '@/components/EscrowForm';
import { EscrowList } from '@/components/EscrowList';
import { useWeb3 } from '@/hooks/useWeb3';

interface EscrowPageProps {
  onBack: () => void;
}

export function EscrowPage({ onBack }: EscrowPageProps) {
  const { isConnected } = useWeb3();
  const [activeTab, setActiveTab] = useState('create');

  const handleEscrowCreated = (escrowId: number) => {
    setActiveTab('list');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={onBack}
                className="text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-600" />
                <h1 className="text-2xl font-semibold text-gray-800">Blockchain Escrow</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Introduction */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-light text-gray-800">
              Secure Transactions with Smart Contracts
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Use blockchain technology to create secure escrow transactions. Funds are held safely in a smart contract 
              until delivery is confirmed, protecting both buyers and sellers.
            </p>
          </div>

          {/* Wallet Connection */}
          <div className="max-w-2xl mx-auto">
            <WalletConnection />
          </div>

          {/* Main Content */}
          {isConnected && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
              <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
                <TabsTrigger value="create" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Create Escrow
                </TabsTrigger>
                <TabsTrigger value="list" className="flex items-center gap-2">
                  <List className="w-4 h-4" />
                  My Escrows
                </TabsTrigger>
              </TabsList>

              <TabsContent value="create" className="space-y-6">
                <div className="max-w-2xl mx-auto">
                  <EscrowForm onEscrowCreated={handleEscrowCreated} />
                </div>
              </TabsContent>

              <TabsContent value="list" className="space-y-6">
                <EscrowList />
              </TabsContent>
            </Tabs>
          )}

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200"
            >
              <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Secure & Trustless</h3>
              <p className="text-gray-600">
                Smart contracts eliminate the need for intermediaries. Your funds are protected by blockchain technology.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200"
            >
              <Shield className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Automatic Release</h3>
              <p className="text-gray-600">
                Funds are automatically released to the seller once delivery is confirmed by the buyer.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200"
            >
              <Shield className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Dispute Resolution</h3>
              <p className="text-gray-600">
                Built-in dispute mechanism and refund options protect both parties in case of issues.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}