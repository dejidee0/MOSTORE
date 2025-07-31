"use client";
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function CategoryDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const categories = [
    'Headlights & Lighting',
    'Interior Accessories',
    'Tires & Wheels',
    'Tools & Equipment',
    'Auto Safety & Security',
    'Garage Tools',
    'Original Battery Tools',
    'Phone Displays',
    'Battery and Adhesives',
    'Partdo Best Seller',
    'Top 100 Offers on Sale',
    'New Arrivals',
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // this function will be used to generate slug from category nname
//   const getCategorySlug = (category) => {
//     return category
//       .toLowerCase()
//       .replace(/ & /g, '-')
//       .replace(/ /g, '-')
//       .replace(/[^a-z0-9-]/g, '');
//   };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#FF6200] text-white font-bold uppercase text-sm rounded px-3 py-2 flex items-center justify-between w-[200px]"
      >
        <span>ALL CATEGORIES</span>
        <ChevronDown className="h-4 w-4 text-black ml-2" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-[200px] bg-white border border-[#D1D1D1] rounded py-2 px-4 z-20">
          <ul className="space-y-3">
            {categories.map((category, index) => (
              <li key={index} className="group flex justify-between items-center text-black text-sm hover:bg-gray-100">
                <Link href="#"
                //   href={`/category/${getCategorySlug(category)}`}
                  className="w-full block py-1"
                  onClick={() => setIsOpen(false)}
                >
                  {category}
                </Link>
                <ChevronRight className="h-4 w-4 text-black opacity-0 group-hover:opacity-100" />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}