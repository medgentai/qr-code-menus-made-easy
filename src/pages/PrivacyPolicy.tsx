import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-navy-800 text-white py-20">
          <div className="container-custom text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4  pt-20">
              Privacy <span className="text-orange-500">Policy</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Your privacy is important to us. Learn how we protect and handle your data.
            </p>
            <p className="text-gray-400 mt-4">Last updated: January 2025</p>
          </div>
        </section>

        {/* Content */}
        <section className="py-20 bg-white">
          <div className="container-custom max-w-4xl">
            <div className="prose prose-lg max-w-none">
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-navy-800 mb-6">1. Introduction</h2>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  TapDodo Technologies Pvt Ltd ("we," "our," or "us") operates the TapDodo platform, a restaurant management SaaS solution 
                  that provides QR code-based ordering systems for hospitality businesses. This Privacy Policy explains how we collect, use, 
                  disclose, and safeguard your information when you use our service.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  We are committed to protecting your privacy and ensuring transparency about our data practices. This policy applies to 
                  all users of the TapDodo platform, including business owners, staff members, and end customers.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold text-navy-800 mb-6">2. Information We Collect</h2>
                
                <h3 className="text-xl font-semibold text-navy-700 mb-4">2.1 Business Account Information</h3>
                <p className="text-gray-700 mb-4 leading-relaxed">When you register your business with TapDodo, we collect:</p>
                <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
                  <li>Organization details (name, type, address)</li>
                  <li>User account information (name, email, phone number)</li>
                  <li>Business verification documents</li>
                  <li>Payment information for subscription billing</li>
                  <li>Venue and location details</li>
                </ul>

                <h3 className="text-xl font-semibold text-navy-700 mb-4">2.2 Operational Data</h3>
                <p className="text-gray-700 mb-4 leading-relaxed">During normal operation, we collect:</p>
                <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
                  <li>Menu items and pricing information</li>
                  <li>Order details and customer preferences</li>
                  <li>Staff activity and role assignments</li>
                  <li>Payment transaction data (processed securely through payment partners)</li>
                  <li>QR code usage and scanning analytics</li>
                </ul>

                <h3 className="text-xl font-semibold text-navy-700 mb-4">2.3 Customer Information</h3>
                <p className="text-gray-700 mb-4 leading-relaxed">For end customers placing orders:</p>
                <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
                  <li>Contact information (name, phone number)</li>
                  <li>Order history and preferences</li>
                  <li>Table or room assignment</li>
                  <li>Feedback and ratings</li>
                </ul>

                <h3 className="text-xl font-semibold text-navy-700 mb-4">2.4 Technical Information</h3>
                <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
                  <li>Device information and browser type</li>
                  <li>IP address and location data</li>
                  <li>Usage patterns and feature interaction</li>
                  <li>Error logs and performance metrics</li>
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold text-navy-800 mb-6">3. How We Use Your Information</h2>
                
                <h3 className="text-xl font-semibold text-navy-700 mb-4">3.1 Service Provision</h3>
                <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
                  <li>Process and fulfill customer orders</li>
                  <li>Manage venue operations and staff assignments</li>
                  <li>Generate QR codes and digital menus</li>
                  <li>Process payments and manage subscriptions</li>
                  <li>Provide customer support and technical assistance</li>
                </ul>

                <h3 className="text-xl font-semibold text-navy-700 mb-4">3.2 Business Intelligence</h3>
                <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
                  <li>Generate analytics and business insights</li>
                  <li>Track order patterns and customer preferences</li>
                  <li>Monitor service performance and uptime</li>
                  <li>Identify areas for service improvement</li>
                </ul>

                <h3 className="text-xl font-semibold text-navy-700 mb-4">3.3 Legal and Administrative</h3>
                <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
                  <li>Comply with applicable laws and regulations</li>
                  <li>Prevent fraud and ensure platform security</li>
                  <li>Enforce our terms of service</li>
                  <li>Respond to legal requests and court orders</li>
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold text-navy-800 mb-6">4. Data Security</h2>
                <p className="text-gray-700 mb-4 leading-relaxed">We implement comprehensive security measures to protect your information:</p>
                
                <h3 className="text-xl font-semibold text-navy-700 mb-4">4.1 Technical Safeguards</h3>
                <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
                  <li>SSL/TLS encryption for all data transmission</li>
                  <li>AES-256 encryption for data at rest</li>
                  <li>JWT-based authentication with refresh tokens</li>
                  <li>Rate limiting and DDoS protection</li>
                  <li>Regular security audits and vulnerability assessments</li>
                </ul>

                <h3 className="text-xl font-semibold text-navy-700 mb-4">4.2 Access Controls</h3>
                <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
                  <li>Role-based access control (RBAC)</li>
                  <li>Multi-factor authentication for administrative access</li>
                  <li>Regular access reviews and permission audits</li>
                  <li>Logging and monitoring of all data access</li>
                </ul>

                <h3 className="text-xl font-semibold text-navy-700 mb-4">4.3 Multi-Tenant Isolation</h3>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  TapDodo operates on a multi-tenant architecture with strict data isolation. Your organization's data is never shared 
                  with other organizations using our platform. Each organization's data is logically separated and secured.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold text-navy-800 mb-6">5. Data Retention</h2>
                <p className="text-gray-700 mb-4 leading-relaxed">We retain your information for as long as necessary to provide our services and comply with legal obligations:</p>
                <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
                  <li><strong>Account Data:</strong> Retained while your account is active and for 7 years after account closure for legal compliance</li>
                  <li><strong>Order Data:</strong> Retained for 3 years for business analytics and tax compliance</li>
                  <li><strong>Payment Data:</strong> Retained according to payment processor requirements and tax regulations</li>
                  <li><strong>Analytics Data:</strong> Aggregated and anonymized data may be retained indefinitely for service improvement</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  Upon account termination, we will securely delete or anonymize your personal data within 30 days, except where longer 
                  retention is required by law.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold text-navy-800 mb-6">6. Your Rights and Choices</h2>
                
                <h3 className="text-xl font-semibold text-navy-700 mb-4">6.1 Access and Portability</h3>
                <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
                  <li>Access your personal data through your account dashboard</li>
                  <li>Export your business data in standard formats</li>
                  <li>Request copies of data we hold about you</li>
                </ul>

                <h3 className="text-xl font-semibold text-navy-700 mb-4">6.2 Correction and Updates</h3>
                <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
                  <li>Update your account information directly through the platform</li>
                  <li>Correct inaccurate or incomplete data</li>
                  <li>Request assistance from our support team for complex updates</li>
                </ul>

                <h3 className="text-xl font-semibold text-navy-700 mb-4">6.3 Deletion and Restriction</h3>
                <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
                  <li>Delete your account and associated data</li>
                  <li>Request deletion of specific data categories</li>
                  <li>Restrict processing for certain purposes</li>
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold text-navy-800 mb-6">7. Third-Party Services</h2>
                <p className="text-gray-700 mb-4 leading-relaxed">We may share your information with trusted third parties who assist us in operating our platform:</p>
                <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
                  <li><strong>Payment Processors:</strong> Razorpay for secure payment processing</li>
                  <li><strong>Cloud Infrastructure:</strong> AWS for hosting and data storage</li>
                  <li><strong>Analytics Providers:</strong> For usage analytics and performance monitoring</li>
                  <li><strong>Customer Support:</strong> Tools to provide customer assistance</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">All third-party providers are bound by confidentiality agreements and data protection requirements.</p>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold text-navy-800 mb-6">8. Cookies and Tracking</h2>
                <p className="text-gray-700 mb-4 leading-relaxed">We use cookies and similar technologies to:</p>
                <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
                  <li>Maintain user sessions and authentication</li>
                  <li>Remember user preferences and settings</li>
                  <li>Analyze usage patterns and improve our service</li>
                  <li>Provide personalized experiences</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  You can control cookie settings through your browser, but disabling certain cookies may limit functionality.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold text-navy-800 mb-6">9. International Transfers</h2>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  Your information may be transferred to and processed in countries other than your home country, including the United States 
                  where our cloud infrastructure is located. We ensure appropriate safeguards are in place for international transfers:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
                  <li>Compliance with applicable data protection laws</li>
                  <li>Contractual protections with service providers</li>
                  <li>Industry-standard security measures</li>
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold text-navy-800 mb-6">10. Changes to This Privacy Policy</h2>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements. 
                  We will notify you of any material changes by:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
                  <li>Email notification to registered users</li>
                  <li>Prominent notice on our website</li>
                  <li>In-app notifications for significant changes</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  Your continued use of TapDodo after any changes constitutes acceptance of the updated Privacy Policy.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold text-navy-800 mb-6">11. Contact Information</h2>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  If you have questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="bg-gray-50 p-6 rounded-xl">
                  <p className="text-gray-700 mb-2"><strong>Data Protection Officer:</strong> privacy@tapdodo.com</p>
                  <p className="text-gray-700 mb-2"><strong>General Inquiries:</strong> support@tapdodo.com</p>
                  <p className="text-gray-700 mb-2"><strong>Mailing Address:</strong> TapDodo Technologies Pvt Ltd, Mumbai, India</p>
                  <p className="text-gray-700"><strong>Phone:</strong> +91 (022) 1234-5678</p>
                </div>
              </section>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-orange-50 py-16">
          <div className="container-custom text-center">
            <h3 className="text-2xl font-bold text-navy-800 mb-4">Questions About Your Privacy?</h3>
            <p className="text-gray-700 mb-8 max-w-2xl mx-auto">
              We're committed to transparency and protecting your privacy. If you have any questions about how we handle your data, 
              please don't hesitate to reach out.
            </p>
            <a href="/contact" className="btn-primary">
              Contact Privacy Team
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;