// "use client";
// import React, { useState } from "react";
// import {
//   Search,
//   ChevronDown,
//   ChevronRight,
//   MessageCircle,
//   Phone,
//   Mail,
//   MapPin,
//   Clock,
//   ShoppingCart,
//   Package,
//   CreditCard,
//   Truck,
//   RefreshCw,
//   Shield,
//   User,
//   Settings,
//   HelpCircle,
//   Star,
//   CheckCircle,
//   AlertCircle,
//   Info,
//   ArrowRight,
// } from "lucide-react";

// export default function HelpPage() {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [expandedCategory, setExpandedCategory] = useState(null);
//   const [selectedFaq, setSelectedFaq] = useState(null);

//   const helpCategories = [
//     {
//       id: "orders",
//       title: "Orders & Payment",
//       icon: <ShoppingCart className="w-6 h-6" />,
//       color: "orange",
//       description: "Everything about placing orders and making payments",
//       faqs: [
//         {
//           question: "How do I place an order?",
//           answer:
//             "Browse our products, add items to your cart, proceed to checkout, fill in your details, and complete payment. You'll receive an order confirmation email immediately.",
//         },
//         {
//           question: "What payment methods do you accept?",
//           answer:
//             "We accept all major credit cards, debit cards, bank transfers, and mobile money payments including MTN Mobile Money and Airtel Money.",
//         },
//         {
//           question: "Can I modify or cancel my order?",
//           answer:
//             "You can modify or cancel your order within 30 minutes of placing it. After this time, contact our support team for assistance.",
//         },
//         {
//           question: "Why was my payment declined?",
//           answer:
//             "Payment can be declined due to insufficient funds, incorrect card details, or bank restrictions. Please verify your information and try again.",
//         },
//       ],
//     },
//     {
//       id: "shipping",
//       title: "Shipping & Delivery",
//       icon: <Truck className="w-6 h-6" />,
//       color: "blue",
//       description: "Information about delivery and shipping",
//       faqs: [
//         {
//           question: "How long does delivery take?",
//           answer:
//             "Delivery typically takes 2-5 business days within Lagos and 3-7 business days for other states in Nigeria, depending on your location.",
//         },
//         {
//           question: "How much does shipping cost?",
//           answer:
//             "Shipping is free for orders over ₦50,000. For orders below this amount, shipping costs range from ₦2,000-₦5,000 depending on your location.",
//         },
//         {
//           question: "Can I track my order?",
//           answer:
//             "Yes! Once your order is confirmed and dispatched, you'll receive a tracking number via SMS and email to monitor your delivery status.",
//         },
//         {
//           question: "What if I'm not available for delivery?",
//           answer:
//             "Our delivery partner will attempt delivery 3 times. If unsuccessful, the package will be held at the nearest pickup point for 5 days.",
//         },
//       ],
//     },
//     {
//       id: "returns",
//       title: "Returns & Refunds",
//       icon: <RefreshCw className="w-6 h-6" />,
//       color: "green",
//       description: "Return policy and refund procedures",
//       faqs: [
//         {
//           question: "What is your return policy?",
//           answer:
//             "We offer a 14-day return policy for unused items in original packaging. Electronics have a 7-day return window from delivery date.",
//         },
//         {
//           question: "How do I return an item?",
//           answer:
//             'Go to "My Orders", select the item to return, choose a reason, and schedule a pickup. Our delivery partner will collect the item at no extra cost.',
//         },
//         {
//           question: "When will I receive my refund?",
//           answer:
//             "Refunds are processed within 3-5 business days after we receive and inspect the returned item. The amount will be credited to your original payment method.",
//         },
//         {
//           question: "Can I exchange an item instead of returning it?",
//           answer:
//             "Yes, you can exchange items for a different size or color subject to availability. The exchange process takes 5-7 business days.",
//         },
//       ],
//     },
//     {
//       id: "account",
//       title: "Account & Security",
//       icon: <User className="w-6 h-6" />,
//       color: "purple",
//       description: "Manage your account and security settings",
//       faqs: [
//         {
//           question: "How do I create an account?",
//           answer:
//             'Click "Sign Up" on our homepage, enter your email and create a password. Verify your email address to activate your account.',
//         },
//         {
//           question: "I forgot my password, what should I do?",
//           answer:
//             'Click "Forgot Password" on the login page, enter your email address, and follow the reset instructions sent to your email.',
//         },
//         {
//           question: "How do I update my personal information?",
//           answer:
//             'Log into your account, go to "My Profile", and update your information. Remember to save changes before leaving the page.',
//         },
//         {
//           question: "Is my personal information secure?",
//           answer:
//             "Yes, we use industry-standard encryption to protect your data. We never share your personal information with third parties without your consent.",
//         },
//       ],
//     },
//     {
//       id: "products",
//       title: "Products & Services",
//       icon: <Package className="w-6 h-6" />,
//       color: "indigo",
//       description: "Product information and warranty details",
//       faqs: [
//         {
//           question: "Are all products genuine?",
//           answer:
//             "Yes, we only sell 100% authentic products sourced directly from manufacturers and authorized distributors.",
//         },
//         {
//           question: "Do products come with warranty?",
//           answer:
//             "Most products come with manufacturer warranty. Warranty periods vary by product and are clearly stated on each product page.",
//         },
//         {
//           question: "Can I get product recommendations?",
//           answer:
//             "Our product experts are available to help you choose the right products. Contact us via chat or phone for personalized recommendations.",
//         },
//         {
//           question: "What if I receive a defective product?",
//           answer:
//             "Contact us immediately with photos of the defect. We'll arrange a replacement or full refund within 24 hours of confirmation.",
//         },
//       ],
//     },
//     {
//       id: "technical",
//       title: "Technical Support",
//       icon: <Settings className="w-6 h-6" />,
//       color: "red",
//       description: "Website issues and technical assistance",
//       faqs: [
//         {
//           question: "Why can't I access my account?",
//           answer:
//             "This could be due to multiple failed login attempts, browser issues, or account suspension. Try clearing your browser cache or contact support.",
//         },
//         {
//           question: "The website is loading slowly, what can I do?",
//           answer:
//             "Clear your browser cache, check your internet connection, or try accessing the site from a different browser or device.",
//         },
//         {
//           question: "I'm having trouble with the mobile app",
//           answer:
//             "Ensure you have the latest version of the app. If issues persist, uninstall and reinstall the app or contact our technical support team.",
//         },
//         {
//           question: "Can I shop without creating an account?",
//           answer:
//             "Yes, you can shop as a guest, but creating an account allows you to track orders, save favorites, and enjoy faster checkout.",
//         },
//       ],
//     },
//   ];

//   const quickActions = [
//     {
//       title: "Track Your Order",
//       description: "Get real-time updates on your delivery",
//       icon: <Package className="w-8 h-8" />,
//       color: "bg-orange-500",
//       action: "/track-order",
//     },
//     {
//       title: "Return an Item",
//       description: "Easy returns within 14 days",
//       icon: <RefreshCw className="w-8 h-8" />,
//       color: "bg-green-500",
//       action: "/returns",
//     },
//     {
//       title: "Contact Support",
//       description: "Get help from our experts",
//       icon: <MessageCircle className="w-8 h-8" />,
//       color: "bg-blue-500",
//       action: "#contact",
//     },
//     {
//       title: "Check Warranty",
//       description: "Verify your product warranty",
//       icon: <Shield className="w-8 h-8" />,
//       color: "bg-purple-500",
//       action: "/warranty",
//     },
//   ];

//   const contactMethods = [
//     {
//       method: "Live Chat",
//       description: "Chat with our support team",
//       availability: "Available 24/7",
//       icon: <MessageCircle className="w-6 h-6" />,
//       action: "Start Chat",
//       color: "bg-green-500",
//     },
//     {
//       method: "Phone Support",
//       description: "+234 123 456 7890",
//       availability: "Mon-Sat, 8AM-8PM",
//       icon: <Phone className="w-6 h-6" />,
//       action: "Call Now",
//       color: "bg-blue-500",
//     },
//     {
//       method: "Email Support",
//       description: "support@mostore.com",
//       availability: "Response within 24hrs",
//       icon: <Mail className="w-6 h-6" />,
//       action: "Send Email",
//       color: "bg-orange-500",
//     },
//   ];

//   const filteredCategories = helpCategories.filter(
//     (category) =>
//       category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       category.faqs.some(
//         (faq) =>
//           faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
//       )
//   );

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Hero Section */}
//       <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white py-16">
//         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
//           <div className="mb-8">
//             <HelpCircle className="w-16 h-16 mx-auto mb-4 opacity-90" />
//             <h1 className="text-4xl md:text-5xl font-bold mb-4">
//               How can we help you?
//             </h1>
//             <p className="text-xl text-orange-100 max-w-2xl mx-auto">
//               Find answers to your questions, track your orders, or get in touch
//               with our support team
//             </p>
//           </div>

//           {/* Search Bar */}
//           <div className="relative max-w-2xl mx-auto">
//             <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
//               <Search className="h-6 w-6 text-gray-400" />
//             </div>
//             <input
//               type="text"
//               placeholder="Search for help topics, orders, products..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="w-full pl-12 pr-6 py-4 text-gray-900 bg-white rounded-2xl shadow-lg focus:ring-4 focus:ring-orange-200 focus:outline-none text-lg"
//             />
//           </div>

//           {/* Popular Searches */}
//           <div className="mt-6 flex flex-wrap justify-center gap-3">
//             {[
//               "Track Order",
//               "Return Item",
//               "Payment Issues",
//               "Delivery Time",
//             ].map((term) => (
//               <button
//                 key={term}
//                 onClick={() => setSearchQuery(term)}
//                 className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm hover:bg-white/30 transition-colors border border-white/30"
//               >
//                 {term}
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
//         {/* Quick Actions */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
//           {quickActions.map((action, index) => (
//             <div
//               key={index}
//               className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group border border-gray-100"
//             >
//               <div
//                 className={`${action.color} text-white p-3 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform`}
//               >
//                 {action.icon}
//               </div>
//               <h3 className="font-semibold text-gray-900 mb-2">
//                 {action.title}
//               </h3>
//               <p className="text-gray-600 text-sm mb-4">{action.description}</p>
//               <div className="flex items-center text-orange-600 font-medium text-sm group-hover:text-orange-700">
//                 Get Started
//                 <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
//               </div>
//             </div>
//           ))}
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* FAQ Categories */}
//           <div className="lg:col-span-2">
//             <h2 className="text-3xl font-bold text-gray-900 mb-8">
//               Frequently Asked Questions
//             </h2>

//             <div className="space-y-4">
//               {filteredCategories.map((category) => (
//                 <div
//                   key={category.id}
//                   className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
//                 >
//                   <button
//                     onClick={() =>
//                       setExpandedCategory(
//                         expandedCategory === category.id ? null : category.id
//                       )
//                     }
//                     className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
//                   >
//                     <div className="flex items-center gap-4">
//                       <div
//                         className={`text-${category.color}-600 bg-${category.color}-100 p-3 rounded-xl`}
//                       >
//                         {category.icon}
//                       </div>
//                       <div className="text-left">
//                         <h3 className="font-semibold text-gray-900 text-lg">
//                           {category.title}
//                         </h3>
//                         <p className="text-gray-600 text-sm">
//                           {category.description}
//                         </p>
//                       </div>
//                     </div>
//                     <ChevronDown
//                       className={`w-5 h-5 text-gray-400 transition-transform ${
//                         expandedCategory === category.id ? "rotate-180" : ""
//                       }`}
//                     />
//                   </button>

//                   {expandedCategory === category.id && (
//                     <div className="px-6 pb-6">
//                       <div className="space-y-3">
//                         {category.faqs.map((faq, faqIndex) => (
//                           <div
//                             key={faqIndex}
//                             className="border-l-4 border-orange-200 pl-4"
//                           >
//                             <button
//                               onClick={() =>
//                                 setSelectedFaq(
//                                   selectedFaq === `${category.id}-${faqIndex}`
//                                     ? null
//                                     : `${category.id}-${faqIndex}`
//                                 )
//                               }
//                               className="w-full text-left py-3 hover:text-orange-600 transition-colors"
//                             >
//                               <div className="flex items-center justify-between">
//                                 <span className="font-medium text-gray-800">
//                                   {faq.question}
//                                 </span>
//                                 <ChevronRight
//                                   className={`w-4 h-4 text-gray-400 flex-shrink-0 ml-2 transition-transform ${
//                                     selectedFaq === `${category.id}-${faqIndex}`
//                                       ? "rotate-90"
//                                       : ""
//                                   }`}
//                                 />
//                               </div>
//                             </button>
//                             {selectedFaq === `${category.id}-${faqIndex}` && (
//                               <div className="pb-4">
//                                 <p className="text-gray-600 leading-relaxed">
//                                   {faq.answer}
//                                 </p>
//                               </div>
//                             )}
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Contact Support Sidebar */}
//           <div className="space-y-6">
//             <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
//               <h3 className="font-bold text-gray-900 text-xl mb-4 flex items-center gap-2">
//                 <MessageCircle className="w-6 h-6 text-orange-600" />
//                 Need More Help?
//               </h3>
//               <p className="text-gray-600 mb-6">
//                 Can't find what you're looking for? Our support team is here to
//                 help you 24/7.
//               </p>

//               <div className="space-y-4">
//                 {contactMethods.map((contact, index) => (
//                   <div
//                     key={index}
//                     className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border border-gray-100"
//                   >
//                     <div
//                       className={`${contact.color} text-white p-2 rounded-lg flex-shrink-0`}
//                     >
//                       {contact.icon}
//                     </div>
//                     <div className="flex-1">
//                       <h4 className="font-semibold text-gray-900">
//                         {contact.method}
//                       </h4>
//                       <p className="text-gray-600 text-sm">
//                         {contact.description}
//                       </p>
//                       <p className="text-orange-600 text-xs font-medium">
//                         {contact.availability}
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Store Hours */}
//             <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
//               <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
//                 <Clock className="w-5 h-5 text-orange-600" />
//                 Support Hours
//               </h3>
//               <div className="space-y-3 text-sm">
//                 <div className="flex justify-between">
//                   <span className="text-gray-700">Monday - Friday</span>
//                   <span className="font-medium text-gray-900">
//                     8:00 AM - 8:00 PM
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-700">Saturday</span>
//                   <span className="font-medium text-gray-900">
//                     9:00 AM - 6:00 PM
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-700">Sunday</span>
//                   <span className="font-medium text-gray-900">
//                     10:00 AM - 4:00 PM
//                   </span>
//                 </div>
//               </div>
//               <div className="mt-4 p-3 bg-green-100 rounded-lg">
//                 <div className="flex items-center gap-2">
//                   <CheckCircle className="w-4 h-4 text-green-600" />
//                   <span className="text-green-800 text-sm font-medium">
//                     Live Chat Available 24/7
//                   </span>
//                 </div>
//               </div>
//             </div>

//             {/* Quick Links */}
//             <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
//               <h3 className="font-bold text-gray-900 text-lg mb-4">
//                 Quick Links
//               </h3>
//               <div className="space-y-3">
//                 {[
//                   { label: "Track Your Order", icon: Package },
//                   { label: "Return Policy", icon: RefreshCw },
//                   { label: "Shipping Info", icon: Truck },
//                   { label: "Payment Methods", icon: CreditCard },
//                   { label: "Privacy Policy", icon: Shield },
//                 ].map((link, index) => (
//                   <a
//                     key={index}
//                     href="#"
//                     className="flex items-center gap-3 text-gray-600 hover:text-orange-600 transition-colors group"
//                   >
//                     <link.icon className="w-4 h-4" />
//                     <span className="group-hover:underline">{link.label}</span>
//                     <ArrowRight className="w-3 h-3 ml-auto group-hover:translate-x-1 transition-transform" />
//                   </a>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Bottom CTA Section */}
//         <div className="mt-16 mb-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 text-white text-center">
//           <Star className="w-12 h-12 mx-auto mb-4 text-orange-200" />
//           <h3 className="text-2xl font-bold mb-2">Still need help?</h3>
//           <p className="text-orange-100 mb-6 max-w-2xl mx-auto">
//             Our customer service team is standing by to help you with any
//             questions or concerns. We're committed to providing you with the
//             best shopping experience possible.
//           </p>
//           <div className="flex flex-col sm:flex-row gap-4 justify-center">
//             <button className="px-6 py-3 bg-white text-orange-600 rounded-xl font-semibold hover:bg-orange-50 transition-colors">
//               Start Live Chat
//             </button>
//             <button className="px-6 py-3 bg-orange-700 text-white rounded-xl font-semibold hover:bg-orange-800 transition-colors border border-orange-400">
//               Call Support
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
import React from "react";

const page = () => {
  return <div>Help PAGE....COMING SOON...</div>;
};

export default page;
