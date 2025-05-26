
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { ArrowRight, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

const HowItWorks = () => {
  const { state: { isAuthenticated } } = useAuth();
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-white to-sky-50 py-16 md:py-24">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-navy-800 mb-6">
                How <span className="text-orange-500">ScanServe</span> Works
              </h1>
              <p className="text-xl text-gray-700 mb-8">
                A simple, intuitive platform designed to transform your menu experience in just a few steps.
              </p>
              <div className="aspect-video max-w-2xl mx-auto rounded-xl overflow-hidden shadow-xl">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ" // Replace with your actual video
                  title="ScanServe Demo"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </section>

        {/* Step-by-Step Guide */}
        <section className="section bg-white">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                {/* Vertical Timeline Line */}
                <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-orange-100 transform -translate-x-1/2"></div>

                {/* Step 1 */}
                <div className="relative mb-20">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                    <div className="w-full md:w-5/12 md:text-right order-2 md:order-1">
                      <h3 className="text-2xl font-bold text-navy-800 mb-4">Sign Up & Create Your Account</h3>
                      <p className="text-gray-600 mb-4">
                        Start with a free 14-day trial. Enter your business details to create your account and access the ScanServe dashboard.
                      </p>
                      <ul className="space-y-2 text-gray-700 md:mr-6">
                        <li>No credit card required</li>
                        <li>Quick 2-minute setup</li>
                        <li>Immediate access to all features</li>
                      </ul>
                    </div>

                    <div className="relative md:absolute md:left-1/2 md:transform md:-translate-x-1/2 z-10 flex items-center justify-center">
                      <div className="bg-white rounded-full p-4 border-4 border-orange-100 shadow-lg">
                        <div className="bg-orange-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">
                          1
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:w-5/12 order-1 md:order-2 md:ml-auto">
                      <div className="bg-gray-100 rounded-xl overflow-hidden shadow-md">
                        <img
                          src="https://images.unsplash.com/photo-1517292987719-0369a794ec0f?w=500&auto=format&fit=crop"
                          alt="Sign up process"
                          className="w-full h-auto"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative mb-20">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                    <div className="w-full md:w-5/12 md:ml-auto order-2">
                      <h3 className="text-2xl font-bold text-navy-800 mb-4">Build Your Digital Menu</h3>
                      <p className="text-gray-600 mb-4">
                        Use our intuitive menu builder to create and customize your digital menu. Add categories, items, descriptions, images, and prices.
                      </p>
                      <ul className="space-y-2 text-gray-700 md:ml-6">
                        <li>User-friendly drag-and-drop interface</li>
                        <li>Upload images for each menu item</li>
                        <li>Add allergen information and modifiers</li>
                        <li>Organize by categories</li>
                      </ul>
                    </div>

                    <div className="relative md:absolute md:left-1/2 md:transform md:-translate-x-1/2 z-10 flex items-center justify-center">
                      <div className="bg-white rounded-full p-4 border-4 border-orange-100 shadow-lg">
                        <div className="bg-orange-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">
                          2
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:w-5/12 order-1 md:order-1 md:text-right">
                      <div className="bg-gray-100 rounded-xl overflow-hidden shadow-md">
                        <img
                          src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=500&auto=format&fit=crop"
                          alt="Menu building process"
                          className="w-full h-auto"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative mb-20">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                    <div className="w-full md:w-5/12 md:text-right order-2 md:order-1">
                      <h3 className="text-2xl font-bold text-navy-800 mb-4">Generate & Deploy QR Codes</h3>
                      <p className="text-gray-600 mb-4">
                        Create custom QR codes for each table, room, or location. Download, print, and place them for customers to scan.
                      </p>
                      <ul className="space-y-2 text-gray-700 md:mr-6">
                        <li>Unique QR codes for each location</li>
                        <li>Customizable with your branding</li>
                        <li>Print-ready formats</li>
                        <li>Easy placement instructions</li>
                      </ul>
                    </div>

                    <div className="relative md:absolute md:left-1/2 md:transform md:-translate-x-1/2 z-10 flex items-center justify-center">
                      <div className="bg-white rounded-full p-4 border-4 border-orange-100 shadow-lg">
                        <div className="bg-orange-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">
                          3
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:w-5/12 order-1 md:order-2 md:ml-auto">
                      <div className="bg-gray-100 rounded-xl overflow-hidden shadow-md">
                        <img
                          src="https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=500&auto=format&fit=crop"
                          alt="QR code generation"
                          className="w-full h-auto"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="relative mb-20">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                    <div className="w-full md:w-5/12 md:ml-auto order-2">
                      <h3 className="text-2xl font-bold text-navy-800 mb-4">Customers Scan & Order</h3>
                      <p className="text-gray-600 mb-4">
                        Customers scan the QR code with their smartphone camera. No app download required. They can browse your menu and place orders directly.
                      </p>
                      <ul className="space-y-2 text-gray-700 md:ml-6">
                        <li>Instant menu access for customers</li>
                        <li>Mobile-friendly interface</li>
                        <li>Easy ordering process</li>
                        <li>Special requests and notes</li>
                      </ul>
                    </div>

                    <div className="relative md:absolute md:left-1/2 md:transform md:-translate-x-1/2 z-10 flex items-center justify-center">
                      <div className="bg-white rounded-full p-4 border-4 border-orange-100 shadow-lg">
                        <div className="bg-orange-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">
                          4
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:w-5/12 order-1 md:order-1 md:text-right">
                      <div className="bg-gray-100 rounded-xl overflow-hidden shadow-md">
                        <img
                          src="https://images.unsplash.com/photo-1593508512255-86ab42a8e24c?w=500&auto=format&fit=crop"
                          alt="Customer scanning QR code"
                          className="w-full h-auto"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="relative">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                    <div className="w-full md:w-5/12 md:text-right order-2 md:order-1">
                      <h3 className="text-2xl font-bold text-navy-800 mb-4">Receive & Manage Orders</h3>
                      <p className="text-gray-600 mb-4">
                        Get instant notifications of new orders. Manage them from your dashboard, update status, and track fulfillment.
                      </p>
                      <ul className="space-y-2 text-gray-700 md:mr-6">
                        <li>Real-time order notifications</li>
                        <li>Order management dashboard</li>
                        <li>Order status tracking</li>
                        <li>Analytics and reporting</li>
                      </ul>
                    </div>

                    <div className="relative md:absolute md:left-1/2 md:transform md:-translate-x-1/2 z-10 flex items-center justify-center">
                      <div className="bg-white rounded-full p-4 border-4 border-orange-100 shadow-lg">
                        <div className="bg-orange-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">
                          5
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:w-5/12 order-1 md:order-2 md:ml-auto">
                      <div className="bg-gray-100 rounded-xl overflow-hidden shadow-md">
                        <img
                          src="https://images.unsplash.com/photo-1564218989864-0d562e8b9371?w=500&auto=format&fit=crop"
                          alt="Order management dashboard"
                          className="w-full h-auto"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="section bg-sky-50">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-navy-800 mb-12 text-center">
                Frequently Asked Questions
              </h2>

              <div className="space-y-6">
                {[
                  {
                    question: "Do customers need to download an app to use ScanServe?",
                    answer: "No, customers simply scan the QR code with their smartphone camera. The menu opens in their web browser with no app download required."
                  },
                  {
                    question: "How quickly can I get set up with ScanServe?",
                    answer: "Most businesses can get fully set up within 1-2 hours. The sign-up process takes just minutes, and our intuitive menu builder makes it easy to create your digital menu."
                  },
                  {
                    question: "Can I customize the look and feel of my digital menu?",
                    answer: "Absolutely! You can customize colors, fonts, layout, and add your logo to match your brand identity. Our platform offers extensive customization options."
                  },
                  {
                    question: "How do I make updates to my menu?",
                    answer: "Log in to your ScanServe dashboard, navigate to the menu editor, and make your changes. All updates are reflected instantly on your live menu without needing to replace QR codes."
                  },
                  {
                    question: "Can ScanServe handle multiple locations or different menus?",
                    answer: "Yes, our Professional and Enterprise plans support multiple locations and menu management. You can create different menus for breakfast, lunch, dinner, or special events."
                  }
                ].map((faq, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-xl font-bold text-navy-800 mb-3">{faq.question}</h3>
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section bg-orange-500 text-white">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Transform Your Menu Experience?
              </h2>
              <p className="text-xl mb-8">
                Start managing your venue today with our comprehensive solution.
              </p>
              {isAuthenticated ? (
                <Button
                  className="bg-white text-orange-500 hover:bg-gray-100 text-base flex items-center gap-2 group mx-auto"
                  size="lg"
                  asChild
                >
                  <Link to="/dashboard">
                    Go to Dashboard
                    <LayoutDashboard size={18} className="ml-2" />
                  </Link>
                </Button>
              ) : (
                <Button
                  className="bg-white text-orange-500 hover:bg-gray-100 text-base flex items-center gap-2 group mx-auto"
                  size="lg"
                  asChild
                >
                  <Link to="/get-started">
                    Get Started Now
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HowItWorks;
