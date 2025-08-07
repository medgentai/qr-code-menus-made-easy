import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const TermsOfService = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-navy-800 text-white py-20">
          <div className="container-custom text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4  pt-20">
              Terms of <span className="text-orange-500">Service</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Please read these terms carefully before using TapDodo
            </p>
            <p className="text-gray-400 mt-4">Last updated: January 2025</p>
          </div>
        </section>

        {/* Content */}
        <section className="py-20 bg-white">
          <div className="container-custom max-w-4xl">
            <div className="prose prose-lg max-w-none">
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-navy-800 mb-6">1. Acceptance of Terms</h2>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  By accessing and using TapDodo ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. 
                  If you do not agree to abide by the above, please do not use this service.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  TapDodo is a restaurant management SaaS platform that provides QR code-based ordering systems and venue management solutions 
                  for hospitality businesses including restaurants, hotels, clubs, bars, and food trucks.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold text-navy-800 mb-6">2. Service Description</h2>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  TapDodo provides a multi-tenant SaaS platform offering:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
                  <li>QR code-based digital menu systems</li>
                  <li>Order management and processing</li>
                  <li>Menu customization and management</li>
                  <li>Payment processing integration</li>
                  <li>Analytics and reporting</li>
                  <li>Staff and venue management tools</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  Our service operates on a pay-per-venue subscription model with different pricing tiers based on organization type.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold text-navy-800 mb-6">3. User Accounts and Registration</h2>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  To use TapDodo, you must create an account by providing accurate, complete, and current information. You are responsible for:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
                  <li>Maintaining the confidentiality of your account credentials</li>
                  <li>All activities that occur under your account</li>
                  <li>Notifying us immediately of any unauthorized use</li>
                  <li>Ensuring all information provided is accurate and up-to-date</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold text-navy-800 mb-6">4. Subscription and Payment</h2>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  TapDodo operates on a subscription basis with the following terms:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
                  <li>Subscriptions are charged per venue, not per organization</li>
                  <li>Pricing varies by organization type (Food Truck, Restaurant, Hotel, etc.)</li>
                  <li>Monthly and annual billing options are available</li>
                  <li>All prices are exclusive of applicable taxes and payment gateway fees</li>
                  <li>Subscriptions automatically renew unless cancelled</li>
                  <li>Refunds are provided according to our refund policy</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  Payment processing is handled through secure third-party providers. You authorize us to charge your chosen payment method 
                  for subscription fees and any applicable taxes.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold text-navy-800 mb-6">5. Data and Privacy</h2>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  We take data protection seriously. Our privacy practices are detailed in our Privacy Policy. Key points include:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
                  <li>Multi-tenant data isolation ensures your data remains separate from other organizations</li>
                  <li>We implement industry-standard security measures</li>
                  <li>Customer order data is processed securely</li>
                  <li>You retain ownership of your business data</li>
                  <li>Data backup and recovery procedures are in place</li>
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold text-navy-800 mb-6">6. Acceptable Use</h2>
                <p className="text-gray-700 mb-4 leading-relaxed">You agree not to use TapDodo to:</p>
                <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
                  <li>Upload or distribute malicious software, viruses, or harmful content</li>
                  <li>Engage in fraudulent activities or money laundering</li>
                  <li>Violate local laws or regulations regarding food service or business operations</li>
                  <li>Infringe on intellectual property rights of others</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Use the service for any illegal or unauthorized purpose</li>
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold text-navy-800 mb-6">7. Service Availability</h2>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  While we strive for maximum uptime, we cannot guarantee uninterrupted service. We reserve the right to:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
                  <li>Perform scheduled maintenance with advance notice</li>
                  <li>Temporarily suspend service for security or technical reasons</li>
                  <li>Update or modify the service features</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  We are not liable for any business losses resulting from service interruptions beyond our reasonable control.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold text-navy-800 mb-6">8. Intellectual Property</h2>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  TapDodo and its original content, features, and functionality are owned by TapDodo and are protected by international 
                  copyright, trademark, patent, trade secret, and other intellectual property laws.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  You retain ownership of your business content (menus, images, business information) uploaded to the service.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold text-navy-800 mb-6">9. Limitation of Liability</h2>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  To the maximum extent permitted by law, TapDodo shall not be liable for any indirect, incidental, special, 
                  consequential, or punitive damages, including but not limited to:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
                  <li>Loss of profits or business opportunities</li>
                  <li>Loss of data or business information</li>
                  <li>Business interruption</li>
                  <li>Customer dissatisfaction or complaints</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  Our total liability shall not exceed the amount paid by you for the service in the 12 months preceding the claim.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold text-navy-800 mb-6">10. Termination</h2>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  Either party may terminate this agreement:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
                  <li>With 30 days written notice</li>
                  <li>Immediately for material breach of terms</li>
                  <li>Immediately for non-payment of fees</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  Upon termination, you will lose access to the service, but we will provide reasonable time to export your data.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold text-navy-800 mb-6">11. Governing Law</h2>
                <p className="text-gray-700 leading-relaxed">
                  These terms shall be governed by and construed in accordance with the laws of India. 
                  Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of Mumbai, India.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold text-navy-800 mb-6">12. Changes to Terms</h2>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to our website. 
                  Continued use of the service after changes constitutes acceptance of the new terms.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Significant changes will be communicated via email to registered users.
                </p>
              </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-navy-800 mb-4">5. Data and Privacy</h2>
            <p className="text-gray-700 mb-4">
              We take data protection seriously. Our privacy practices are detailed in our 
              <Link to="/privacy-policy" className="text-orange-500 hover:text-orange-600"> Privacy Policy</Link>. 
              Key points include:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Multi-tenant data isolation ensures your data remains separate from other organizations</li>
              <li>We implement industry-standard security measures</li>
              <li>Customer order data is processed securely</li>
              <li>You retain ownership of your business data</li>
              <li>Data backup and recovery procedures are in place</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-navy-800 mb-4">6. Acceptable Use</h2>
            <p className="text-gray-700 mb-4">You agree not to use TapDodo to:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Upload or distribute malicious software, viruses, or harmful content</li>
              <li>Engage in fraudulent activities or money laundering</li>
              <li>Violate local laws or regulations regarding food service or business operations</li>
              <li>Infringe on intellectual property rights of others</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use the service for any illegal or unauthorized purpose</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-navy-800 mb-4">7. Service Availability</h2>
            <p className="text-gray-700 mb-4">
              While we strive for maximum uptime, we cannot guarantee uninterrupted service. We reserve the right to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Perform scheduled maintenance with advance notice</li>
              <li>Temporarily suspend service for security or technical reasons</li>
              <li>Update or modify the service features</li>
            </ul>
            <p className="text-gray-700">
              We are not liable for any business losses resulting from service interruptions beyond our reasonable control.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-navy-800 mb-4">8. Intellectual Property</h2>
            <p className="text-gray-700 mb-4">
              TapDodo and its original content, features, and functionality are owned by TapDodo and are protected by international 
              copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
            <p className="text-gray-700">
              You retain ownership of your business content (menus, images, business information) uploaded to the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-navy-800 mb-4">9. Limitation of Liability</h2>
            <p className="text-gray-700 mb-4">
              To the maximum extent permitted by law, TapDodo shall not be liable for any indirect, incidental, special, 
              consequential, or punitive damages, including but not limited to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Loss of profits or business opportunities</li>
              <li>Loss of data or business information</li>
              <li>Business interruption</li>
              <li>Customer dissatisfaction or complaints</li>
            </ul>
            <p className="text-gray-700">
              Our total liability shall not exceed the amount paid by you for the service in the 12 months preceding the claim.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-navy-800 mb-4">10. Termination</h2>
            <p className="text-gray-700 mb-4">
              Either party may terminate this agreement:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>With 30 days written notice</li>
              <li>Immediately for material breach of terms</li>
              <li>Immediately for non-payment of fees</li>
            </ul>
            <p className="text-gray-700">
              Upon termination, you will lose access to the service, but we will provide reasonable time to export your data.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-navy-800 mb-4">11. Governing Law</h2>
            <p className="text-gray-700">
              These terms shall be governed by and construed in accordance with the laws of India. 
              Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of Mumbai, India.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-navy-800 mb-4">12. Changes to Terms</h2>
            <p className="text-gray-700 mb-4">
              We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to our website. 
              Continued use of the service after changes constitutes acceptance of the new terms.
            </p>
            <p className="text-gray-700">
              Significant changes will be communicated via email to registered users.
            </p>
          </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold text-navy-800 mb-6">13. Contact Information</h2>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  For questions about these Terms of Service, please contact us:
                </p>
                <div className="bg-gray-50 p-6 rounded-xl">
                  <p className="text-gray-700 mb-2"><strong>Email:</strong> legal@tapdodo.com</p>
                  <p className="text-gray-700"><strong>Address:</strong> TapDodo Technologies Pvt Ltd, Mumbai, India</p>
                </div>
              </section>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-orange-50 py-16">
          <div className="container-custom text-center">
            <h3 className="text-2xl font-bold text-navy-800 mb-4">Questions About Our Terms?</h3>
            <p className="text-gray-700 mb-8 max-w-2xl mx-auto">
              If you have any questions about these Terms of Service, please don't hesitate to contact our support team.
            </p>
            <a href="/contact" className="btn-primary">
              Contact Support
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;