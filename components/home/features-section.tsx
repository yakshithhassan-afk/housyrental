"use client";

import { useState } from "react";
import { Shield, Users, Building2, Search } from "lucide-react";
import { toast } from "sonner";

const features = [
  {
    icon: Shield,
    title: "Professional Marketing",
    description: "High-quality photography and virtual tours",
    stats: "98% Client Satisfaction",
  },
  {
    icon: Users,
    title: "Tenant Screening",
    description: "Rigorous background and credit checks",
    stats: "24-48 Hour Processing",
  },
  {
    icon: Building2,
    title: "24/7 Maintenance",
    description: "Preventative care and prompt repairs",
    stats: "Average 2hr Response",
  },
  {
    icon: Search,
    title: "Financial Clarity",
    description: "Transparent reporting and timely payments",
    stats: "On-Time Payments",
  },
];

const checkItems = [
  "Industry Leading Expertise",
  "Trusted by 5000+ Clients",
  "24/7 Support Available",
  "Proven Track Record",
];

export function FeaturesSection() {
  const [activeFeature, setActiveFeature] = useState<number | null>(null);

  return (
    <section
      className="relative py-20 z-10"
      style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #ccfbf1 100%)" }}
    >
      <div className="container mx-auto px-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 mb-16 shadow-xl">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 drop-shadow-lg">
              Why Choose <span className="text-green-600">HousyRental</span>
            </h2>
            <p className="text-gray-700 text-lg max-w-2xl mx-auto drop-shadow">
              Industry-leading property management services
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Features List */}
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div
                key={index}
                onClick={() => { setActiveFeature(index); toast.success(feature.title); }}
                className="group cursor-pointer animate-fade-in-up"
                style={{ animationDelay: `${index * 150}ms` }}
                onMouseEnter={() => setActiveFeature(index)}
                onMouseLeave={() => setActiveFeature(null)}
              >
                <div className="flex gap-4 p-4 rounded-xl transition-all duration-300 hover:bg-white hover:shadow-lg">
                  <div
                    className={`w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0 transform transition-all duration-300 ${
                      activeFeature === index ? "scale-110 bg-indigo-600" : "group-hover:scale-110"
                    }`}
                  >
                    <feature.icon
                      className={`w-6 h-6 transition-colors duration-300 ${
                        activeFeature === index ? "text-white" : "text-indigo-600"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2 text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 mb-2">{feature.description}</p>
                    <div className="text-sm text-indigo-600 font-medium">{feature.stats}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <div className="text-6xl font-bold mb-4">15+</div>
            <div className="text-xl mb-6">Years of Excellence</div>
            <div className="space-y-4">
              {checkItems.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
