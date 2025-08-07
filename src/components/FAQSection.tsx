import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is TapDodo and how does it work?",
    answer: "TapDodo is a QR code restaurant menu system that allows customers to scan a QR code and view your digital menu on their smartphones. Customers can browse items, place orders, and make payments directly through their devices without needing to download an app."
  },
  {
    question: "How much does TapDodo cost?",
    answer: "TapDodo offers flexible pricing starting from ₹499/month for food trucks, ₹599/month for restaurants, and ₹1,499/month for hotels. Each plan includes QR code generation, menu management, order processing, and customer support. We offer a 14-day free trial with no credit card required."
  },
  {
    question: "Do customers need to download an app to use TapDodo?",
    answer: "No! TapDodo works entirely through web browsers. Customers simply scan the QR code with their phone camera and the digital menu opens in their browser. This eliminates friction and makes the experience seamless for all customers."
  },
  {
    question: "Can I customize the look of my digital menu?",
    answer: "Absolutely! TapDodo allows you to customize your menu with your brand colors, logo, images, and styling. You can organize items by categories, add detailed descriptions, set prices, and even mark items as unavailable in real-time."
  },
  {
    question: "How do I receive orders from customers?",
    answer: "Orders placed through TapDodo are instantly sent to your dashboard, email, or integrated POS system. You can view order details, customer contact information, and manage order status from pending to completed. Real-time notifications keep you updated on new orders."
  },
  {
    question: "Is TapDodo suitable for different types of businesses?",
    answer: "Yes! TapDodo is designed for restaurants, hotels, cafes, bars, clubs, and food trucks. Each business type gets features tailored to their needs, such as table management for restaurants or room service for hotels."
  },
  {
    question: "How secure is customer payment information?",
    answer: "TapDodo integrates with secure payment gateways like Razorpay for payment processing. We don't store any sensitive payment information on our servers. All transactions are encrypted and comply with industry security standards."
  },
  {
    question: "Can I update my menu in real-time?",
    answer: "Yes! One of TapDodo's key features is real-time menu updates. You can instantly add new items, change prices, mark items as unavailable, or update descriptions. Changes are immediately visible to customers scanning your QR codes."
  },
  {
    question: "What kind of support do you provide?",
    answer: "We provide comprehensive customer support including setup assistance, training materials, video tutorials, and ongoing technical support. Our support team is available via email and chat to help with any questions or issues."
  },
  {
    question: "How do I get started with TapDodo?",
    answer: "Getting started is easy! Sign up for our free 14-day trial, add your menu items, customize your design, and generate QR codes. You can be up and running in under 30 minutes. No technical skills required!"
  }
];

const FAQSection = () => {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <section className="section bg-gray-50" id="faq">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
      <div className="container-custom">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-navy-800 mb-4">
            Frequently Asked <span className="text-gradient">Questions</span>
          </h2>
          <p className="text-lg text-gray-700">
            Find answers to common questions about TapDodo's QR code menu system.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-white rounded-lg border border-gray-200 px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline py-6">
                  <span className="text-lg font-semibold text-navy-800 pr-4">
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-6 pt-2">
                  <p className="text-gray-700 leading-relaxed">
                    {faq.answer}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 font-semibold"
          >
            Contact our support team
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;