"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Integrate with email service
    console.log("Newsletter signup:", email);
    setIsSubmitted(true);
    setEmail("");
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  return (
    <section className="py-16 px-4 bg-orange-500">
      <div className="container mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <Mail className="w-16 h-16 text-white mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">
            Stay Updated with Our Newsletter
          </h2>
          <p className="text-orange-100 text-lg mb-8">
            Get the latest deals, new arrivals, and exclusive offers delivered
            straight to your inbox.
          </p>

          {isSubmitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/20 text-white p-4 rounded-lg"
            >
              Thank you for subscribing! Check your email for confirmation.
            </motion.div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
            >
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 bg-white border-0 focus:ring-2 focus:ring-white"
              />
              <Button
                type="submit"
                className="bg-gray-800 hover:bg-gray-900 text-white px-8"
              >
                Subscribe
              </Button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
