import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useEvaluateInputs, useCreateExecution } from '@/hooks/use-herd-trail';
import { HerdAPI } from '@/lib/herd-api';
import { Coffee, Loader2, Heart } from 'lucide-react';

const QUICK_AMOUNTS = [5, 10, 25, 50];

export function DonationForm() {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  
  const evaluateInputs = useEvaluateInputs();
  const createExecution = useCreateExecution();
  const { writeContract } = useWriteContract();

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !address) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to make a donation.',
        variant: 'destructive',
      });
      return;
    }

    const donationAmount = parseFloat(amount);
    if (!donationAmount || donationAmount < 0.01) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid donation amount (minimum $0.01).',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Evaluate inputs to get transaction calldata
      const userInputs = HerdAPI.buildUserInputs(amount);
      const evaluationResponse = await evaluateInputs.mutateAsync({
        walletAddress: address,
        userInputs,
      });

      // Step 2: Submit transaction using the calldata
      const txHash = await new Promise<string>((resolve, reject) => {
        writeContract(
          {
            address: evaluationResponse.calldata.to as `0x${string}`,
            abi: [
              {
                name: 'transfer',
                type: 'function',
                inputs: [
                  { name: 'to', type: 'address' },
                  { name: 'amount', type: 'uint256' }
                ],
                outputs: [{ name: '', type: 'bool' }],
                stateMutability: 'nonpayable',
              },
            ],
            functionName: 'transfer',
            args: [
              evaluationResponse.finalInputValues.to,
              parseUnits(amount, 6) // USDC has 6 decimals
            ],
            value: BigInt(evaluationResponse.finalPayableAmount || '0'),
          },
          {
            onSuccess: (hash) => resolve(hash),
            onError: (error) => reject(error),
          }
        );
      });

      // Step 3: Update execution record
      await createExecution.mutateAsync({
        primaryNodeId: HerdAPI.getTrailConfig().primaryNodeId,
        transactionHash: txHash,
      });

      toast({
        title: 'Donation successful! ☕',
        description: `Thank you for donating $${amount} USDC!`,
      });

      // Reset form
      setAmount('');
      setMessage('');

    } catch (error) {
      console.error('Donation failed:', error);
      toast({
        title: 'Donation failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="lg:col-span-2">
      <CardContent className="p-8">
        <div className="mb-6">
          <h3 className="text-2xl font-semibold coffee-text-800 mb-2 flex items-center">
            <Heart className="accent-text-500 mr-3 w-6 h-6" />
            Make a Donation
          </h3>
          <p className="coffee-text-600">Support with USDC on Base network</p>
        </div>

        {/* Step Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm coffee-text-600 mb-2">
            <span>Step 1 of 1</span>
            <span>Ready to donate</span>
          </div>
          <div className="w-full coffee-bg-100 rounded-full h-2">
            <div 
              className="coffee-bg-500 h-2 rounded-full transition-all duration-300" 
              style={{ width: isProcessing ? '100%' : '0%' }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount Input */}
          <div>
            <Label htmlFor="donationAmount" className="block text-sm font-medium coffee-text-700 mb-2">
              Donation Amount (USDC)
            </Label>
            <div className="relative">
              <Input
                type="number"
                id="donationAmount"
                min="0.01"
                step="0.01"
                placeholder="10.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 text-lg pr-16"
                disabled={isProcessing}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="coffee-text-500 font-medium">USDC</span>
              </div>
            </div>
            <p className="text-sm coffee-text-500 mt-1">Minimum donation: $0.01 USDC</p>
          </div>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {QUICK_AMOUNTS.map((quickAmount) => (
              <Button
                key={quickAmount}
                type="button"
                variant="outline"
                onClick={() => handleQuickAmount(quickAmount)}
                disabled={isProcessing}
                className="coffee-bg-100 hover:coffee-bg-200 coffee-text-700 py-2 px-4 rounded-lg font-medium transition-colors duration-200"
              >
                ${quickAmount}
              </Button>
            ))}
          </div>

          {/* Personal Message */}
          <div>
            <Label htmlFor="personalMessage" className="block text-sm font-medium coffee-text-700 mb-2">
              Add a personal message (optional)
            </Label>
            <Textarea
              id="personalMessage"
              rows={3}
              placeholder="Thanks for your amazing data work!"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isProcessing}
              className="resize-none"
            />
          </div>

          {/* Donation Button */}
          <Button
            type="submit"
            disabled={!isConnected || isProcessing || !amount}
            className="w-full accent-bg-500 hover:accent-bg-600 disabled:bg-gray-300 text-white py-4 px-6 rounded-lg font-semibold text-lg transition-colors duration-200"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing donation...
              </>
            ) : (
              <>
                <Coffee className="mr-2 h-5 w-5" />
                Buy me a coffee!
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
