"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [ordersCount, setOrdersCount] = useState({});
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from("profiles")
          .select("*")
          .eq("role", "customer");

        if (searchTerm) {
          query = query.or(
            `full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%`
          );
        }

        const { data, error } = await query;
        if (error) throw error;

        setCustomers(data || []);

        // Fetch order counts for each customer
        if (data?.length) {
          const customerIds = data.map((c) => c.id);
          const { data: orders } = await supabase
            .from("orders")
            .select("customer_id")
            .in("customer_id", customerIds);

          const counts = orders?.reduce((acc, order) => {
            acc[order.customer_id] = (acc[order.customer_id] || 0) + 1;
            return acc;
          }, {});

          setOrdersCount(counts || {});
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [searchTerm]);

  const toggleCustomerStatus = async (customerId, currentStatus) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: !currentStatus })
        .eq("id", customerId);

      if (error) throw error;

      setCustomers(
        customers.map((customer) =>
          customer.id === customerId
            ? { ...customer, is_active: !currentStatus }
            : customer
        )
      );

      if (selectedCustomer?.id === customerId) {
        setSelectedCustomer({ ...selectedCustomer, is_active: !currentStatus });
      }

      alert(
        `Customer ${!currentStatus ? "enabled" : "disabled"} successfully!`
      );
    } catch (error) {
      console.error("Error updating customer status:", error);
      alert("Error updating customer status. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const viewOrderHistory = (customerId) => {
    router.push(`/admin/orders?customer_id=${customerId}`);
  };

  const openProfileModal = (customer) => {
    setSelectedCustomer(customer);
    setShowProfileModal(true);
  };

  const getCustomerInitials = (name) => {
    if (!name) return "C";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-orange-500 font-semibold">
        Loading customers...
      </div>
    );
  }

  return (
    <div className="p-6 md:pt-10 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-orange-500">Customers</h1>
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search customers..."
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {customers.length === 0 ? (
        <div className="text-gray-600 bg-white p-8 rounded-xl text-center">
          No customers found. {searchTerm && "Try a different search term."}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {customers.map((customer) => (
            <div
              key={customer.id}
              className={`bg-white shadow-lg rounded-xl p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col ${
                customer.is_active === false ? "opacity-60 bg-gray-50" : ""
              }`}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-15 h-15 shrink-0">
                  {customer.avatar_url ? (
                    <Image
                      src={customer.avatar_url}
                      alt={customer.full_name || "Customer Avatar"}
                      width={60}
                      height={60}
                      className="rounded-full border-2 border-orange-500 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/assets/default-avatar.png";
                      }}
                    />
                  ) : (
                    <div className="w-15 h-15 rounded-full border-2 border-orange-500 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-xl font-semibold">
                        {getCustomerInitials(customer.full_name)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-gray-800 truncate">
                    {customer.full_name || "No Name"}
                    {customer.is_active === false && (
                      <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                        Disabled
                      </span>
                    )}
                  </h2>
                  <p className="text-sm text-gray-500 truncate">
                    {customer.email}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-700 mb-4">
                <p className="truncate">
                  <span className="font-medium text-orange-500">Phone:</span>{" "}
                  {customer.phone || "—"}
                </p>
                <p className="truncate">
                  <span className="font-medium text-orange-500">Orders:</span>{" "}
                  {ordersCount[customer.id] || 0}
                </p>
                <p>
                  <span className="font-medium text-orange-500">Joined:</span>{" "}
                  {new Date(customer.created_at).toLocaleDateString()}
                </p>
                <p>
                  <span className="font-medium text-orange-500">Status:</span>{" "}
                  <span
                    className={`font-medium ${
                      customer.is_active === false
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {customer.is_active === false ? "Disabled" : "Active"}
                  </span>
                </p>
              </div>

              <div className="mt-auto space-y-2">
                <button
                  onClick={() => openProfileModal(customer)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-medium transition-colors"
                >
                  View Profile
                </button>
                <button
                  onClick={() => viewOrderHistory(customer.id)}
                  className="w-full bg-white hover:bg-gray-50 text-orange-500 py-2 rounded-lg font-medium border border-orange-500 transition-colors"
                >
                  View Orders ({ordersCount[customer.id] || 0})
                </button>

                <button
                  onClick={() =>
                    toggleCustomerStatus(customer.id, customer.is_active)
                  }
                  disabled={actionLoading}
                  className={`w-full py-2 rounded-lg font-medium transition-colors ${
                    customer.is_active === false
                      ? "bg-green-100 hover:bg-green-200 text-green-700 border border-green-300"
                      : "bg-red-100 hover:bg-red-200 text-red-700 border border-red-300"
                  } disabled:opacity-50`}
                >
                  {customer.is_active === false
                    ? "Enable Account"
                    : "Disable Account"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showProfileModal && selectedCustomer && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white/90 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/50 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white/80 backdrop-blur-lg px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-orange-500">
                {selectedCustomer.full_name || "Customer Details"}
                {selectedCustomer.is_active === false && (
                  <span className="ml-3 text-sm bg-red-100 text-red-800 px-3 py-1 rounded-full">
                    Disabled
                  </span>
                )}
              </h2>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex justify-center mb-6">
                    {selectedCustomer.avatar_url ? (
                      <Image
                        src={selectedCustomer.avatar_url}
                        alt={selectedCustomer.full_name || "Customer Avatar"}
                        width={120}
                        height={120}
                        className="rounded-full border-4 border-orange-500 object-cover"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full border-4 border-orange-500 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-4xl font-semibold">
                          {getCustomerInitials(selectedCustomer.full_name)}
                        </span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Contact Information
                  </h3>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {selectedCustomer.email || "—"}
                    </p>
                    <p>
                      <span className="font-medium">Phone:</span>{" "}
                      {selectedCustomer.phone || "—"}
                    </p>
                    <p>
                      <span className="font-medium">Username:</span>{" "}
                      {selectedCustomer.username || "—"}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Billing Address
                    </h3>
                    <div className="space-y-2">
                      <p>
                        <span className="font-medium">Name:</span>{" "}
                        {selectedCustomer.billing_first_name}{" "}
                        {selectedCustomer.billing_last_name || "—"}
                      </p>
                      <p>
                        <span className="font-medium">Address:</span>{" "}
                        {selectedCustomer.billing_street_address || "—"}
                      </p>
                      <p>
                        <span className="font-medium">City:</span>{" "}
                        {selectedCustomer.billing_city || "—"}
                      </p>
                      <p>
                        <span className="font-medium">State:</span>{" "}
                        {selectedCustomer.billing_state || "—"}
                      </p>
                      <p>
                        <span className="font-medium">Country:</span>{" "}
                        {selectedCustomer.billing_country || "—"}
                      </p>
                      <p>
                        <span className="font-medium">ZIP:</span>{" "}
                        {selectedCustomer.billing_zip_code || "—"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Delivery Address
                    </h3>
                    <div className="space-y-2">
                      <p>
                        <span className="font-medium">Name:</span>{" "}
                        {selectedCustomer.delivery_first_name}{" "}
                        {selectedCustomer.delivery_last_name || "—"}
                      </p>
                      <p>
                        <span className="font-medium">Address:</span>{" "}
                        {selectedCustomer.delivery_street_address || "—"}
                      </p>
                      <p>
                        <span className="font-medium">City:</span>{" "}
                        {selectedCustomer.delivery_city || "—"}
                      </p>
                      <p>
                        <span className="font-medium">State:</span>{" "}
                        {selectedCustomer.delivery_state || "—"}
                      </p>
                      <p>
                        <span className="font-medium">Country:</span>{" "}
                        {selectedCustomer.delivery_country || "—"}
                      </p>
                      <p>
                        <span className="font-medium">ZIP:</span>{" "}
                        {selectedCustomer.delivery_zip_code || "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Account Information
                </h3>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Gender:</span>{" "}
                    {selectedCustomer.gender
                      ? selectedCustomer.gender.charAt(0).toUpperCase() +
                        selectedCustomer.gender.slice(1)
                      : "—"}
                  </p>
                  <p>
                    <span className="font-medium">Date of Birth:</span>{" "}
                    {selectedCustomer.date_of_birth
                      ? new Date(
                          selectedCustomer.date_of_birth
                        ).toLocaleDateString()
                      : "—"}
                  </p>
                  <p>
                    <span className="font-medium">Total Orders:</span>{" "}
                    {ordersCount[selectedCustomer.id] || 0}
                  </p>
                  <p>
                    <span className="font-medium">Status:</span>{" "}
                    <span
                      className={`font-medium ${
                        selectedCustomer.is_active === false
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {selectedCustomer.is_active === false
                        ? "Disabled"
                        : "Active"}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium">Member Since:</span>{" "}
                    {new Date(selectedCustomer.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-between">
                <div className="flex gap-3">
                  <button
                    onClick={() => viewOrderHistory(selectedCustomer.id)}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                  >
                    View Order History
                  </button>
                  <button
                    onClick={() =>
                      toggleCustomerStatus(
                        selectedCustomer.id,
                        selectedCustomer.is_active
                      )
                    }
                    disabled={actionLoading}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                      selectedCustomer.is_active === false
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : "bg-red-500 hover:bg-red-600 text-white"
                    }`}
                  >
                    {selectedCustomer.is_active === false
                      ? "Enable Account"
                      : "Disable Account"}
                  </button>
                </div>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
