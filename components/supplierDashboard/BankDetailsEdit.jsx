import React, { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

const BankDetailsEdit = ({
  profileForm,
  handleProfileChange,
  handleProfileSubmit,
  resetForm,
  isSubmitting,
  message,
  setIsEditing,
}) => {
  const [error, setError] = useState("");

  const validateForm = () => {
    if (!profileForm.bankName) {
      setError("Bank name is required");
      return false;
    }
    if (!profileForm.accountNumber) {
      setError("Account number is required");
      return false;
    }
    if (!profileForm.SwiftCode) {
      setError("SWIFT/BIC code is required");
      return false;
    }
    // Basic SWIFT code validation (8 or 11 characters)
    if (
      profileForm.SwiftCode &&
      !/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(
        profileForm.SwiftCode.toUpperCase()
      )
    ) {
      setError("Please enter a valid SWIFT/BIC code (8 or 11 characters)");
      return false;
    }
    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    try {
      const bankData = {
        bank_name: profileForm.bankName,
        bank_account_number: profileForm.accountNumber,
        bic_swiftCode: profileForm.SwiftCode.toUpperCase(),
        bank_address: profileForm.bankAddress,
      };

      console.log("Submitting bank details:", bankData);
      await handleProfileSubmit(bankData);
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving bank details:", err);
      setError(err.message || "Failed to save bank details");
    }
  };

  return (
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
            Edit Bank Details
          </h3>
          <button
            onClick={() => {
              resetForm();
              setIsEditing(false);
              setError("");
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-xs text-blue-800">
            <strong>Note:</strong> Your bank details are securely stored and
            will be used for payment processing. Ensure all information is
            accurate.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bank Name *
            </label>
            <input
              type="text"
              name="bankName"
              value={profileForm.bankName}
              onChange={handleProfileChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="e.g., Chase Bank, Bank of America"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Number *
            </label>
            <input
              type="text"
              name="accountNumber"
              value={profileForm.accountNumber}
              onChange={handleProfileChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
              placeholder="Enter your account number"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SWIFT/BIC Code *
            </label>
            <input
              type="text"
              name="SwiftCode"
              value={profileForm.SwiftCode}
              onChange={handleProfileChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono uppercase"
              placeholder="e.g., CHASUS33 or BOFAUS3N"
              maxLength="11"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              8 or 11 character code (e.g., CHASUS33XXX)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bank Address
            </label>
            <textarea
              name="bankAddress"
              value={profileForm.bankAddress}
              onChange={handleProfileChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              placeholder="Enter your bank's branch address"
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-600 text-sm text-center bg-red-50 p-2 rounded"
            >
              {error}
            </motion.div>
          )}

          {message.text && message.type === "error" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-600 text-sm text-center bg-red-50 p-2 rounded"
            >
              {message.text}
            </motion.div>
          )}

          {message.text && message.type === "success" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-green-600 text-sm text-center bg-green-50 p-2 rounded"
            >
              {message.text}
            </motion.div>
          )}

          <div className="flex gap-4 justify-center pt-2">
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`w-full py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "Saving..." : "Save Bank Details"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default BankDetailsEdit;
