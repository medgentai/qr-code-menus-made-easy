
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PricingSection from '../components/PricingSection';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Pricing = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-white to-sky-50 py-16 md:py-24">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-navy-800 mb-6">
                Simple, <span className="text-orange-500">Transparent</span> Pricing
              </h1>
              <p className="text-xl text-gray-700 mb-8">
                Choose the plan that's right for your business. All plans include a 14-day free trial.
              </p>
            </div>
          </div>
        </section>
        
        {/* Pricing Plans Section */}
        <PricingSection />
        
        {/* FAQ Section */}
        <section className="section bg-white">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-navy-800 mb-12 text-center">
                Frequently Asked Questions
              </h2>
              
              <div className="space-y-6">
                {[
                  {
                    question: "What's included in the free trial?",
                    answer: "Our 14-day free trial includes full access to all features of the plan you select. You can create your menu, generate QR codes, and test the full order management system. No credit card is required to start the trial."
                  },
                  {
                    question: "Can I change plans later?",
                    answer: "Yes, you can upgrade or downgrade your plan at any time. When upgrading, you'll have immediate access to the new features, and your billing will be prorated for the remainder of your billing cycle."
                  },
                  {
                    question: "Are there any setup or hidden fees?",
                    answer: "No, there are no setup fees or hidden charges. The price you see is what you pay. All plans include customer support, hosting, and regular platform updates."
                  },
                  {
                    question: "Do you offer discounts for annual billing?",
                    answer: "Yes, you save 20% when you choose annual billing compared to monthly billing."
                  },
                  {
                    question: "What payment methods do you accept?",
                    answer: "We accept all major credit cards (Visa, Mastercard, American Express) and PayPal for payment."
                  },
                  {
                    question: "Is there a contract or commitment?",
                    answer: "No long-term contracts. Our plans are month-to-month, and you can cancel at any time. Annual plans are paid upfront for the year but can be canceled for a prorated refund."
                  }
                ].map((faq, index) => (
                  <div key={index} className="bg-sky-50 rounded-xl p-6 shadow-sm">
                    <h3 className="text-xl font-bold text-navy-800 mb-3">{faq.question}</h3>
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        
      
      </main>
      
      <Footer />
    </div>
  );
};

export default Pricing;
