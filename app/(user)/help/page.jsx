"use client";
import React, { useState } from "react";
import {
  ChevronDown,
  Search,
  HelpCircle,
  Package,
  Truck,
  CreditCard,
  RefreshCw,
  Shield,
  MessageCircle,
} from "lucide-react";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    type: "inquiry",
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const whatsappMessage = `
*${formData.type.toUpperCase()}* from Mostore FAQ

*Name:* ${formData.name}
*Email:* ${formData.email}
*Subject:* ${formData.subject}

*Message:*
${formData.message}

---
_Sent from Mostore Help Center_
    `.trim();

    const encodedMessage = encodeURIComponent(whatsappMessage);

    window.open(`https://wa.me/+33753602218?text=${encodedMessage}`, "_blank");
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Contact Support
      </h3>
      <div className="bg-orange-500 text-white p-4 rounded-t-2xl mb-4 text-center">
        <h2 className="text-2xl font-bold">NEED HELP?</h2>
        <p className="text-sm mt-2">
          If you have inquiries or need assistance, do not hesitate to chat with
          us.
        </p>
        <p className="text-sm mt-1">
          <strong>Live Chat Hours:</strong> We are available Monday to Friday (8
          am to 6 pm) and weekends (8 am to 5 pm). On Public Holidays, we are
          available between 9 am and 5 pm.
        </p>
      </div>
      <div className="flex justify-center mb-4">
        <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-full flex items-center gap-2 hover:bg-gray-300 transition">
          <MessageCircle className="w-4 h-4" /> Chat with us
        </button>
        <button className="bg-orange-500 text-white px-4 py-2 rounded-full flex items-center gap-2 ml-2 hover:bg-orange-600 transition">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            ></path>
          </svg>
          Call
        </button>
      </div>
      <p className="text-sm text-gray-600 mb-4 text-center">
        You can also reach us on 02018881106 from Monday to Friday (8 am to 6
        pm) and weekends (8 am to 5 pm). On Public Holidays, we are available
        between 9 am and 5 pm.
      </p>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="relative">
          <label className="text-xs text-gray-500 mb-1 block">Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50 text-sm"
            required
          >
            <option value="inquiry">General Inquiry</option>
            <option value="complaint">Complaint</option>
            <option value="suggestion">Suggestion</option>
            <option value="order">Order Issue</option>
            <option value="technical">Technical Support</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <label className="text-xs text-gray-500 mb-1 block">Name</label>
            <input
              type="text"
              name="name"
              placeholder="Your name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50 text-sm"
              required
            />
          </div>
          <div className="relative">
            <label className="text-xs text-gray-500 mb-1 block">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Your email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50 text-sm"
              required
            />
          </div>
        </div>

        <div className="relative">
          <label className="text-xs text-gray-500 mb-1 block">Subject</label>
          <input
            type="text"
            name="subject"
            placeholder="Subject"
            value={formData.subject}
            onChange={handleChange}
            className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50 text-sm"
            required
          />
        </div>

        <div className="relative">
          <label className="text-xs text-gray-500 mb-1 block">Message</label>
          <textarea
            name="message"
            placeholder="Tell us more about your inquiry..."
            value={formData.message}
            onChange={handleChange}
            rows="4"
            className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50 text-sm resize-none"
            required
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full bg-[#25D366] text-white py-3 px-4 rounded-xl font-medium hover:bg-[#1ebe5c] transition-colors duration-200 text-sm flex items-center justify-center gap-2 shadow-md"
        >
          <MessageCircle className="w-4 h-4" />
          Send via WhatsApp
        </button>
      </form>
    </div>
  );
};

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const faqData = [
    {
      id: 1,
      category: "Orders",
      icon: <Package className="w-4 h-4" />,
      question: "How do I place an order?",
      answer:
        "Browse our products, add items to your cart, and proceed to checkout. You can create an account or checkout as a guest. We accept all major payment methods including credit cards, PayPal, and Apple Pay.",
    },
    {
      id: 2,
      category: "Shipping",
      icon: <Truck className="w-4 h-4" />,
      question: "What are your shipping options?",
      answer:
        "We offer free standard shipping (3-5 business days) on orders over $50, express shipping (1-2 business days) for $9.99, and next-day delivery for $19.99. All orders include tracking.",
    },
    {
      id: 3,
      category: "Payment",
      icon: <CreditCard className="w-4 h-4" />,
      question: "What payment methods do you accept?",
      answer:
        "We accept Visa, MasterCard, American Express, Discover, PayPal, Apple Pay, Google Pay, and Shop Pay. All payments are processed securely through encrypted checkout.",
    },
    {
      id: 4,
      category: "Returns",
      icon: <RefreshCw className="w-4 h-4" />,
      question: "What is your return policy?",
      answer:
        "Returns are accepted within 30 days of delivery. Items must be unused and in original packaging. Returns are free and refunds are processed within 5-7 business days.",
    },
    {
      id: 5,
      category: "Account",
      icon: <Shield className="w-4 h-4" />,
      question: "Do I need to create an account?",
      answer:
        "Creating an account is optional but recommended. With an account, you can track orders, save favorites, view order history, and checkout faster on future purchases.",
    },
    {
      id: 6,
      category: "Support",
      icon: <MessageCircle className="w-4 h-4" />,
      question: "How can I contact customer support?",
      answer:
        "Our support team is available 24/7 via live chat, email at help@mostore.com, or phone at 1-800-MOSTORE. We typically respond to emails within 2 hours during business days.",
    },
  ];

  const filteredFAQs = faqData.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900">Help Center</h1>
        <p className="text-lg text-gray-600 mt-2">
          Find answers or contact support
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 px-4">
        <div>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for help..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredFAQs.map((faq, index) => (
              <div
                key={faq.id}
                className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all"
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full text-left px-5 py-4 flex justify-between items-center"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-orange-600">{faq.icon}</div>
                    <span className="font-medium text-gray-900">
                      {faq.question}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                      activeIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {activeIndex === index && (
                  <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}

            {filteredFAQs.length === 0 && searchTerm && (
              <div className="text-center py-12">
                <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No results found
                </h3>
                <p className="text-gray-600 mb-4">
                  We couldn’t find any FAQs matching "{searchTerm}"
                </p>
                <button
                  onClick={() => setSearchTerm("")}
                  className="text-orange-600 hover:text-orange-700 font-medium"
                >
                  View all questions
                </button>
              </div>
            )}
          </div>
        </div>

        <ContactForm />
      </div>
    </div>
  );
};

export default FAQ;
