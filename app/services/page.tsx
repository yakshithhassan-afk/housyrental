"use client";

import { useState } from "react";
import { Building2, Home, Users, Shield, Clock, DollarSign, CheckCircle, Star } from "lucide-react";

export default function ServicesPage() {
  const [selectedService, setSelectedService] = useState<number | null>(null);

  const services = [
    {
      id: 1,
      icon: Building2,
      title: "Property Management",
      description: "Comprehensive management services for property owners including tenant screening, rent collection, and maintenance coordination.",
      features: ["Tenant Screening", "Rent Collection", "Maintenance Coordination", "Legal Compliance", "Financial Reporting"],
      price: "Starting at $199/month",
      popular: true
    },
    {
      id: 2,
      icon: Home,
      title: "Rental Listing Services",
      description: "Professional property listing and marketing to attract quality tenants quickly and efficiently.",
      features: ["Professional Photography", "Online Marketing", "Tenant Screening", "Lease Preparation", "Property Showings"],
      price: "One-time fee $499"
    },
    {
      id: 3,
      icon: Users,
      title: "Tenant Placement",
      description: "Find the perfect tenants for your property with our comprehensive screening and matching process.",
      features: ["Background Checks", "Credit Verification", "Employment Verification", "Reference Checks", "Rental History"],
      price: "$299 per placement"
    },
    {
      id: 4,
      icon: Shield,
      title: "Maintenance Services",
      description: "24/7 maintenance support to keep your property in perfect condition and tenants happy.",
      features: ["24/7 Emergency Support", "Preventive Maintenance", "Repairs & Renovations", "Vendor Management", "Quality Assurance"],
      price: "Starting at $149/month"
    },
    {
      id: 5,
      icon: Clock,
      title: "Legal & Compliance",
      description: "Stay compliant with all rental laws and regulations with our expert legal support.",
      features: ["Lease Agreements", "Eviction Support", "Legal Consultation", "Compliance Monitoring", "Documentation"],
      price: "$199/hour consultation"
    },
    {
      id: 6,
      icon: DollarSign,
      title: "Financial Services",
      description: "Complete financial management including accounting, tax preparation, and investment analysis.",
      features: ["Bookkeeping", "Tax Preparation", "Financial Reports", "Investment Analysis", "Budget Planning"],
      price: "Starting at $249/month"
    }
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 50%, #ecfdf5 100%)', minHeight: '100vh' }}>
      {/* Header */}
      <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">HR</span>
            </div>
            <div>
              <span className="font-bold text-xl text-gray-800">HousyRental</span>
              <p className="text-xs text-gray-500">Find Your Perfect Home</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="/" className="text-gray-700 hover:text-cyan-900 transition-colors font-medium">Home</a>
            <a href="/properties" className="text-gray-700 hover:text-cyan-900 transition-colors font-medium">Properties</a>
            <a href="/services" className="text-cyan-900 font-semibold">Services</a>
            <a href="/about" className="text-gray-700 hover:text-cyan-900 transition-colors font-medium">About</a>
          </nav>
          <div className="flex items-center gap-4">
            <a href="/auth/login" className="text-sm font-medium text-gray-700 hover:text-cyan-900 transition-colors">
              Sign In
            </a>
            <a
              href="/auth/register"
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg text-sm font-medium hover:from-cyan-700 hover:to-teal-700 transition-all shadow-lg"
            >
              Get Started
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">
            Our <span className="text-cyan-900">Premium Services</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Comprehensive real estate solutions designed to make property management simple, efficient, and profitable. From finding tenants to handling maintenance, we've got you covered.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div
                key={service.id}
                className={`bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer ${
                  selectedService === service.id ? 'ring-2 ring-cyan-600' : ''
                }`}
                onClick={() => setSelectedService(service.id)}
              >
                {service.popular && (
                  <div className="mb-4">
                    <span className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-600 to-teal-600 rounded-2xl flex items-center justify-center mb-6">
                  <service.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold mb-4 text-gray-900">{service.title}</h3>
                <p className="text-gray-600 mb-6">{service.description}</p>
                
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Key Features:</h4>
                  <ul className="space-y-2">
                    {service.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="border-t pt-6">
                  <div className="text-2xl font-bold text-cyan-900 mb-4">{service.price}</div>
                  <button className="w-full px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg font-medium hover:from-cyan-700 hover:to-teal-700 transition-all shadow-lg">
                    Get Started
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-4" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)' }}>
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Why Choose <span className="text-cyan-900">HousyRental</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're committed to providing exceptional service that exceeds your expectations and helps you achieve your real estate goals.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-cyan-600 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Expert Team</h3>
              <p className="text-gray-600">Our experienced professionals are dedicated to providing top-notch service and support.</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-cyan-600 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Trusted & Secure</h3>
              <p className="text-gray-600">We prioritize your security and privacy with industry-leading protection measures.</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-cyan-600 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">24/7 Support</h3>
              <p className="text-gray-600">Round-the-clock assistance to ensure your property management needs are always met.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-cyan-600 to-teal-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-12 max-w-2xl mx-auto">
            Join thousands of satisfied property owners who trust HousyRental for their property management needs.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a
              href="/auth/register"
              className="px-8 py-4 bg-white text-cyan-900 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors shadow-xl"
            >
              Sign Up Now
            </a>
            <a
              href="/contact"
              className="px-8 py-4 border-2 border-white text-white rounded-lg font-bold text-lg hover:bg-white hover:text-cyan-900 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
