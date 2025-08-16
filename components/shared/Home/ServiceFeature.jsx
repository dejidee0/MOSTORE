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
    <div className="bg-white py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="flex items-start sm:items-center gap-4 p-5 rounded-2xl bg-white border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${i * 0.1}s both`,
                }}
              >
                {/* Icon */}
                <div
                  className={`w-14 h-14 ${f.bgColor} rounded-full flex items-center justify-center shadow-sm flex-shrink-0`}
                >
                  <Icon
                    className="w-7 h-7 text-gray-700 transition-transform duration-300 group-hover:rotate-6"
                    strokeWidth={1.5}
                  />
                </div>

                {/* Text */}
                <div className="flex flex-col">
                  <h3 className="font-semibold text-gray-900 text-base">
                    {f.title}
                  </h3>
                  <p className="text-gray-500 text-sm mt-1 leading-snug max-w-[200px]">
                    {f.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ServiceFeatures;
