import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import countries from "./countries.json";
import AccountEdit from "./AccountEdit";

const AccountView = ({
  profile,
  setIsDeleteModalOpen,
  handleProfileChange,
  handleProfileSubmit,
  resetForm,
  isSubmitting, // Add isSubmitting prop
}) => {
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [isPersonalModalOpen, setIsPersonalModalOpen] = useState(false);
  const [billingForm, setBillingForm] = useState({
    firstName: "",
    lastName: "",
    streetAddress: "",
    zipCode: "",
    city: "",
    state: "",
    country: "",
    phone: "",
  });
  const [deliveryForm, setDeliveryForm] = useState({
    firstName: "",
    lastName: "",
    streetAddress: "",
    zipCode: "",
    city: "",
    state: "",
    country: "",
    phone: "",
  });
  const [error, setError] = useState("");

  // Update form states when profile data changes
  useEffect(() => {
    setBillingForm({
      firstName: profile.billingFirstName || "",
      lastName: profile.billingLastName || "",
      streetAddress: profile.billingStreetAddress || "",
      zipCode: profile.billingZipCode || "",
      city: profile.billingCity || "",
      state: profile.billingState || "",
      country: profile.billingCountry || "",
      phone: profile.billingPhone || "",
    });

    setDeliveryForm({
      firstName: profile.deliveryFirstName || "",
      lastName: profile.deliveryLastName || "",
      streetAddress: profile.deliveryStreetAddress || "",
      zipCode: profile.deliveryZipCode || "",
      city: profile.deliveryCity || "",
      state: profile.deliveryState || "",
      country: profile.deliveryCountry || "",
      phone: profile.deliveryPhone || "",
    });
  }, [profile]);

  const handleAddressChange = (e, setForm) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateAddressForm = (form, type) => {
    if (!form.firstName)
      return `${
        type === "billing" ? "Billing" : "Delivery"
      } first name is required`;
    if (!form.lastName)
      return `${
        type === "billing" ? "Billing" : "Delivery"
      } last name is required`;
    if (!form.streetAddress)
      return `${
        type === "billing" ? "Billing" : "Delivery"
      } street address is required`;
    if (!form.city)
      return `${type === "billing" ? "Billing" : "Delivery"} city is required`;
    if (!form.country)
      return `${
        type === "billing" ? "Billing" : "Delivery"
      } country is required`;
    return "";
  };

  const handleAddressSubmit = async (e, form, type) => {
    e.preventDefault();
    setError("");

    const validationError = validateAddressForm(form, type);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const profileData = {
        fullName: profile.fullName,
        phone: profile.phone,
        gender: profile.gender,
        dateOfBirth: profile.dateOfBirth,
        ...(type === "billing"
          ? {
              billing_first_name: form.firstName,
              billing_last_name: form.lastName,
              billing_street_address: form.streetAddress,
              billing_zip_code: form.zipCode,
              billing_city: form.city,
              billing_state: form.state,
              billing_country: form.country,
              billing_phone: form.phone,
            }
          : {
              delivery_first_name: form.firstName,
              delivery_last_name: form.lastName,
              delivery_street_address: form.streetAddress,
              delivery_zip_code: form.zipCode,
              delivery_city: form.city,
              delivery_state: form.state,
              delivery_country: form.country,
              delivery_phone: form.phone,
            }),
      };

      handleProfileChange({
        target: {
          name: type === "billing" ? "billingAddress" : "deliveryAddress",
          value: form,
        },
      });

      console.log("Submitting profile data:", profileData);
      await handleProfileSubmit(profileData);

      if (type === "billing") setIsBillingModalOpen(false);
      else setIsDeliveryModalOpen(false);
      window.location.reload();
    } catch (err) {
      console.error("Error saving address:", err);
      setError(err.message || "Failed to save address");
    }
  };

  return (
    <div className="">
      <div className="px-4 py-6">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Account Information
          </h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            Manage your personal information, preferences, and account settings
            all in one place.
          </p>
        </motion.div>

        <motion.div
          className="bg-white rounded-lg p-6 mb-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Personal details
            </h2>
            <motion.button
              onClick={() => setIsPersonalModalOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition"
            >
              Edit
            </motion.button>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-gray-900">
              {profile?.fullName || "John Doe"}
            </p>
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm text-green-600 font-medium">
                Verified
              </span>
            </div>
            <p className="text-gray-600 mt-2">
              {profile?.email || "user@example.com"}
            </p>
            {profile?.phone && <p className="text-gray-600">{profile.phone}</p>}
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="text-sm text-red-600 hover:text-red-800 underline block"
            >
              Delete account
            </button>
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-lg p-6 mb-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Billing address
            </h2>
            <motion.button
              onClick={() => setIsBillingModalOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition"
            >
              Edit
            </motion.button>
          </div>
          <p className="text-gray-600 text-sm">
            {profile?.billingFirstName && profile?.billingLastName
              ? `${profile.billingFirstName} ${profile.billingLastName}, ${profile.billingStreetAddress}, ${profile.billingCity}, ${profile.billingState} ${profile.billingZipCode}, ${profile.billingCountry}`
              : "No billing address on file. Add one to speed up checkout."}
          </p>
        </motion.div>

        <motion.div
          className="bg-white rounded-lg p-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Delivery address
            </h2>
            <motion.button
              onClick={() => setIsDeliveryModalOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition"
            >
              Edit
            </motion.button>
          </div>
          <p className="text-gray-600 text-sm">
            {profile?.deliveryFirstName && profile?.deliveryLastName
              ? `${profile.deliveryFirstName} ${profile.deliveryLastName}, ${profile.deliveryStreetAddress}, ${profile.deliveryCity}, ${profile.deliveryState} ${profile.deliveryZipCode}, ${profile.deliveryCountry}`
              : "No delivery address on file. Add one for faster delivery."}
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-600 text-sm mt-4 text-center"
          >
            {error}
          </motion.div>
        )}

        <AnimatePresence>
          {isPersonalModalOpen && (
            <AccountEdit
              profileForm={profile}
              handleProfileChange={handleProfileChange}
              handleProfileSubmit={handleProfileSubmit}
              resetForm={resetForm}
              isSubmitting={isSubmitting} // Pass isSubmitting to AccountEdit
              message={{ type: "", text: "" }}
              setIsEditing={setIsPersonalModalOpen}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isBillingModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4"
            >
              <motion.div
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 100 }}
                className="bg-white max-h-[85vh] overflow-y-auto rounded-t-2xl p-6 w-full max-w-md mx-auto shadow-2xl"
              >
                <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Edit Billing Address
                  </h3>
                  <button
                    onClick={() => setIsBillingModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>
                <form
                  onSubmit={(e) =>
                    handleAddressSubmit(e, billingForm, "billing")
                  }
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={billingForm.firstName}
                      onChange={(e) => handleAddressChange(e, setBillingForm)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={billingForm.lastName}
                      onChange={(e) => handleAddressChange(e, setBillingForm)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="streetAddress"
                      value={billingForm.streetAddress}
                      onChange={(e) => handleAddressChange(e, setBillingForm)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Zip Code
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={billingForm.zipCode}
                      onChange={(e) => handleAddressChange(e, setBillingForm)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={billingForm.city}
                      onChange={(e) => handleAddressChange(e, setBillingForm)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State/Province/Region
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={billingForm.state}
                      onChange={(e) => handleAddressChange(e, setBillingForm)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country *
                    </label>
                    <select
                      name="country"
                      value={billingForm.country}
                      onChange={(e) => handleAddressChange(e, setBillingForm)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    >
                      <option value="">Select a country</option>
                      {countries.map((country) => (
                        <option key={country.code} value={country.name}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={billingForm.phone}
                      onChange={(e) => handleAddressChange(e, setBillingForm)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                  >
                    Save Billing Address
                  </motion.button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isDeliveryModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4"
            >
              <motion.div
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 100 }}
                className="bg-white max-h-[85vh] overflow-y-auto rounded-t-2xl p-6 w-full max-w-md mx-auto shadow-2xl"
              >
                <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Edit Delivery Address
                  </h3>
                  <button
                    onClick={() => setIsDeliveryModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>
                <form
                  onSubmit={(e) =>
                    handleAddressSubmit(e, deliveryForm, "delivery")
                  }
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={deliveryForm.firstName}
                      onChange={(e) => handleAddressChange(e, setDeliveryForm)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={deliveryForm.lastName}
                      onChange={(e) => handleAddressChange(e, setDeliveryForm)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="streetAddress"
                      value={deliveryForm.streetAddress}
                      onChange={(e) => handleAddressChange(e, setDeliveryForm)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Zip Code
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={deliveryForm.zipCode}
                      onChange={(e) => handleAddressChange(e, setDeliveryForm)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={deliveryForm.city}
                      onChange={(e) => handleAddressChange(e, setDeliveryForm)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State/Province/Region
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={deliveryForm.state}
                      onChange={(e) => handleAddressChange(e, setDeliveryForm)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country *
                    </label>
                    <select
                      name="country"
                      value={deliveryForm.country}
                      onChange={(e) => handleAddressChange(e, setDeliveryForm)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    >
                      <option value="">Select a country</option>
                      {countries.map((country) => (
                        <option key={country.code} value={country.name}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={deliveryForm.phone}
                      onChange={(e) => handleAddressChange(e, setDeliveryForm)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                  >
                    Save Delivery Address
                  </motion.button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AccountView;
