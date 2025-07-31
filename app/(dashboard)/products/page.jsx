"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaSearch, FaPlus, FaBoxOpen } from "react-icons/fa";
import ProductForm from "@/components/inputs/ProductsForm";

 
 const ProductDashboard = () => {
const [prodUpload, setProdUpload] = useState(false);
  
  
  console.log(prodUpload);


  return (
    
    <>
    
    <div className=" relative p-6 md:p-10 w-full bg-gray-100 min-h-screen">
      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-2xl md:text-3xl font-semibold text-orange-500">
          Products Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your product listings
        </p>
      </motion.div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        {/* Search Bar */}
        <div className="flex items-center bg-white rounded-md shadow px-3 py-2 w-full md:w-1/2">
          <FaSearch className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full outline-none text-sm bg-transparent"
          />
        </div>

        {/* Add Product Button */}
        <motion.button onClick={()=>setProdUpload(true)}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-md shadow transition-all"
        >
          <FaPlus className="text-sm" />
          <span className="text-sm font-medium">Add Product</span>
        </motion.button>
      </div>

     

      {/* Product Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="overflow-auto bg-white shadow rounded-lg"
        >
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-semibold text-gray-600">
                Product
              </th>
              <th className="text-left p-4 font-semibold text-gray-600">
                Category
              </th>
              <th className="text-left p-4 font-semibold text-gray-600">
                Price
              </th>
              <th className="text-left p-4 font-semibold text-gray-600">
                Stock
              </th>
              <th className="text-left p-4 font-semibold text-gray-600">
                Status
              </th>
              <th className="text-left p-4 font-semibold text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {[...Array(6)].map((_, i) => (
              <tr key={i} className="border-t hover:bg-gray-50 transition-all">
                <td className="p-4 flex items-center gap-3">
                  <FaBoxOpen className="text-orange-400" />
                  <span className="font-medium text-gray-800">
                    Product #{i + 1}
                  </span>
                </td>
                <td className="p-4 text-gray-600">Electronics</td>
                <td className="p-4 text-gray-600">$199.99</td>
                <td className="p-4 text-gray-600">25</td>
                <td className="p-4">
                  <span className="inline-block px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                    Active
                  </span>
                </td>
                <td className="p-4">
                  <button className="text-sm text-orange-500 hover:underline mr-4">
                    Edit
                  </button>
                  <button className="text-sm text-red-500 hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
    {
      <ProductForm isOpen={prodUpload} onClose={()=>setProdUpload(false)}/>
    }
     </>
  );
};

export default ProductDashboard;
