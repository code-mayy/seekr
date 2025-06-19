import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check, Star, Crown, Zap, Shield, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (planId: string) => void;
  currentListingCount: number;
}

const pricingPlans = [
  {
    id: 'free',
    name: 'Starter',
    price: 0,
    period: 'forever',
    description: 'Perfect for trying out Seekr',
    features: [
      '1 active listing',
      'Basic search visibility',
      'Standard messaging',
      'Community support',
      'Basic profile features'
    ],
    limitations: [
      'Limited to 1 listing only',
      'No priority support',
      'Basic analytics'
    ],
    icon: Star,
    color: 'gray',
    popular: false
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 29,
    period: 'month',
    description: 'For serious collectors and dealers',
    features: [
      'Unlimited listings',
      'Priority search placement',
      'Advanced messaging features',
      'Priority customer support',
      'Enhanced profile customization',
      'Detailed analytics dashboard',
      'Featured listing badges',
      'Early access to new features'
    ],
    limitations: [],
    icon: Crown,
    color: 'amber',
    popular: true
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 99,
    period: 'month',
    description: 'For galleries, auction houses, and high-volume dealers',
    features: [
      'Everything in Premium',
      'Verified dealer badge',
      'Custom branding options',
      'API access for integrations',
      'Dedicated account manager',
      'White-label solutions',
      'Advanced market insights',
      'Bulk listing tools',
      'Custom contract templates'
    ],
    limitations: [],
    icon: Shield,
    color: 'purple',
    popular: false
  }
];

const additionalFeatures = [
  {
    title: 'Featured Listings',
    description: 'Boost your listing to the top of search results',
    price: 19,
    period: 'per listing',
    icon: TrendingUp
  },
  {
    title: 'Verification Badge',
    description: 'Get verified status to build trust with buyers',
    price: 49,
    period: 'one-time',
    icon: Shield
  },
  {
    title: 'Premium Support',
    description: '24/7 priority support with dedicated agent',
    price: 15,
    period: 'month',
    icon: Users
  }
];

export function PricingModal({ isOpen, onClose, onSelectPlan, currentListingCount }: PricingModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    onSelectPlan(planId);
  };

  const getRecommendedPlan = () => {
    if (currentListingCount === 0) return 'free';
    if (currentListingCount >= 1) return 'premium';
    return 'free';
  };

  const recommendedPlan = getRecommendedPlan();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-light text-center mb-2">
            Choose Your Plan
          </DialogTitle>
          <p className="text-gray-600 text-center">
            {currentListingCount === 0 
              ? "Start with a free listing, then upgrade as you grow"
              : `You have ${currentListingCount} listing${currentListingCount !== 1 ? 's' : ''}. Upgrade for unlimited access.`
            }
          </p>
        </DialogHeader>

        {/* Main Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {pricingPlans.map((plan) => {
            const Icon = plan.icon;
            const isRecommended = plan.id === recommendedPlan;
            
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-amber-400 text-black px-3 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                {isRecommended && !plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge variant="outline" className="bg-white px-3 py-1">
                      Recommended
                    </Badge>
                  </div>
                )}

                <Card className={`h-full ${plan.popular ? 'border-amber-400 shadow-lg scale-105' : ''} ${isRecommended ? 'border-blue-400' : ''}`}>
                  <CardHeader className="text-center pb-4">
                    <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${
                      plan.color === 'amber' ? 'bg-amber-100 text-amber-600' :
                      plan.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    
                    <CardTitle className="text-xl font-semibold">{plan.name}</CardTitle>
                    <p className="text-gray-600 text-sm">{plan.description}</p>
                    
                    <div className="mt-4">
                      <span className="text-4xl font-bold">
                        ${plan.price}
                      </span>
                      <span className="text-gray-500">/{plan.period}</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                      
                      {plan.limitations.map((limitation, index) => (
                        <div key={index} className="flex items-center gap-3 opacity-60">
                          <X className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-sm text-gray-500">{limitation}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Button
                      onClick={() => handleSelectPlan(plan.id)}
                      className={`w-full mt-6 ${
                        plan.popular 
                          ? 'bg-amber-400 hover:bg-amber-500 text-black' 
                          : 'bg-gray-900 hover:bg-gray-800 text-white'
                      }`}
                      disabled={plan.id === 'free' && currentListingCount >= 1}
                    >
                      {plan.id === 'free' && currentListingCount >= 1 
                        ? 'Already Used Free Listing'
                        : plan.price === 0 
                          ? 'Start Free' 
                          : `Choose ${plan.name}`
                      }
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Additional Features */}
        <div className="border-t pt-8">
          <h3 className="text-xl font-semibold text-center mb-6">Add-On Features</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {additionalFeatures.map((feature, index) => {
              const Icon = feature.icon;
              
              return (
                <Card key={index} className="text-center">
                  <CardContent className="p-4">
                    <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-gray-600" />
                    </div>
                    
                    <h4 className="font-medium mb-2">{feature.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
                    
                    <div className="text-lg font-semibold text-amber-600">
                      ${feature.price}
                      <span className="text-sm text-gray-500">/{feature.period}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="border-t pt-8">
          <h3 className="text-xl font-semibold text-center mb-6">Frequently Asked Questions</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium mb-2">Can I change plans anytime?</h4>
              <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">What happens to my listings if I downgrade?</h4>
              <p className="text-gray-600">Your existing listings remain active, but you won't be able to create new ones beyond your plan limit.</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Is there a setup fee?</h4>
              <p className="text-gray-600">No setup fees. You only pay the monthly subscription for your chosen plan.</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Do you offer refunds?</h4>
              <p className="text-gray-600">We offer a 30-day money-back guarantee for all paid plans.</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}