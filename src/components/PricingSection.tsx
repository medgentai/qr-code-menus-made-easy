
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { CheckCircle, Utensils, Hotel, CircleDollarSign } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const PricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: "Restaurant",
      description: "Perfect for restaurants looking to modernize their menu experience.",
      monthlyPrice: 599,
      annualPrice: 499,
      annualTotal: 5988,
      icon: <Utensils className="h-10 w-10 text-orange-500" />,
      features: [
        "Unlimited QR code menus",
        "Menu customization",
        "Real-time menu updates",
        "Mobile-friendly design",
        "Basic analytics",
        "Email support",
        "Easy category management",
        "Special dish highlights"
      ],
      cta: "Start Free Trial",
      highlight: true,
      dailyCost: 20
    },
    {
      name: "Hotel",
      description: "Ideal for hotels with multiple dining venues and room service.",
      monthlyPrice: 999,
      annualPrice: 899,
      annualTotal: 10788,
      icon: <Hotel className="h-10 w-10 text-orange-500" />,
      features: [
        "All Restaurant features",
        "Multiple menu management",
        "Room service integration",
        "Order management system",
        "Customer feedback collection",
        "Enhanced analytics",
        "Priority support",
        "Multi-language support"
      ],
      cta: "Start Free Trial",
      highlight: false,
      dailyCost: 30
    },
    {
      name: "Custom",
      description: "For businesses with specialized requirements.",
      icon: <CircleDollarSign className="h-10 w-10 text-orange-500" />,
      features: [
        "Tailored solution",
        "Custom branding",
        "API access",
        "Custom integrations",
        "Advanced analytics",
        "Dedicated account manager",
        "24/7 premium support",
        "Personalized training"
      ],
      cta: "Contact Sales",
      highlight: false
    }
  ];

  return (
    <section className="section bg-navy-800" id="pricing">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Simple, <span className="text-orange-500">Transparent</span> Pricing
          </h2>
          <p className="text-lg text-gray-300">
            Choose the plan that's right for your business. All plans include a 14-day free trial.
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`pricing-card ${plan.highlight ? 'border-orange-500 shadow-lg relative overflow-hidden' : ''} hover-scale`}
            >
              {plan.highlight && (
                <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-orange-500 text-white text-xs font-bold px-4 py-1 rounded-full uppercase shadow-md">
                  Most Popular
                </div>
              )}
              
              <div className="flex items-center gap-3 mb-4">
                {plan.icon}
                <h3 className="text-xl font-bold text-navy-800">{plan.name}</h3>
              </div>
              
              <p className="text-gray-600 mb-6 h-12">{plan.description}</p>
              
              {plan.name !== "Custom" && (
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
                </div>
              )}
              
              {plan.name === "Custom" && (
                <div className="mb-6">
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                    <span className="text-lg font-semibold text-navy-800 block mb-1">Flexible Pricing</span>
                    <span className="text-gray-600 text-sm">Tailored to your specific needs</span>
                  </div>
                </div>
              )}
              
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
                <Link to={plan.cta === "Contact Sales" ? "/contact" : "/get-started"}>
                  {plan.cta}
                </Link>
              </Button>
            </div>
          ))}
        </div>
        
        <div className="max-w-3xl mx-auto mt-16 bg-navy-700 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Need a custom solution?</h3>
          <p className="text-gray-300 mb-6">
            Contact our sales team to discuss your specific requirements and get a tailored quote.
          </p>
          <Button 
            className="bg-white text-navy-800 hover:bg-gray-100"
            asChild
          >
            <Link to="/contact">Contact Sales</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
