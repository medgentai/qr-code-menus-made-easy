
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

      <main className="flex-grow pt-20">
        {/* Pricing Plans Section */}
        <PricingSection />

        {/* FAQ Section */}
        <section className="py-20 bg-white">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600 mb-16 text-center">
                Everything you need to know about our pricing and plans
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  {
                    question: "How do I get started?",
                    answer: "Simply choose your plan, create your organization, and start setting up your venue. You'll have immediate access to all features and can begin creating your menu and QR codes right away."
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
                    answer: "We accept all major credit cards and UPI through Razorpay, India's leading payment gateway."
                  },
                  {
                    question: "Is there a contract or commitment?",
                    answer: "No long-term contracts. Our plans are month-to-month, and you can cancel at any time. Annual plans are paid upfront for the year but can be canceled for a prorated refund."
                  }
                ].map((faq, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors duration-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 bg-gradient-to-r from-orange-500 to-red-500">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Transform Your Business?
              </h2>
              <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
                Join thousands of restaurants already using our platform to streamline their operations and delight their customers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-white text-orange-500 hover:bg-gray-100 text-lg px-8 py-4 font-semibold"
                  asChild
                >
                  <Link to="/get-started">
                    Get Started Today <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  className="bg-white bg-opacity-20 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-orange-500 text-lg px-8 py-4 font-semibold transition-all duration-200"
                  asChild
                >
                  <Link to="/get-started">
                    Contact Support
                  </Link>
                </Button>
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
