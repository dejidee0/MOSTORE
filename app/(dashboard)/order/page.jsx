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
  avatar: idx % 3 === 0 ? "/avatar.jpg" : null,
}));

const orderItems = [
  { name: "Product UI/UX Kit", price: "$10,000", image: "/sneaker.jpg" },
  { name: "Product UI/UX Kit", price: "$10,000", image: "/product.jpg" },
  { name: "Product UI/UX Kit", price: "$10,000", image: "/chair.jpg" },
  { name: "Product UI/UX Kit", price: "$10,000", image: "/lamp.jpg" },
];

const Page = () => {
  const [selectedOrder, setSelectedOrder] = useState(orders[0]);

  return (
    <div className="min-h-screen bg-white p-4 flex flex-col lg:flex-row gap-6">
      {/* Orders Table */}
      <div className="flex-1 overflow-auto">
        <div className="flex justify-between items-center mb-4 gap-2 flex-wrap">
          <div className="flex gap-2">
            <button className="px-4 py-1.5 bg-gray-200 rounded">
              Any status
            </button>
            <button className="px-4 py-1.5 bg-gray-200 rounded">
              $50 - $2000
            </button>
          </div>
          <button className="flex items-center gap-1 px-4 py-1.5 bg-gray-200 rounded">
            Sort by Date <MdKeyboardArrowDown />
          </button>
        </div>

        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="text-left border-b text-sm text-gray-600">
              <th className="py-2">
                {" "}
                <input type="checkbox" /> Order
              </th>
              <th>Customer</th>
              <th>Status</th>
              <th>Total</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, idx) => (
              <tr
                key={idx}
                onClick={() => setSelectedOrder(order)}
                className={`cursor-pointer hover:bg-gray-100 border-b text-sm ${
                  selectedOrder?.id === order.id ? "bg-gray-100" : ""
                }`}
              >
                <td className="py-2">
                  <input type="checkbox" className="mr-2" /> Order
                </td>
                <td className="flex items-center gap-2 py-2">
                  {order.avatar ? (
                    <Image
                      src={order.avatar}
                      width={24}
                      height={24}
                      className="rounded-full"
                      alt="avatar"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-400 text-white text-xs flex items-center justify-center">
                      {order.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                  )}
                  {order.name}
                </td>
                <td>
                  <span
                    className={`text-xs px-2 py-1 rounded font-semibold ${
                      statusColors[order.status]
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td>{order.total}</td>
                <td>{order.date}</td>
                <td className="text-gray-500">...</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <motion.div
        key={selectedOrder?.id}
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full lg:w-96 bg-gray-100 rounded-lg p-4 shadow-md"
      >
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="font-semibold">
              Order #{selectedOrder?.id.toString().padStart(5, "0")}
            </p>
            <p className="text-xs text-gray-600">
              {selectedOrder?.date}, 15:25
            </p>
          </div>
          <span
            className={`text-xs px-2 py-1 rounded font-semibold ${
              statusColors[selectedOrder?.status]
            }`}
          >
            {selectedOrder?.status}
          </span>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <Image
            src={selectedOrder?.avatar || "/avatar.jpg"}
            width={50}
            height={50}
            className="rounded-full"
            alt="user"
          />
          <div>
            <p className="font-semibold">{selectedOrder?.name}</p>
            <div className="flex gap-2 mt-1 text-primary">
              <FaPhone className="cursor-pointer" />
              <FaEnvelope className="cursor-pointer" />
              <FaUser className="cursor-pointer" />
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-300 mb-4">
          {orderItems.map((item, i) => (
            <div key={i} className="flex justify-between items-center py-2">
              <div className="flex items-center gap-3">
                <Image
                  src={item.image}
                  width={40}
                  height={40}
                  alt="item"
                  className="rounded"
                />
                <p className="text-sm font-medium">{item.name}</p>
              </div>
              <p className="text-sm">{item.price}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-between font-semibold text-lg">
          <p>Total</p>
          <p>$10,000.00</p>
        </div>

        <div className="mt-4 flex gap-2">
          <button className="flex-1 py-2 bg-black text-white rounded hover:opacity-90">
            Track
          </button>
          <button className="flex-1 py-2 bg-primary text-white rounded hover:opacity-90">
            Refund
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Page;
