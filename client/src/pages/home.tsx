import { WalletConnection } from '@/components/wallet-connection';
import { DonationForm } from '@/components/donation-form';
import { ExecutionHistory } from '@/components/execution-history';
import { AllExecutions } from '@/components/all-executions';
import { useTotalDonations } from '@/hooks/use-herd-trail';

import { Coffee } from 'lucide-react';

export default function Home() {
  const { data: totalDonations, isLoading: isDonationsLoading } = useTotalDonations();

  return (
    <div className="coffee-bg-50 min-h-screen font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Coffee className="coffee-text-500 w-8 h-8" />
              <div>
                <h1 className="text-xl font-semibold coffee-text-800">Buy me a coffee!</h1>
                <p className="text-sm coffee-text-600">
                  {isDonationsLoading ? 'Loading...' : 
                    totalDonations ? `Total Donated $${totalDonations.totalAmount.toFixed(2)}` : 'Total Donated $0.00'
                  }
                </p>
              </div>
            </div>
            <WalletConnection />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <img 
              src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300" 
              alt="Steaming coffee cup with coffee beans" 
              className="w-32 h-24 mx-auto rounded-2xl shadow-lg object-cover" 
            />
          </div>
          <h2 className="text-4xl font-bold coffee-text-800 mb-4">Support my data work with some USDC ☕</h2>
          <p className="text-lg coffee-text-600 mb-6 max-w-2xl mx-auto">
            Hey there! I'm{' '}
            <a 
              href="https://farcaster.xyz/ilemi" 
              target="_blank" 
              rel="noopener noreferrer"
              className="coffee-text-500 hover:coffee-text-600 font-medium"
            >
              @ilemi
            </a>
            {' '}and I create valuable data insights for the community. Your support helps me continue this work!
          </p>
          
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Donation Form */}
          <div className="lg:col-span-2">
            <DonationForm />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Your Donations */}
            <ExecutionHistory />

            {/* Community Donations */}
            <AllExecutions />
          </div>
        </div>
      </main>

      {/* Sticky Footer */}
      <footer className="sticky bottom-0 bg-white border-t border-gray-200 py-2 px-4 text-center">
        <p className="text-xs coffee-text-500">
          <a 
            href="https://herd.eco/trails/0197604c-f761-7ade-8a5c-5e50c2d834d4/overlook" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:coffee-text-600"
          >
            Powered by Herd
          </a>
        </p>
      </footer>
    </div>
  );
}
