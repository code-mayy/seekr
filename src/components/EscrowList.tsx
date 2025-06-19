import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  ExternalLink,
  RefreshCw,
  Calendar,
  User,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useEscrow, EscrowStatus, type EscrowWithId } from '@/hooks/useEscrow';
import { useWeb3 } from '@/hooks/useWeb3';
import { ethers } from 'ethers';

const MUMBAI_EXPLORER_URL = 'https://mumbai.polygonscan.com/';

export function EscrowList() {
  const { account, isConnected } = useWeb3();
  const { userEscrows, loading, confirmDelivery, requestRefund, raiseDispute, loadUserEscrows } = useEscrow();
  const [actionLoading, setActionLoading] = useState<{ [key: number]: string }>({});

  const handleAction = async (escrowId: number, action: 'confirm' | 'refund' | 'dispute') => {
    setActionLoading(prev => ({ ...prev, [escrowId]: action }));
    
    try {
      let success = false;
      switch (action) {
        case 'confirm':
          success = await confirmDelivery(escrowId);
          break;
        case 'refund':
          success = await requestRefund(escrowId);
          break;
        case 'dispute':
          success = await raiseDispute(escrowId);
          break;
      }
      
      if (success) {
        await loadUserEscrows();
      }
    } finally {
      setActionLoading(prev => {
        const newState = { ...prev };
        delete newState[escrowId];
        return newState;
      });
    }
  };

  const getStatusIcon = (status: EscrowStatus) => {
    switch (status) {
      case EscrowStatus.PENDING:
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case EscrowStatus.DELIVERED:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case EscrowStatus.REFUNDED:
        return <XCircle className="w-4 h-4 text-red-500" />;
      case EscrowStatus.DISPUTED:
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: EscrowStatus) => {
    switch (status) {
      case EscrowStatus.PENDING:
        return 'Pending';
      case EscrowStatus.DELIVERED:
        return 'Completed';
      case EscrowStatus.REFUNDED:
        return 'Refunded';
      case EscrowStatus.DISPUTED:
        return 'Disputed';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status: EscrowStatus) => {
    switch (status) {
      case EscrowStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case EscrowStatus.DELIVERED:
        return 'bg-green-100 text-green-800 border-green-200';
      case EscrowStatus.REFUNDED:
        return 'bg-red-100 text-red-800 border-red-200';
      case EscrowStatus.DISPUTED:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isBuyer = (escrow: EscrowWithId) => {
    return escrow.buyer.toLowerCase() === account?.toLowerCase();
  };

  const canConfirmDelivery = (escrow: EscrowWithId) => {
    return escrow.status === EscrowStatus.PENDING && (isBuyer(escrow) || escrow.seller.toLowerCase() === account?.toLowerCase());
  };

  const canRequestRefund = (escrow: EscrowWithId) => {
    return escrow.status === EscrowStatus.PENDING && isBuyer(escrow) && escrow.isOverdue;
  };

  const canRaiseDispute = (escrow: EscrowWithId) => {
    return escrow.status === EscrowStatus.PENDING;
  };

  if (!isConnected) {
    return (
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="text-center py-8">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Connect your wallet to view your escrow transactions</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="bg-white border-gray-200">
        <CardContent className="text-center py-8">
          <RefreshCw className="w-8 h-8 text-blue-500 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading your escrow transactions...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-800">Your Escrow Transactions</h2>
        <Button
          variant="outline"
          onClick={loadUserEscrows}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {userEscrows.length === 0 ? (
        <Card className="bg-white border-gray-200">
          <CardContent className="text-center py-12">
            <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">No Escrow Transactions</h3>
            <p className="text-gray-600">You haven't created or participated in any escrow transactions yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {userEscrows.map((escrow, index) => (
            <motion.div
              key={escrow.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Shield className="w-5 h-5 text-blue-600" />
                      Escrow #{escrow.id}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(escrow.status)}>
                        {getStatusIcon(escrow.status)}
                        <span className="ml-1">{getStatusText(escrow.status)}</span>
                      </Badge>
                      {escrow.isOverdue && escrow.status === EscrowStatus.PENDING && (
                        <Badge variant="destructive">
                          <Clock className="w-3 h-3 mr-1" />
                          Overdue
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Item Description */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-1">Item Description</h4>
                    <p className="text-gray-600 text-sm">{escrow.itemDescription}</p>
                  </div>

                  {/* Transaction Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-600">Amount:</span>
                        <span className="font-medium">{ethers.formatEther(escrow.amount)} MATIC</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-gray-600">
                          {isBuyer(escrow) ? 'Seller:' : 'Buyer:'}
                        </span>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {formatAddress(isBuyer(escrow) ? escrow.seller : escrow.buyer)}
                        </code>
                        <a
                          href={`${MUMBAI_EXPLORER_URL}address/${isBuyer(escrow) ? escrow.seller : escrow.buyer}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-purple-600" />
                        <span className="text-sm text-gray-600">Created:</span>
                        <span className="text-sm">{formatDate(escrow.createdAt)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-orange-600" />
                        <span className="text-sm text-gray-600">Deadline:</span>
                        <span className="text-sm">{formatDate(escrow.deliveryDeadline)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Confirmation Status */}
                  {escrow.status === EscrowStatus.PENDING && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">Confirmation Status</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          {escrow.buyerConfirmed ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <Clock className="w-4 h-4 text-gray-400" />
                          )}
                          <span className={escrow.buyerConfirmed ? 'text-green-700' : 'text-gray-600'}>
                            Buyer confirmed delivery
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {escrow.sellerConfirmed ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <Clock className="w-4 h-4 text-gray-400" />
                          )}
                          <span className={escrow.sellerConfirmed ? 'text-green-700' : 'text-gray-600'}>
                            Seller confirmed delivery
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {escrow.status === EscrowStatus.PENDING && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                      {canConfirmDelivery(escrow) && (
                        <Button
                          onClick={() => handleAction(escrow.id, 'confirm')}
                          disabled={actionLoading[escrow.id] === 'confirm'}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {actionLoading[escrow.id] === 'confirm' ? (
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4 mr-2" />
                          )}
                          Confirm Delivery
                        </Button>
                      )}

                      {canRequestRefund(escrow) && (
                        <Button
                          onClick={() => handleAction(escrow.id, 'refund')}
                          disabled={actionLoading[escrow.id] === 'refund'}
                          variant="destructive"
                        >
                          {actionLoading[escrow.id] === 'refund' ? (
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <XCircle className="w-4 h-4 mr-2" />
                          )}
                          Request Refund
                        </Button>
                      )}

                      {canRaiseDispute(escrow) && (
                        <Button
                          onClick={() => handleAction(escrow.id, 'dispute')}
                          disabled={actionLoading[escrow.id] === 'dispute'}
                          variant="outline"
                          className="border-orange-300 text-orange-700 hover:bg-orange-50"
                        >
                          {actionLoading[escrow.id] === 'dispute' ? (
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 mr-2" />
                          )}
                          Raise Dispute
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Overdue Warning */}
                  {escrow.isOverdue && escrow.status === EscrowStatus.PENDING && isBuyer(escrow) && (
                    <Alert className="bg-red-50 border-red-200">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        This escrow has passed its delivery deadline. You can now request a refund.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}