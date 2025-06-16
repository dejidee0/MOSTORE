"use client";

import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";

const incomeData = [
  { month: "Jan", value: 400 },
  { month: "Feb", value: 150 },
  { month: "Mar", value: 350 },
  { month: "Apr", value: 250 },
  { month: "May", value: 350 },
  { month: "Jun", value: 80 },
  { month: "Jul", value: 180 },
  { month: "Aug", value: 250 },
  { month: "Sep", value: 130 },
  { month: "Oct", value: 200 },
  { month: "Nov", value: 470 },
  { month: "Dec", value: 300 },
];

const IncomeChart = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full bg-white px-6 py-4 rounded-2xl shadow-md border flex flex-col gap-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Total Income</h2>
        <button className="bg-primary text-white text-sm px-4 py-1.5 rounded-md hover:bg-primary/90 transition">
          All Time
        </button>
      </div>

      {/* Bar Chart */}
      <div className="h-[300px] md:h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={incomeData}>
            <XAxis dataKey="month" stroke="#9ca3af" />
            <Tooltip
              cursor={{ fill: "transparent" }}
              contentStyle={{
                backgroundColor: "#1f2937",
                borderRadius: "8px",
                color: "#fff",
                border: "none",
                fontSize: "0.875rem",
              }}
              labelStyle={{ color: "#f3f4f6" }}
              itemStyle={{ color: "#fff" }}
            />
            <Bar dataKey="value" fill="#f97316" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default IncomeChart;
