"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  FaUsers,
  FaUserPlus,
  FaDollarSign,
  FaChartLine,
  FaShareAlt,
  FaUserCheck,
} from "react-icons/fa";
import { BsBoxArrowInRight } from "react-icons/bs";
import IncomeChart from "@/components/Dashboard/IncomeChart";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4 },
  }),
};

const stats = [
  {
    title: "Registered User",
    value: "11,502",
    icon: <FaUserCheck className="text-2xl" />,
  },
  {
    title: "Visitors Today",
    value: "1,000",
    icon: <FaUsers className="text-2xl" />,
  },
  {
    title: "New Users",
    value: "20",
    icon: <FaUserPlus className="text-2xl" />,
  },
  {
    title: "Total Refunds",
    value: "$1000",
    icon: <FaShareAlt className="text-2xl" />,
  },
  {
    title: "Sales Today",
    value: "$400",
    icon: <FaDollarSign className="text-2xl" />,
  },
  {
    title: "Total Earnings",
    value: "$700,000",
    icon: <BsBoxArrowInRight className="text-2xl" />,
  },
];

const popularProducts = Array(4).fill({
  name: "Product UI/UX Kit",
  amount: "$10,000",
});

const followers = [
  { name: "Facebook", value: 1500, color: "bg-blue-600" },
  { name: "X", value: 500, color: "bg-black" },
  { name: "YouTube", value: 3500, color: "bg-red-600" },
  { name: "Instagram", value: 600, color: "bg-pink-500" },
];

const page = () => {
  return (
    <div className="max-h-max bg-white p-4 md:p-6  flex flex-col gap-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            className="bg-primary text-white rounded-lg p-6 flex justify-between items-center shadow-md"
          >
            <div>
              <p className="text-sm font-semibold">{stat.title}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
            <div>{stat.icon}</div>
          </motion.div>
        ))}
      </div>

      {/* Total Income and Sidebar Section */}
      <div className="flex flex-col lg:flex-row gap-6 max-h-[370px]">
        {/* Income Chart */}
        <IncomeChart />
        {/* Right Sidebar */}
        <div className="w-full flex flex-col md:flex-row gap-6">
          {/* Popular Products */}
          <div className="bg-white border rounded-xl shadow-sm min-w-[300px]">
            <div className="bg-primary text-white font-semibold px-6 py-4 rounded-t-xl text-lg">
              Popular Products
            </div>
            <div className="px-6 py-4 space-y-4">
              {popularProducts.map((product, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center text-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full" />
                    <span className="text-gray-700">{product.name}</span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {product.amount}
                  </span>
                </div>
              ))}
              <button className="mt-4 w-full py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition">
                View All Products
              </button>
            </div>
          </div>

          {/* Followers */}
          <div className="bg-white border rounded-xl shadow-sm flex-1 px-6 py-4">
            <h2 className="font-semibold text-lg text-gray-800 mb-4">
              Total Followers
            </h2>
            <div className="space-y-4">
              {followers.map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>{item.name}</span>
                    <span className="font-semibold text-gray-800">
                      {item.value}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ease-in-out ${item.color}`}
                      style={{ width: `${(item.value / 3500) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
