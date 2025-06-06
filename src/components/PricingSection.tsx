import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { CheckCircle, Utensils, Hotel, CircleDollarSign, Loader2, AlertCircle } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { usePlans } from '@/hooks/usePlans';
import { Plan } from '@/types/payment';

const PricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  const { plans: backendPlans, loading, error, refetch } = usePlans();

  // Helper function to get icon based on organization type
  const getIcon = (organizationType: string) => {
    switch (organizationType) {
      case 'RESTAURANT':
        return <Utensils className="h-10 w-10 text-orange-500" />;
      case 'HOTEL':
        return <Hotel className="h-10 w-10 text-orange-500" />;
      case 'CAFE':
        return <CircleDollarSign className="h-10 w-10 text-orange-500" />;
      default:
        return <Utensils className="h-10 w-10 text-orange-500" />;
    }
  };

  // Helper function to calculate daily cost
  const calculateDailyCost = (annualPrice: number) => {
    return Math.round(annualPrice / 365);
  };

  // Transform backend plans to frontend format
  const transformedPlans = backendPlans.map((plan: Plan, index: number) => ({
    id: plan.id,
    name: plan.name,
    description: plan.description,
    monthlyPrice: Number(plan.monthlyPrice),
    annualPrice: Math.round(Number(plan.annualPrice) / 12), // Monthly equivalent of annual price
    annualTotal: Number(plan.annualPrice), // Total annual price
    icon: getIcon(plan.organizationType),
    features: plan.features,
    cta: "Book a Free Demo",
    highlight: plan.organizationType === 'RESTAURANT', // Highlight restaurant plan
    dailyCost: calculateDailyCost(Number(plan.annualPrice)),
    organizationType: plan.organizationType,
  }));

  const customSolutionDescription = "Whether you run Cafés & Bars, Food Trucks, Event Spaces, or need an Enterprise solution, our team can tailor ScanServe to meet your specific requirements and scale with your business.";

  // Loading state
  if (loading) {
    return (
      <section className="section bg-navy-800" id="pricing">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Simple, <span className="text-orange-500">Transparent</span> Pricing
            </h2>
            <p className="text-lg text-gray-300">
              Choose the plan that's right for your business. Start managing your venue today.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <div key={i} className="pricing-card">
                <Skeleton className="h-8 w-3/4 mb-4 bg-gray-700" />
                <Skeleton className="h-4 w-full mb-6 bg-gray-700" />
                <Skeleton className="h-12 w-1/2 mb-6 bg-gray-700" />
                <div className="space-y-3 mb-8">
                  {[1, 2, 3, 4].map((j) => (
                    <Skeleton key={j} className="h-4 w-full bg-gray-700" />
                  ))}
                </div>
                <Skeleton className="h-10 w-full bg-gray-700" />
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
      <section className="section bg-navy-800" id="pricing">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Simple, <span className="text-orange-500">Transparent</span> Pricing
            </h2>
            <Alert className="bg-red-900 border-red-700">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-100">
                Failed to load pricing plans.
                <Button
                  variant="link"
                  className="text-red-200 underline p-0 ml-1 h-auto"
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
    <section className="section bg-navy-800" id="pricing">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Simple, <span className="text-orange-500">Transparent</span> Pricing
          </h2>
          <p className="text-lg text-gray-300">
            Choose the plan that's right for your business. Start managing your venue today.
          </p>

          <div className="flex items-center justify-center mt-8 space-x-3">
            <span className={`text-sm font-medium ${!isAnnual ? 'text-white' : 'text-gray-400'}`}>Monthly</span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-orange-500"
            />
            <span className={`text-sm font-medium ${isAnnual ? 'text-white' : 'text-gray-400'}`}>
              Annual <span className="text-orange-500 ml-1">Save 20%</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {transformedPlans.map((plan, index) => (
            <div
              key={index}
              className={`pricing-card relative ${plan.highlight ? 'border-orange-500 border-2 shadow-lg overflow-visible z-10' : ''}`}
            >
              {plan.highlight && (
                <div className="absolute top-0 right-0 -mt-4 -mr-4 bg-orange-500 text-white text-xs font-bold px-4 py-1 rounded-full uppercase shadow-lg z-10">
                  Most Popular
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                {plan.icon}
                <h3 className="text-xl font-bold text-navy-800">{plan.name}</h3>
              </div>

              <p className="text-gray-600 mb-6 h-12">{plan.description}</p>

              <div className="mb-6">
                <div className="flex items-end">
                  <span className="text-4xl font-bold text-navy-800">
                    ₹{isAnnual ? plan.annualPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-gray-500 ml-1">/month</span>
                </div>

                {isAnnual && (
                  <div className="flex items-center mt-2">
                    <div className="text-orange-500 text-sm font-medium">
                      ₹{plan.annualTotal} billed annually
                    </div>

                    <HoverCard>
                      <HoverCardTrigger>
                        <div className="ml-2 bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full cursor-help">
                          Only ₹{plan.dailyCost}/day
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80">
                        <div className="text-sm">
                          <p className="font-medium">Just ₹{plan.dailyCost} per day</p>
                          <p className="text-gray-600 mt-1">
                            That's less than the cost of a cup of chai! Invest in your business's digital presence for pennies a day.
                          </p>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                )}

                <div className="mt-2 text-xs text-gray-500">
                  *Excluding applicable taxes and payment gateway fees
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${plan.highlight ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'btn-outline'}`}
                asChild
              >
                <Link to="/get-started">
                  {plan.cta}
                </Link>
              </Button>
            </div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto mt-16 bg-navy-700 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Need a custom solution?</h3>
          <p className="text-gray-300 mb-6">
            {customSolutionDescription}
          </p>
          <Button
            className="bg-white text-navy-800 hover:bg-gray-100"
            asChild
          >
            <Link to="/get-started">Contact Sales</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
