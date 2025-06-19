import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, ExternalLink, AlertCircle, CheckCircle, Copy, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useWeb3 } from '@/hooks/useWeb3';
import { toast } from 'sonner';

const MUMBAI_CHAIN_ID = 80001;
const MUMBAI_FAUCET_URL = 'https://faucet.polygon.technology/';
const MUMBAI_EXPLORER_URL = 'https://mumbai.polygonscan.com/';

export function WalletConnection() {
  const { 
    account, 
    chainId, 
    isConnected, 
    isConnecting, 
    connectWallet, 
    disconnectWallet, 
    switchToMumbai 
  } = useWeb3();
  
  const [copied, setCopied] = useState(false);

  const isOnMumbai = chainId === MUMBAI_CHAIN_ID;

  const copyAddress = async () => {
    if (account) {
      await navigator.clipboard.writeText(account);
      setCopied(true);
      toast.success('Address copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getChainName = (chainId: number) => {
    switch (chainId) {
      case 1: return 'Ethereum Mainnet';
      case 5: return 'Goerli Testnet';
      case 137: return 'Polygon Mainnet';
      case 80001: return 'Mumbai Testnet';
      default: return `Chain ${chainId}`;
    }
  };

  if (!isConnected) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-purple-800">
            <Wallet className="w-6 h-6" />
            Connect Your Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 text-center">
            Connect your MetaMask wallet to use the escrow system and make secure transactions.
          </p>
          
          <Button
            onClick={connectWallet}
            disabled={isConnecting}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3"
          >
            {isConnecting ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4 mr-2" />
                Connect MetaMask
              </>
            )}
          </Button>

          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-medium text-gray-800">Need help getting started?</h4>
            <div className="space-y-2">
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
              >
                <ExternalLink className="w-4 h-4" />
                Install MetaMask
              </a>
              <a
                href={MUMBAI_FAUCET_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
              >
                <ExternalLink className="w-4 h-4" />
                Get Mumbai Testnet MATIC
              </a>
              <a
                href={MUMBAI_EXPLORER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
              >
                <ExternalLink className="w-4 h-4" />
                Mumbai Block Explorer
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              Wallet Connected
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={disconnectWallet}
              className="border-green-300 text-green-700 hover:bg-green-100"
            >
              Disconnect
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Address:</span>
            <div className="flex items-center gap-2">
              <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                {formatAddress(account!)}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyAddress}
                className="h-8 w-8 p-0"
              >
                {copied ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Network:</span>
            <Badge variant={isOnMumbai ? "default" : "destructive"}>
              {getChainName(chainId!)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {!isOnMumbai && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <div className="flex items-center justify-between">
              <span>Please switch to Mumbai testnet for full functionality.</span>
              <Button
                variant="outline"
                size="sm"
                onClick={switchToMumbai}
                className="ml-2 border-amber-300 text-amber-700 hover:bg-amber-100"
              >
                Switch Network
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {isOnMumbai && (
        <Alert className="border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="space-y-2">
              <p>You're connected to Mumbai testnet! Here are some useful links:</p>
              <div className="flex flex-wrap gap-2">
                <a
                  href={MUMBAI_FAUCET_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="w-3 h-3" />
                  Get Test MATIC
                </a>
                <a
                  href={`${MUMBAI_EXPLORER_URL}address/${account}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="w-3 h-3" />
                  View on Explorer
                </a>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </motion.div>
  );
}