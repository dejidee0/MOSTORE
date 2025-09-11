import React from "react";
import { Truck, Shield, Headphones, Award } from "lucide-react";

const ServiceFeatures = () => {
  const features = [
    {
      icon: Truck,
      title: "Fast Delivery",
      subtitle: "Experience Lightning-Fast Delivery",
      bgColor: "bg-blue-100",
    },
    {
      icon: Shield,
      title: "Secured Payment",
      subtitle: "Shop with Confidence",
      bgColor: "bg-green-100",
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      subtitle: "Always Here for You",
      bgColor: "bg-purple-100",
    },
    {
      icon: Award,
      title: "Delivery Guarantee",
      subtitle: "Quality Promise Assured",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <section className="py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
        {/* Mobile: Single Row with Horizontal Scroll */}
        <div className="block md:hidden">
          <div className="overflow-x-auto">
            <div
              className="flex space-x-2 pb-2"
              style={{ width: "max-content" }}
            >
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div
                    key={i}
                    className="flex-shrink-0 w-44 md:w-64 px-2 py-1 md:p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-gray-300 bg-white"
                  >
                    {/* Icon */}
                    <div
                      className={`${f.bgColor} w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center mb-4`}
                    >
                      <Icon
                        className="w-4 h-4 md:w-7 md:h-7 text-gray-700"
                        strokeWidth={1.5}
                      />
                    </div>

                    {/* Text */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {f.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {f.subtitle}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile scroll indicator */}
          <div className="flex justify-center space-x-2 mt-4">
            {features.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i === 0 ? "bg-gray-400" : "bg-gray-300"
                }`}
              ></div>
            ))}
          </div>
        </div>

        {/* Desktop: Grid Layout */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-gray-300 bg-white"
              >
                {/* Icon */}
                <div
                  className={`${f.bgColor} w-14 h-14 rounded-full flex items-center justify-center mb-4`}
                >
                  <Icon className="w-7 h-7 text-gray-700" strokeWidth={1.5} />
                </div>

                {/* Text */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {f.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {f.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServiceFeatures;
