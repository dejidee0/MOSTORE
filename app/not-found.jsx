"use client";

import React from "react";
import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";
import TopBar from "@/components/TopBar";
import Link from "next/link";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 w-full overflow-hidden font-raleway flex flex-col">
      <TopBar />
      <NavBar />

      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="text-center max-w-xl mx-auto space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800">404</h1>
          <p className="text-xl md:text-2xl text-gray-600 font-medium">
            Oops! Page not found.
          </p>
          <p className="text-sm text-gray-500">
            The page you’re looking for doesn’t exist or has been moved.
          </p>

          <Link href="/" passHref>
            <button className="mt-6 inline-block bg-primary hover:bg-primary-dark text-white font-medium px-6 py-3 rounded-md transition duration-200">
              Go back to Home
            </button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
