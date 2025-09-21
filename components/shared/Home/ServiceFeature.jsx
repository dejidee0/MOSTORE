import React, { useEffect, useRef, useState } from "react";
import { Truck, Shield, Headphones, Award } from "lucide-react";
import { FaMoneyBill } from "react-icons/fa";

const ServiceFeatures = () => {
  const features = [
    {
      icon: Truck,
      title: "Fast Delivery",
      subtitle: "Lightning-Fast Delivery",
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
      subtitle: "Quality Promise",
      bgColor: "bg-orange-100",
    },
    {
      icon: FaMoneyBill,
      title: "Refund Guarantee",
      subtitle: "100% Money Back",
      bgColor: "bg-orange-100",
    },
  ];

  const sliderRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % features.length;
        if (sliderRef.current) {
          const cardWidth = sliderRef.current.children[0].offsetWidth;
          const gap = 8; // Matches space-x-2 (8px)
          sliderRef.current.style.transform = `translateX(-${
            nextIndex * (cardWidth + gap)
          }px)`;
        }
        return nextIndex;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <section className="py-4 bg-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-0">
        <div className="overflow-hidden">
          <div
            ref={sliderRef}
            className="flex space-x-2 transition-transform duration-500 ease-in-out"
          >
            {[...features, ...features].map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={`${f.title}-${i}`}
                  className="flex-shrink-0 w-64 sm:w-56 md:w-max lg:w-max p-4 rounded-lg border border-gray-200 bg-white hover:shadow-md transition-all duration-300"
                >
                  <div
                    className={`${f.bgColor} w-10 h-10 rounded-full flex items-center justify-center mb-3`}
                  >
                    <Icon className="w-5 h-5 text-gray-700" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">
                    {f.title}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {f.subtitle}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceFeatures;
