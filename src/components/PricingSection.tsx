
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Switch } from "@/components/ui/switch";

const PricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: "Starter",
      description: "Perfect for small businesses just getting started.",
      monthlyPrice: 29,
      annualPrice: 24,
      features: [
        "Unlimited QR code menus",
        "Basic menu customization",
        "Real-time menu updates",
        "Mobile-friendly design",
        "Basic analytics",
        "Email support"
      ],
      cta: "Start Free Trial",
      highlight: false
    },
    {
      name: "Professional",
      description: "Ideal for growing businesses with multiple menus.",
      monthlyPrice: 79,
      annualPrice: 65,
      features: [
        "All Starter features",
        "Advanced menu customization",
        "Multiple menu management",
        "Order management system",
        "Customer feedback collection",
        "Enhanced analytics",
        "Priority support"
      ],
      cta: "Start Free Trial",
      highlight: true
    },
    {
      name: "Enterprise",
      description: "For large operations with custom requirements.",
      monthlyPrice: 199,
      annualPrice: 169,
      features: [
        "All Professional features",
        "White-label solution",
        "API access",
        "Custom integrations",
        "Multi-location management",
        "Dedicated account manager",
        "24/7 premium support"
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
              
              <h3 className="text-xl font-bold text-navy-800 mb-2">{plan.name}</h3>
              <p className="text-gray-600 mb-6 h-12">{plan.description}</p>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-navy-800">
                  ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                </span>
                <span className="text-gray-500">/month</span>
                {isAnnual && (
                  <div className="text-orange-500 text-sm font-medium mt-1">
                    Billed annually
                  </div>
                )}
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
