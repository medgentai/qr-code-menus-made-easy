
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle } from 'lucide-react';

const RestaurantUseCase = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-white to-sky-50 py-16 md:py-24">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="max-w-xl">
                <h1 className="text-4xl md:text-5xl font-bold text-navy-800 leading-tight mb-6">
                  QR Menu Solutions for <span className="text-orange-500">Restaurants</span>
                </h1>
                <p className="text-xl text-gray-700 mb-8">
                  Transform your restaurant's dining experience with digital menus that delight customers and streamline operations.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="btn-primary text-base flex items-center gap-2 group" size="lg" asChild>
                    <Link to="/get-started">
                      Start Free Trial
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button className="btn-secondary text-base" size="lg" asChild>
                    <Link to="/demo">Request Demo</Link>
                  </Button>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -top-8 -right-8 w-40 h-40 bg-orange-500/10 rounded-full blur-xl"></div>
                <div className="absolute -bottom-12 -left-12 w-56 h-56 bg-sky-200/30 rounded-full blur-xl"></div>

                <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                  <img
                    src="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&auto=format&fit=crop"
                    alt="Restaurant using ScanServe"
                    className="w-full h-auto rounded-t-xl"
                  />
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-navy-800 mb-2">Modern Dining Experience</h3>
                    <p className="text-gray-600">Give your customers a seamless ordering experience while reducing staff workload.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pain Points & Solutions */}
        <section className="section bg-white">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-navy-800 mb-4">
                Restaurant Challenges <span className="text-orange-500">Solved</span>
              </h2>
              <p className="text-lg text-gray-700">
                See how ScanServe addresses the unique challenges faced by restaurants.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
              {[
                {
                  challenge: "High Menu Printing Costs",
                  solution: "Eliminate recurring printing costs with digital menus that can be updated instantly.",
                  image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=500&auto=format&fit=crop"
                },
                {
                  challenge: "Menu Update Delays",
                  solution: "Update prices, add new items, or mark sold-out dishes in real-time without reprinting menus.",
                  image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500&auto=format&fit=crop"
                },
                {
                  challenge: "Order Errors & Inefficiency",
                  solution: "Reduce errors with digital orders sent directly to the kitchen, streamlining the entire process.",
                  image: "https://images.unsplash.com/photo-1556911220-bda9f7b7e6e5?w=500&auto=format&fit=crop"
                },
                {
                  challenge: "Limited Visual Appeal",
                  solution: "Showcase your dishes with high-quality images, detailed descriptions, and allergen information.",
                  image: "https://images.unsplash.com/photo-1495214783159-3503fd1b572d?w=500&auto=format&fit=crop"
                }
              ].map((item, index) => (
                <div key={index} className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-1/3">
                    <div className="rounded-xl overflow-hidden shadow-sm">
                      <img
                        src={item.image}
                        alt={item.challenge}
                        className="w-full h-auto aspect-square object-cover"
                      />
                    </div>
                  </div>

                  <div className="w-full md:w-2/3">
                    <h3 className="text-xl font-bold text-navy-800 mb-2">
                      {item.challenge}
                    </h3>
                    <div className="w-16 h-1 bg-orange-500 mb-4"></div>
                    <p className="text-gray-600">
                      {item.solution}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Key Benefits */}
        <section className="section bg-sky-50">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-navy-800 mb-4">
                Key Benefits for <span className="text-orange-500">Restaurants</span>
              </h2>
              <p className="text-lg text-gray-700">
                Transform your restaurant operations and customer experience.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Increase Efficiency",
                  description: "Streamline ordering and reduce wait times with direct digital orders.",
                  benefits: [
                    "Reduce order-taking time by 40%",
                    "Minimize errors in order transmission",
                    "Free up staff for better customer service",
                    "Streamline kitchen operations"
                  ]
                },
                {
                  title: "Enhance Customer Experience",
                  description: "Provide a modern, interactive menu experience that delights diners.",
                  benefits: [
                    "Show beautiful images of each dish",
                    "Include detailed ingredient information",
                    "Highlight specials and promotions",
                    "Allow customization of orders"
                  ]
                },
                {
                  title: "Boost Revenue",
                  description: "Increase average order value and turn tables faster.",
                  benefits: [
                    "Increase average check size by 15-25%",
                    "Promote high-margin menu items",
                    "Suggest complementary items",
                    "Gather valuable ordering data"
                  ]
                }
              ].map((benefit, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-bold text-navy-800 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {benefit.description}
                  </p>
                  <ul className="space-y-2">
                    {benefit.benefits.map((item, i) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Success Story */}
        <section className="section bg-white">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-navy-800 mb-12 text-center">
                Success Story
              </h2>

              <div className="bg-sky-50 rounded-xl overflow-hidden shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="p-8 md:p-10">
                    <div className="inline-block px-4 py-1 bg-orange-100 text-orange-500 font-medium rounded-full mb-4">
                      Restaurant Case Study
                    </div>
                    <h3 className="text-2xl font-bold text-navy-800 mb-4">
                      How Urban Spice Increased Revenue by 32%
                    </h3>
                    <p className="text-gray-600 mb-6">
                      "ScanServe transformed our operations. Our customers appreciate the visual menu, and the ability to order at their own pace has significantly increased our average check size."
                    </p>
                    <div className="flex items-center">
                      <img
                        src="https://randomuser.me/api/portraits/men/45.jpg"
                        alt="Michael Chen"
                        className="w-12 h-12 rounded-full mr-4"
                      />
                      <div>
                        <h4 className="font-semibold text-navy-800">Michael Chen</h4>
                        <p className="text-sm text-gray-500">Manager, Urban Spice</p>
                      </div>
                    </div>
                    <div className="mt-8 space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="bg-white p-3 rounded-lg">
                          <span className="text-2xl font-bold text-orange-500">32%</span>
                        </div>
                        <p className="text-gray-700">Revenue increase within 3 months</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="bg-white p-3 rounded-lg">
                          <span className="text-2xl font-bold text-orange-500">25%</span>
                        </div>
                        <p className="text-gray-700">Increase in average order value</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="bg-white p-3 rounded-lg">
                          <span className="text-2xl font-bold text-orange-500">40%</span>
                        </div>
                        <p className="text-gray-700">Reduction in order-taking time</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <img
                      src="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=600&auto=format&fit=crop"
                      alt="Urban Spice Restaurant"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features for Restaurants */}
        <section className="section bg-sky-50">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-navy-800 mb-4">
                Features Designed for <span className="text-orange-500">Restaurants</span>
              </h2>
              <p className="text-lg text-gray-700">
                Specialized solutions to meet the unique needs of restaurant operations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  title: "Table-Specific QR Codes",
                  description: "Generate unique QR codes for each table to streamline service and order delivery."
                },
                {
                  title: "Menu Categorization",
                  description: "Organize your menu into appetizers, mains, desserts, and more for easy navigation."
                },
                {
                  title: "Dish Customization Options",
                  description: "Allow customers to specify preferences, select sides, and note dietary restrictions."
                },
                {
                  title: "Special & Seasonal Menus",
                  description: "Easily create and manage special menus for holidays, events, or seasonal offerings."
                },
                {
                  title: "Order Management Dashboard",
                  description: "Track and fulfill orders with an intuitive dashboard designed for busy restaurants."
                },
                {
                  title: "Kitchen Display Integration",
                  description: "Send orders directly to kitchen displays for seamless preparation workflow."
                }
              ].map((feature, index) => (
                <div key={index} className="feature-card group hover-scale">
                  <h3 className="text-xl font-bold text-navy-800 mb-2 group-hover:text-orange-500 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Demo CTA */}
        <section className="py-24 bg-gradient-to-br from-orange-500 to-orange-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-pattern opacity-10"></div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>

          <div className="container-custom relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                Ready to Transform Your Restaurant?
              </h2>
              <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                Join hundreds of restaurants already using ScanServe to modernize their operations and delight their customers.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  className="bg-white text-orange-500 hover:bg-gray-100 text-base flex items-center gap-2 group"
                  size="lg"
                  asChild
                >
                  <Link to="/get-started">
                    Get Started Now
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button
                  className="bg-transparent border-2 border-white text-white hover:bg-white/10 text-base"
                  size="lg"
                  asChild
                >
                  <Link to="/contact">Schedule a Demo</Link>
                </Button>
              </div>

              <p className="text-white/80 mt-6">
                Start managing your restaurant today.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default RestaurantUseCase;
