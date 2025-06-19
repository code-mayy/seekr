import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, DollarSign, Calendar, FileText, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useEscrow } from '@/hooks/useEscrow';
import { useWeb3 } from '@/hooks/useWeb3';
import { ethers } from 'ethers';

const escrowSchema = z.object({
  sellerAddress: z.string()
    .min(1, 'Seller address is required')
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  amount: z.string()
    .min(1, 'Amount is required')
    .refine((val) => {
      try {
        const num = parseFloat(val);
        return num > 0 && num <= 1000;
      } catch {
        return false;
      }
    }, 'Amount must be between 0 and 1000 MATIC'),
  itemDescription: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters'),
  deliveryDays: z.string()
    .min(1, 'Delivery days is required')
    .refine((val) => {
      const num = parseInt(val);
      return num >= 1 && num <= 365;
    }, 'Delivery days must be between 1 and 365'),
});

type EscrowForm = z.infer<typeof escrowSchema>;

interface EscrowFormProps {
  onEscrowCreated?: (escrowId: number) => void;
}

export function EscrowForm({ onEscrowCreated }: EscrowFormProps) {
  const { isConnected, account } = useWeb3();
  const { createEscrow, platformFee } = useEscrow();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EscrowForm>({
    resolver: zodResolver(escrowSchema),
    defaultValues: {
      sellerAddress: '',
      amount: '',
      itemDescription: '',
      deliveryDays: '7',
    },
  });

  const onSubmit = async (data: EscrowForm) => {
    if (!isConnected) {
      return;
    }

    setIsSubmitting(true);
    try {
      const escrowId = await createEscrow(
        data.sellerAddress,
        data.amount,
        data.itemDescription,
        parseInt(data.deliveryDays)
      );

      if (escrowId !== null) {
        form.reset();
        onEscrowCreated?.(escrowId);
      }
    } catch (error) {
      console.error('Error creating escrow:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateFees = () => {
    const amount = parseFloat(form.watch('amount') || '0');
    const platformFeeAmount = (amount * platformFee) / 100;
    const sellerReceives = amount - platformFeeAmount;
    
    return {
      amount,
      platformFeeAmount,
      sellerReceives,
    };
  };

  const fees = calculateFees();

  if (!isConnected) {
    return (
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="text-center py-8">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Connect your wallet to create escrow transactions</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-white border-gray-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <Shield className="w-6 h-6 text-blue-600" />
            Create Escrow Transaction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Seller Address */}
            <div className="space-y-2">
              <Label htmlFor="sellerAddress" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Seller Address
              </Label>
              <Input
                id="sellerAddress"
                placeholder="0x..."
                {...form.register('sellerAddress')}
                className="font-mono text-sm"
              />
              {form.formState.errors.sellerAddress && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.sellerAddress.message}
                </p>
              )}
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Amount (MATIC)
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.001"
                placeholder="0.1"
                {...form.register('amount')}
              />
              {form.formState.errors.amount && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.amount.message}
                </p>
              )}
            </div>

            {/* Fee Breakdown */}
            {fees.amount > 0 && (
              <Alert className="bg-blue-50 border-blue-200">
                <AlertDescription>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Escrow Amount:</span>
                      <span className="font-medium">{fees.amount.toFixed(4)} MATIC</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Platform Fee ({platformFee}%):</span>
                      <span className="font-medium">{fees.platformFeeAmount.toFixed(4)} MATIC</span>
                    </div>
                    <div className="flex justify-between border-t pt-1">
                      <span className="font-medium">Seller Receives:</span>
                      <span className="font-bold text-green-600">{fees.sellerReceives.toFixed(4)} MATIC</span>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Item Description */}
            <div className="space-y-2">
              <Label htmlFor="itemDescription" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Item Description
              </Label>
              <Textarea
                id="itemDescription"
                placeholder="Describe the item or service being purchased..."
                rows={3}
                {...form.register('itemDescription')}
              />
              {form.formState.errors.itemDescription && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.itemDescription.message}
                </p>
              )}
            </div>

            {/* Delivery Days */}
            <div className="space-y-2">
              <Label htmlFor="deliveryDays" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Delivery Deadline (Days)
              </Label>
              <Input
                id="deliveryDays"
                type="number"
                min="1"
                max="365"
                {...form.register('deliveryDays')}
              />
              {form.formState.errors.deliveryDays && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.deliveryDays.message}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Buyer can request refund after this deadline if delivery is not confirmed
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting || !form.formState.isValid}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Escrow...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Create Escrow Transaction
                </>
              )}
            </Button>

            {/* Warning */}
            <Alert className="bg-amber-50 border-amber-200">
              <AlertDescription className="text-amber-800 text-sm">
                <strong>Important:</strong> Once created, the escrow amount will be locked in the smart contract. 
                Make sure all details are correct before proceeding.
              </AlertDescription>
            </Alert>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}