import { motion } from 'framer-motion';
import { Component as Lightning } from '@/components/ui/lightning';
import { PricingCard } from '@/components/ui/dark-gradient-pricing';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Star, Crown, Zap } from 'lucide-react';

interface PricingPageProps {
  onBack: () => void;
}

export function PricingPage({ onBack }: PricingPageProps) {
  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Lightning Background */}
      <div className="absolute inset-0 z-0">
        <Lightning
          hue={45} // Golden/amber hue
          xOffset={0.0}
          speed={0.5}
          intensity={0.8}
          size={1.2}
        />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen bg-black/40">
        {/* Header */}
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-white hover:bg-white/10 mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-6xl font-light text-white mb-6">
              Choose Your
              <span className="block text-amber-400">Power Level</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Unlock the full potential of Seekr with our premium plans designed for collectors, dealers, and legends
            </p>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <PricingCard
                tier="Free"
                price="$0/mo"
                bestFor="Perfect for getting started"
                CTA="Start Free"
                benefits={[
                  { text: "1 active listing", checked: true },
                  { text: "Basic search visibility", checked: true },
                  { text: "Standard messaging", checked: true },
                  { text: "Community support", checked: true },
                  { text: "Priority placement", checked: false },
                  { text: "Advanced analytics", checked: false },
                  { text: "Verification badge", checked: false },
                ]}
                className="border-gray-600 bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-amber-400 text-black px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                    <Crown className="w-4 h-4" />
                    Most Popular
                  </div>
                </div>
                <PricingCard
                  tier="Pro"
                  price="$29/mo"
                  bestFor="For serious collectors & dealers"
                  CTA="Upgrade to Pro"
                  benefits={[
                    { text: "Unlimited listings", checked: true },
                    { text: "Priority search placement", checked: true },
                    { text: "Advanced messaging", checked: true },
                    { text: "Priority support", checked: true },
                    { text: "Enhanced analytics", checked: true },
                    { text: "Featured badges", checked: true },
                    { text: "API access", checked: false },
                  ]}
                  className="border-amber-400 bg-gradient-to-br from-amber-900/80 to-amber-800/80 backdrop-blur-sm scale-105 shadow-2xl shadow-amber-400/20"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <PricingCard
                tier="Legend"
                price="$99/mo"
                bestFor="For galleries & auction houses"
                CTA="Become a Legend"
                benefits={[
                  { text: "Everything in Pro", checked: true },
                  { text: "Verified dealer badge", checked: true },
                  { text: "Custom branding", checked: true },
                  { text: "API access", checked: true },
                  { text: "Dedicated manager", checked: true },
                  { text: "White-label solutions", checked: true },
                  { text: "Market insights", checked: true },
                ]}
                className="border-purple-400 bg-gradient-to-br from-purple-900/80 to-purple-800/80 backdrop-blur-sm"
              />
            </motion.div>
          </div>

          {/* Features Comparison */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-20 text-center"
          >
            <h2 className="text-3xl font-light text-white mb-8">
              Why Upgrade?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-400/20 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-amber-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Lightning Fast</h3>
                <p className="text-gray-300">
                  Priority placement ensures your listings are seen first by potential sellers
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-400/20 flex items-center justify-center">
                  <Crown className="w-8 h-8 text-amber-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Premium Status</h3>
                <p className="text-gray-300">
                  Verification badges and premium features build trust with sellers
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-400/20 flex items-center justify-center">
                  <Star className="w-8 h-8 text-amber-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Unlimited Power</h3>
                <p className="text-gray-300">
                  Create unlimited listings and access advanced analytics and insights
                </p>
              </div>
            </div>
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="mt-20 max-w-4xl mx-auto"
          >
            <h2 className="text-3xl font-light text-white text-center mb-12">
              Frequently Asked Questions
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Can I change plans anytime?
                </h3>
                <p className="text-gray-300">
                  Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
                </p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-3">
                  What happens to my listings if I downgrade?
                </h3>
                <p className="text-gray-300">
                  Your existing listings remain active, but you won't be able to create new ones beyond your plan limit.
                </p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Is there a setup fee?
                </h3>
                <p className="text-gray-300">
                  No setup fees. You only pay the monthly subscription for your chosen plan.
                </p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Do you offer refunds?
                </h3>
                <p className="text-gray-300">
                  We offer a 30-day money-back guarantee for all paid plans.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}