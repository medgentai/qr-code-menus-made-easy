import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { CheckCircle, Utensils, Hotel, Coffee, Truck, Wine, Loader2, AlertCircle, Star, Shield, Zap } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { usePlans } from '@/hooks/usePlans';
import { Plan } from '@/types/payment';

const PricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  const { plans: backendPlans, loading, error, refetch } = usePlans();

  // Helper function to get icon based on organization type
  const getIcon = (organizationType: string) => {
    switch (organizationType) {
      case 'RESTAURANT':
        return <Utensils className="h-8 w-8 text-white" />;
      case 'HOTEL':
        return <Hotel className="h-8 w-8 text-white" />;
      case 'CAFE':
        return <Coffee className="h-8 w-8 text-white" />;
      case 'FOOD_TRUCK':
        return <Truck className="h-8 w-8 text-white" />;
      case 'BAR':
        return <Wine className="h-8 w-8 text-white" />;
      default:
        return <Utensils className="h-8 w-8 text-white" />;
    }
  };

  // Helper function to get gradient colors based on organization type
  const getGradient = (organizationType: string) => {
    switch (organizationType) {
      case 'RESTAURANT':
        return 'from-orange-500 to-red-500';
      case 'HOTEL':
        return 'from-blue-500 to-indigo-500';
      case 'CAFE':
        return 'from-amber-500 to-orange-500';
      case 'FOOD_TRUCK':
        return 'from-green-500 to-emerald-500';
      case 'BAR':
        return 'from-purple-500 to-pink-500';
      default:
        return 'from-orange-500 to-red-500';
    }
  };

  // Helper function to calculate savings
  const calculateSavings = (monthlyPrice: number, annualPrice: number) => {
    const annualMonthly = monthlyPrice * 12;
    const savings = annualMonthly - annualPrice;
    const percentage = Math.round((savings / annualMonthly) * 100);
    return { amount: savings, percentage };
  };

  // Transform backend plans to frontend format
  const transformedPlans = backendPlans.map((plan: Plan, index: number) => {
    const savings = calculateSavings(Number(plan.monthlyPrice), Number(plan.annualPrice));
    return {
      id: plan.id,
      name: plan.name,
      description: plan.description,
      monthlyPrice: Number(plan.monthlyPrice),
      annualPrice: Number(plan.annualPrice),
      annualMonthlyEquivalent: Math.round(Number(plan.annualPrice) / 12),
      icon: getIcon(plan.organizationType),
      gradient: getGradient(plan.organizationType),
      features: plan.features,
      cta: "Get Started",
      highlight: plan.organizationType === 'RESTAURANT',
      savings,
      organizationType: plan.organizationType,
    };
  });

  const customSolutionDescription = "Whether you run Cafés & Bars, Food Trucks, Event Spaces, or need an Enterprise solution, our team can tailor ScanServe to meet your specific requirements and scale with your business.";

  // Loading state
  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white" id="pricing">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Simple, <span className="text-orange-500">Transparent</span> Pricing
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Choose the plan that's right for your business. Start managing your venue today.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <Skeleton className="h-8 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-6" />
                <Skeleton className="h-12 w-1/2 mb-6" />
                <div className="space-y-3 mb-8">
                  {[1, 2, 3, 4].map((j) => (
                    <Skeleton key={j} className="h-4 w-full" />
                  ))}
                </div>
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white" id="pricing">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Simple, <span className="text-orange-500">Transparent</span> Pricing
            </h2>
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Failed to load pricing plans.
                <Button
                  variant="link"
                  className="text-red-600 underline p-0 ml-1 h-auto"
                  onClick={refetch}
                >
                  Try again
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white" id="pricing">
      <div className="container-custom">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Simple, <span className="text-orange-500">Transparent</span> Pricing
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Choose the plan that's right for your business. Start managing your venue today.
          </p>

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-8 text-sm text-gray-500 mb-8">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              <span>No setup fees</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-500" />
              <span>Instant activation</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>24/7 support</span>
            </div>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-medium ${!isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
              Monthly
            </span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-orange-500"
            />
            <span className={`text-sm font-medium ${isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
              Annual
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700 hover:bg-green-100">
                Save 20%
              </Badge>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {transformedPlans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                plan.highlight
                  ? 'border-orange-200 ring-2 ring-orange-500 ring-opacity-20'
                  : 'border-gray-200 hover:border-orange-200'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1 text-sm font-semibold">
                    Most Popular
                  </Badge>
                </div>
              )}

              {/* Header with icon and gradient */}
              <div className={`p-8 pb-6 bg-gradient-to-r ${plan.gradient} rounded-t-2xl`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    {plan.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                </div>
                <p className="text-white text-opacity-90">{plan.description}</p>
              </div>

              <div className="p-8 pt-6">

                {/* Pricing */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-5xl font-bold text-gray-900">
                      ₹{isAnnual ? plan.annualMonthlyEquivalent : plan.monthlyPrice}
                    </span>
                    <span className="text-gray-500 text-lg">/month</span>
                  </div>

                  {isAnnual && (
                    <div className="space-y-2">
                      <div className="text-gray-600 text-sm">
                        ₹{plan.annualPrice} billed annually
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Save ₹{plan.savings.amount} ({plan.savings.percentage}% off)
                      </Badge>
                    </div>
                  )}

                  <div className="mt-3 text-xs text-gray-500">
                    *Excluding applicable taxes
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  className={`w-full h-12 text-base font-semibold transition-all duration-200 ${
                    plan.highlight
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }`}
                  asChild
                >
                  <Link to="/get-started">
                    {plan.cta}
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Solution CTA */}
        <div className="max-w-4xl mx-auto mt-20">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 md:p-12 text-center">
            <h3 className="text-3xl font-bold text-white mb-4">
              Need help getting started?
            </h3>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Have questions about our plans or need assistance setting up your restaurant?
              Our team is here to help you choose the right solution for your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 text-base font-semibold"
                asChild
              >
                <Link to="/get-started">Get Started</Link>
              </Button>
              <Button
                className="bg-white bg-opacity-20 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-3 text-base font-semibold transition-all duration-200"
                asChild
              >
                <Link to="/get-started">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
