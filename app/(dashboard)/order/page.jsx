"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaSearch, FaPhone, FaEnvelope, FaUser } from "react-icons/fa";
import { MdKeyboardArrowDown } from "react-icons/md";
import Image from "next/image";

const statusColors = {
  Paid: "bg-primary text-white",
  Delivered: "bg-yellow-400 text-black",
  Completed: "bg-green-700 text-white",
};

const orders = new Array(17).fill(null).map((_, idx) => ({
  id: idx + 1,
  name: "Lanky First Ideal Creativity",
  status: ["Paid", "Delivered", "Completed"][idx % 3],
  total: "$10,000",
  date: "Jan 8",
  avatar: idx % 3 === 0 ? "/about.jpg" : null,
}));

const orderItems = [
  { name: "Product UI/UX Kit", price: "$10,000", image: "/about.jpg" },
  { name: "Product UI/UX Kit", price: "$10,000", image: "/about.jpg" },
  { name: "Product UI/UX Kit", price: "$10,000", image: "/about.jpg" },
  { name: "Product UI/UX Kit", price: "$10,000", image: "/about.jpg" },
];

const Page = () => {
  const [selectedOrder, setSelectedOrder] = useState(orders[0]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-white p-4 md:p-6 flex flex-col lg:flex-row gap-6">
      {/* Orders Table (Desktop) */}
      <div className="flex-1 overflow-auto">
        <div className="flex justify-between items-center mb-4 gap-2 flex-wrap">
          <div className="flex gap-2">
            <button className="px-4 py-1.5 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
              Any status
            </button>
            <button className="px-4 py-1.5 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
              $50 - $2000
            </button>
          </div>
          <button className="flex items-center gap-1 px-4 py-1.5 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
            Sort by Date <MdKeyboardArrowDown />
          </button>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-hidden rounded-xl border shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-sm text-gray-600">
                <th className="py-3 pl-6 w-8">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="py-3 font-medium">Order</th>
                <th className="py-3 font-medium">Customer</th>
                <th className="py-3 font-medium">Status</th>
                <th className="py-3 font-medium">Total</th>
                <th className="py-3 font-medium">Date</th>
                <th className="py-3 pr-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order, idx) => (
                <tr
                  key={idx}
                  onClick={() => setSelectedOrder(order)}
                  className={`cursor-pointer hover:bg-gray-50 ${
                    selectedOrder?.id === order.id ? "bg-gray-50" : ""
                  }`}
                >
                  <td className="py-3 pl-6">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="py-3 text-sm font-medium text-gray-900">
                    #{order.id.toString().padStart(5, "0")}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      {order.avatar ? (
                        <div className="relative h-8 w-8 rounded-full overflow-hidden">
                          <Image
                            src={order.avatar}
                            fill
                            className="object-cover"
                            alt="avatar"
                          />
                        </div>
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-200 text-gray-600 text-xs flex items-center justify-center font-medium">
                          {order.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                      )}
                      <span className="text-sm font-medium">{order.name}</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        statusColors[order.status]
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-gray-900">{order.total}</td>
                  <td className="py-3 text-sm text-gray-500">{order.date}</td>
                  <td className="py-3 pr-6 text-gray-400">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4 8H12"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M8 12V4"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="space-y-3 lg:hidden">
          {orders.map((order) => (
            <div
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className={`p-4 rounded-xl border ${
                selectedOrder?.id === order.id
                  ? "border-primary bg-primary/5"
                  : "border-gray-200"
              } shadow-xs cursor-pointer transition-all`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {order.avatar ? (
                    <div className="relative h-10 w-10 rounded-full overflow-hidden">
                      <Image
                        src={order.avatar}
                        fill
                        className="object-cover"
                        alt="avatar"
                      />
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-200 text-gray-600 text-sm flex items-center justify-center font-medium">
                      {order.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold">
                      #{order.id.toString().padStart(5, "0")}
                    </p>
                    <p className="text-xs text-gray-500">{order.name}</p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    statusColors[order.status]
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <div className="flex justify-between text-sm pt-2">
                <div>
                  <span className="text-gray-500">Total: </span>
                  <span className="font-medium">{order.total}</span>
                </div>
                <div className="text-gray-500">{order.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <motion.div
        key={selectedOrder?.id}
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full lg:w-96 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden max-h-max\"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold">
                Order #{selectedOrder?.id.toString().padStart(5, "0")}
              </h3>
              <p className="text-sm text-gray-500">
                {selectedOrder?.date}, 15:25
              </p>
            </div>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                statusColors[selectedOrder?.status]
              }`}
            >
              {selectedOrder?.status}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 p-6 mb-6 bg-gray-50 rounded-lg">
            <div className="relative h-20 w-20 rounded-full border-2 border-primary/20 overflow-hidden">
              <Image
                src={selectedOrder?.avatar || "/about.jpg"}
                fill
                className="object-cover"
                alt="Customer avatar"
                priority
              />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedOrder?.name || "Customer Name"}
              </h3>
              <div className="flex justify-center gap-4 text-gray-500">
                <a
                  href="#"
                  className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <FaPhone className="text-lg" />
                </a>
                <a
                  href="#"
                  className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <FaEnvelope className="text-lg" />
                </a>
                <button className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                  <FaUser className="text-lg" />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <h4 className="font-medium">Order Items</h4>
            <div className="space-y-3">
              {orderItems.map((item, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 rounded-md overflow-hidden bg-gray-100">
                      <Image
                        src={item.image}
                        fill
                        className="object-cover"
                        alt={item.name}
                      />
                    </div>
                    <p className="text-sm font-medium">{item.name}</p>
                  </div>
                  <p className="text-sm font-medium">{item.price}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center border-t border-gray-200 pt-4 mb-6">
            <span className="font-semibold">Total</span>
            <span className="text-lg font-semibold">$10,000.00</span>
          </div>

          <div className="flex gap-3">
            <button className="flex-1 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium">
              Track
            </button>
            <button className="flex-1 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium">
              Refund
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Page;
