"use client";

import React from "react";
import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";
import TopBar from "@/components/TopBar";
import Link from "next/link";
import Image from "next/image";
import { FaStore, FaUsers, FaHandshake } from "react-icons/fa";
import { FaSackDollar } from "react-icons/fa6";
import { AiOutlineDollar } from "react-icons/ai";

const About = () => {
  return (
    <div className="min-h-screen bg-white w-full overflow-hidden font-raleway flex flex-col">
      <TopBar />
      <NavBar />

      {/* Breadcrumb */}
      <div className="bg-gray-100 w-full px-6 py-3 text-sm text-gray-600">
        <div className="max-w-7xl mx-auto">
          <span className="font-medium text-primary">
            <Link href="/">Home</Link>
          </span>{" "}
          / About
        </div>
      </div>

      {/* Main Content */}
      <main className="flex flex-col-reverse md:flex-row items-center justify-between max-w-7xl mx-auto px-6 py-20 gap-10">
        {/* Text Content */}
        <div className="w-full md:w-1/2 space-y-6">
          <h1 className="text-4xl font-bold text-gray-800">About Us</h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            We are a digital-first platform focused on building human-centered,
            scalable, and intuitive commerce solutions. From empowering sellers
            to enabling seamless transactions, our mission is rooted in
            innovation, trust, and simplicity.
          </p>
          <p className="text-gray-600 text-lg leading-relaxed">
            At our core, we believe technology should serve people. That’s why
            we design experiences that are fast, accessible, and delightful —
            for businesses and customers alike.
          </p>
        </div>

        {/* Image Section */}
        <div className="w-full md:w-1/2">
          <Image
            src="/about.png"
            alt="About Us"
            width={600}
            height={400}
            className="w-full h-auto rounded-xl shadow-lg"
            priority
          />
        </div>
      </main>

      {/* Stats Section */}
      <section className="w-full bg-gray-50 py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {
              icon: <FaStore size={28} />,
              value: "35k+",
              label: "Sellers active in our store",
            },
            {
              icon: <AiOutlineDollar size={28} />,
              value: "44k+",
              label: "Monthly Product Sales",
            },
            {
              icon: <FaUsers size={28} />,
              value: "53k+",
              label: "Customers using our platform",
            },
            {
              icon: <FaSackDollar size={28} />,
              value: "$100M+",
              label: "Annual Gross Sales",
            },
          ].map((item, index) => (
            <div
              key={index}
              className={`flex flex-col items-center justify-center text-center px-6 py-8 rounded-xl shadow-sm border border-gray-200 ${
                index === 1 ? "bg-primary text-white" : "bg-white text-gray-900"
              } transition duration-300`}
            >
              <div className="mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-200">
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full ${
                    index === 1
                      ? "bg-white text-primary"
                      : "bg-primary text-white"
                  }`}
                >
                  {item.icon}
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-1">{item.value}</h2>
              <p className="text-sm font-medium">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
