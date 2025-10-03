"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase-client";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSearch,
  FiFilter,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiPackage,
  FiCalendar,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCreditCard,
  FiTruck,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiTrash2,
  FiEye,
  FiToggleLeft,
  FiToggleRight,
} from "react-icons/fi";

export default function SuppliersPage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [productsCount, setProductsCount] = useState({});
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [profileProducts, setProfileProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [sortBy, setSortBy] = useState("full_name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("profiles")
        .select(
          "id, full_name, email, username, phone, address, bank_name, bank_account_number, created_at, is_active, is_approved, gender, date_of_birth, billing_first_name, billing_last_name, billing_street_address, billing_zip_code, billing_city, billing_state, billing_country, billing_phone, delivery_first_name, delivery_last_name, delivery_street_address, delivery_zip_code, delivery_city, delivery_state, delivery_country, delivery_phone"
        )
        .eq("is_supplier", true);

      if (debouncedSearchTerm) {
        query = query.or(
          `full_name.ilike.%${debouncedSearchTerm}%,email.ilike.%${debouncedSearchTerm}%,username.ilike.%${debouncedSearchTerm}%`
        );
      }

      if (filterStatus !== "all") {
        if (filterStatus === "approved") query = query.eq("is_approved", true);
        if (filterStatus === "pending") query = query.eq("is_approved", false);
        if (filterStatus === "disabled") query = query.eq("is_active", false);
      }

      const { data, error } = await query;
      if (error) throw error;

      data.sort((a, b) => {
        const aValue = a[sortBy] || "";
        const bValue = b[sortBy] || "";
        if (sortBy === "created_at" || sortBy === "date_of_birth") {
          return sortOrder === "asc"
            ? new Date(aValue) - new Date(bValue)
            : new Date(bValue) - new Date(aValue);
        }
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      });

      setProfiles(data || []);

      if (data?.length) {
        const { data: counts } = await supabase.rpc(
          "get_products_count_by_supplier",
          { supplier_ids: data.map((p) => p.id) }
        );

        const countsMap = counts?.reduce(
          (acc, item) => ({ ...acc, [item.supplier_id]: item.count }),
          {}
        );

        setProductsCount(countsMap || {});
      }
    } catch (error) {
      console.error("Error fetching profiles:", error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, sortBy, sortOrder, filterStatus]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const fetchProfileProducts = useCallback(async (profileId) => {
    setProductsLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select(
          "id, name, sku, price, stock_quantity, is_active, created_at, images"
        )
        .eq("supplier_id", profileId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProfileProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  const toggleVendorStatus = useCallback(
    async (vendorId, currentStatus) => {
      setActionLoading(true);
      try {
        const newStatus = !currentStatus;
        const { error } = await supabase
          .from("profiles")
          .update({ is_active: newStatus })
          .eq("id", vendorId);

        if (error) throw error;

        setProfiles((prev) =>
          prev.map((profile) =>
            profile.id === vendorId
              ? { ...profile, is_active: newStatus }
              : profile
          )
        );

        if (selectedProfile?.id === vendorId) {
          setSelectedProfile((prev) => ({ ...prev, is_active: newStatus }));
        }

        alert(`Supplier ${newStatus ? "enabled" : "disabled"} successfully!`);
      } catch (error) {
        console.error("Error updating supplier status:", error);
        alert("Error updating supplier status. Please try again.");
      } finally {
        setActionLoading(false);
      }
    },
    [selectedProfile]
  );

  const approveVendor = useCallback(
    async (vendorId) => {
      setActionLoading(true);
      try {
        const { error } = await supabase
          .from("profiles")
          .update({ is_approved: true })
          .eq("id", vendorId);

        if (error) throw error;

        setProfiles((prev) =>
          prev.map((profile) =>
            profile.id === vendorId
              ? { ...profile, is_approved: true }
              : profile
          )
        );

        if (selectedProfile?.id === vendorId) {
          setSelectedProfile((prev) => ({ ...prev, is_approved: true }));
        }

        alert("Supplier approved successfully!");
      } catch (error) {
        console.error("Error approving supplier:", error);
        alert("Error approving supplier. Please try again.");
      } finally {
        setActionLoading(false);
      }
    },
    [selectedProfile]
  );

  const deleteVendor = useCallback(
    async (vendorId) => {
      setActionLoading(true);
      try {
        const productCount = productsCount[vendorId] || 0;

        if (productCount > 0) {
          const confirmDelete = confirm(
            `This supplier has ${productCount} products. Deleting the supplier will also remove all their products. Are you sure you want to proceed?`
          );
          if (!confirmDelete) {
            setActionLoading(false);
            return;
          }

          const { error: productsError } = await supabase
            .from("products")
            .delete()
            .eq("supplier_id", vendorId);

          if (productsError) throw productsError;
        }

        const { error } = await supabase
          .from("profiles")
          .delete()
          .eq("id", vendorId);

        if (error) throw error;

        setProfiles((prev) =>
          prev.filter((profile) => profile.id !== vendorId)
        );

        if (selectedProfile?.id === vendorId) {
          setSelectedProfile(null);
          setShowProfileModal(false);
          setShowProductsModal(false);
        }

        setShowDeleteModal(false);
        alert("Supplier deleted successfully!");
      } catch (error) {
        console.error("Error deleting supplier:", error);
        alert("Error deleting supplier. Please try again.");
      } finally {
        setActionLoading(false);
      }
    },
    [productsCount, selectedProfile]
  );

  const openProfileModal = useCallback((profile) => {
    setSelectedProfile(profile);
    setShowProfileModal(true);
  }, []);

  const openProductsModal = useCallback(
    async (profile) => {
      setSelectedProfile(profile);
      await fetchProfileProducts(profile.id);
      setShowProductsModal(true);
    },
    [fetchProfileProducts]
  );

  const openDeleteModal = useCallback((profile) => {
    setSelectedProfile(profile);
    setShowDeleteModal(true);
  }, []);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const stats = useMemo(() => {
    const total = profiles.length;
    const approved = profiles.filter((p) => p.is_approved).length;
    const pending = profiles.filter((p) => !p.is_approved).length;
    const active = profiles.filter((p) => p.is_active).length;
    return { total, approved, pending, active };
  }, [profiles]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="h-16 w-16 border-4 border-orange-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">
          Suppliers Dashboard
        </h1>
        <p className="text-gray-600">
          Manage and monitor your supplier network
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {[
          {
            label: "Total Suppliers",
            value: stats.total,
            icon: FiUser,
            color: "blue",
          },
          {
            label: "Approved",
            value: stats.approved,
            icon: FiCheckCircle,
            color: "green",
          },
          {
            label: "Pending",
            value: stats.pending,
            icon: FiClock,
            color: "yellow",
          },
          {
            label: "Active",
            value: stats.active,
            icon: FiToggleRight,
            color: "orange",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`h-6 w-6 text-${stat.color}-500`} />
              <span className={`text-3xl font-bold text-${stat.color}-600`}>
                {stat.value}
              </span>
            </div>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4 mb-6"
      >
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or username..."
            className="w-full pl-12 pr-4 py-3.5 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-6 py-3.5 rounded-xl shadow-sm transition-all flex items-center gap-2 font-medium ${
            showFilters
              ? "bg-orange-500 text-white"
              : "bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-orange-50"
          }`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <FiFilter className="h-5 w-5" />
          Filters
        </motion.button>
      </motion.div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Sort By
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: "full_name", label: "Name" },
                      { value: "created_at", label: "Join Date" },
                      { value: "email", label: "Email" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleSort(option.value)}
                        className={`w-full py-2.5 px-4 rounded-lg text-sm font-medium text-left flex items-center justify-between transition-all ${
                          sortBy === option.value
                            ? "bg-orange-500 text-white shadow-sm"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {option.label}
                        {sortBy === option.value &&
                          (sortOrder === "asc" ? (
                            <FiChevronUp className="h-4 w-4" />
                          ) : (
                            <FiChevronDown className="h-4 w-4" />
                          ))}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Status Filter
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full py-2.5 px-4 rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 border border-gray-200 transition-all"
                  >
                    <option value="all">All Suppliers</option>
                    <option value="approved">Approved Only</option>
                    <option value="pending">Pending Only</option>
                    <option value="disabled">Disabled Only</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suppliers Grid */}
      {profiles.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/80 backdrop-blur-sm p-12 rounded-2xl text-center shadow-sm border border-gray-100"
        >
          <FiAlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">
            No suppliers found. {searchTerm && "Try adjusting your search."}
          </p>
        </motion.div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {profiles.map((profile, index) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4 }}
              className={`relative bg-white/90 backdrop-blur-sm shadow-sm rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 ${
                !profile.is_active ? "opacity-60" : ""
              }`}
            >
              {/* Status Badge */}
              <div className="absolute top-4 right-4 flex flex-col gap-1">
                {!profile.is_approved && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                    <FiClock className="h-3 w-3" />
                    Pending
                  </span>
                )}
                {!profile.is_active && (
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                    <FiToggleLeft className="h-3 w-3" />
                    Disabled
                  </span>
                )}
              </div>

              {/* Avatar and Basic Info */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-4">
                  {profile.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt={profile.full_name || "Supplier"}
                      width={80}
                      height={80}
                      className="rounded-full border-4 border-orange-500 object-cover shadow-md"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full border-4 border-orange-500 bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center shadow-md">
                      <span className="text-orange-600 text-2xl font-bold">
                        {profile.full_name?.[0]?.toUpperCase() || "S"}
                      </span>
                    </div>
                  )}
                </div>
                <h2 className="text-lg font-bold text-gray-900 text-center mb-1">
                  {profile.full_name || "Unnamed Supplier"}
                </h2>
                <p className="text-sm text-gray-500 text-center truncate w-full px-2">
                  {profile.email}
                </p>
              </div>

              {/* Info Grid */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-2">
                    <FiPhone className="h-4 w-4 text-orange-500" />
                    Phone
                  </span>
                  <span className="font-medium text-gray-900">
                    {profile.phone || "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-2">
                    <FiPackage className="h-4 w-4 text-orange-500" />
                    Products
                  </span>
                  <span className="font-medium text-gray-900">
                    {productsCount[profile.id] || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-2">
                    <FiCalendar className="h-4 w-4 text-orange-500" />
                    Joined
                  </span>
                  <span className="font-medium text-gray-900">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openProfileModal(profile)}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-2.5 rounded-lg font-medium transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <FiEye className="h-4 w-4" />
                  View Profile
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openProductsModal(profile)}
                  className="w-full bg-white hover:bg-gray-50 text-orange-600 py-2.5 rounded-lg font-medium border-2 border-orange-500 transition-all flex items-center justify-center gap-2"
                >
                  <FiPackage className="h-4 w-4" />
                  View Products
                </motion.button>
                <div className="grid grid-cols-2 gap-2">
                  {!profile.is_approved ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => approveVendor(profile.id)}
                      disabled={actionLoading}
                      className="bg-green-100 hover:bg-green-200 text-green-700 py-2 rounded-lg font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                      <FiCheckCircle className="h-4 w-4" />
                      Approve
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        toggleVendorStatus(profile.id, profile.is_active)
                      }
                      disabled={actionLoading}
                      className={`py-2 rounded-lg font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-1 ${
                        !profile.is_active
                          ? "bg-green-100 hover:bg-green-200 text-green-700"
                          : "bg-yellow-100 hover:bg-yellow-200 text-yellow-700"
                      }`}
                    >
                      {profile.is_active ? (
                        <>
                          <FiToggleLeft className="h-4 w-4" />
                          Disable
                        </>
                      ) : (
                        <>
                          <FiToggleRight className="h-4 w-4" />
                          Enable
                        </>
                      )}
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openDeleteModal(profile)}
                    disabled={actionLoading}
                    className="bg-red-100 hover:bg-red-200 text-red-700 py-2 rounded-lg font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    <FiTrash2 className="h-4 w-4" />
                    Delete
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Profile Modal */}
      <AnimatePresence>
        {showProfileModal && selectedProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowProfileModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-6 flex justify-between items-center z-10">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {selectedProfile.full_name || "Supplier Details"}
                  </h2>
                  <div className="flex gap-2 mt-2">
                    {!selectedProfile.is_approved && (
                      <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full font-medium backdrop-blur-sm">
                        Pending Approval
                      </span>
                    )}
                    {!selectedProfile.is_active && (
                      <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full font-medium backdrop-blur-sm">
                        Disabled
                      </span>
                    )}
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowProfileModal(false)}
                  className="text-white hover:bg-white/20 p-2 rounded-full transition-all"
                >
                  <FiX className="h-6 w-6" />
                </motion.button>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column - Avatar & Contact */}
                  <div className="lg:col-span-1">
                    <div className="flex flex-col items-center mb-6">
                      {selectedProfile.avatar_url ? (
                        <Image
                          src={selectedProfile.avatar_url}
                          alt={selectedProfile.full_name || "Supplier"}
                          width={120}
                          height={120}
                          className="rounded-full border-4 border-orange-500 object-cover shadow-lg mb-4"
                        />
                      ) : (
                        <div className="w-30 h-30 rounded-full border-4 border-orange-500 bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center shadow-lg mb-4">
                          <span className="text-orange-600 text-4xl font-bold">
                            {selectedProfile.full_name?.[0]?.toUpperCase() ||
                              "S"}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 space-y-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FiUser className="h-5 w-5 text-orange-500" />
                        Contact Information
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <FiMail className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500 mb-0.5">
                              Email
                            </p>
                            <p className="text-sm font-medium text-gray-900 break-all">
                              {selectedProfile.email || "—"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <FiPhone className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">
                              Phone
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                              {selectedProfile.phone || "—"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <FiUser className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">
                              Username
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                              {selectedProfile.username || "—"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <FiCalendar className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">
                              Date of Birth
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                              {selectedProfile.date_of_birth
                                ? new Date(
                                    selectedProfile.date_of_birth
                                  ).toLocaleDateString()
                                : "—"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <FiUser className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">
                              Gender
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                              {selectedProfile.gender || "—"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Detailed Info */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Billing Information */}
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FiCreditCard className="h-5 w-5 text-blue-500" />
                        Billing Information
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Name</p>
                          <p className="text-sm font-medium text-gray-900">
                            {selectedProfile.billing_first_name}{" "}
                            {selectedProfile.billing_last_name || "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Phone</p>
                          <p className="text-sm font-medium text-gray-900">
                            {selectedProfile.billing_phone || "—"}
                          </p>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="text-xs text-gray-500 mb-1">Address</p>
                          <p className="text-sm font-medium text-gray-900">
                            {[
                              selectedProfile.billing_street_address,
                              selectedProfile.billing_city,
                              selectedProfile.billing_state,
                              selectedProfile.billing_zip_code,
                              selectedProfile.billing_country,
                            ]
                              .filter(Boolean)
                              .join(", ") || "—"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Information */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FiTruck className="h-5 w-5 text-green-500" />
                        Delivery Information
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Name</p>
                          <p className="text-sm font-medium text-gray-900">
                            {selectedProfile.delivery_first_name}{" "}
                            {selectedProfile.delivery_last_name || "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Phone</p>
                          <p className="text-sm font-medium text-gray-900">
                            {selectedProfile.delivery_phone || "—"}
                          </p>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="text-xs text-gray-500 mb-1">Address</p>
                          <p className="text-sm font-medium text-gray-900">
                            {[
                              selectedProfile.delivery_street_address,
                              selectedProfile.delivery_city,
                              selectedProfile.delivery_state,
                              selectedProfile.delivery_zip_code,
                              selectedProfile.delivery_country,
                            ]
                              .filter(Boolean)
                              .join(", ") || "—"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Bank Details */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FiCreditCard className="h-5 w-5 text-purple-500" />
                        Bank Details
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Bank Name
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            {selectedProfile.bank_name || "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Account Number
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            {selectedProfile.bank_account_number || "—"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FiMapPin className="h-5 w-5 text-amber-500" />
                        Additional Information
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Address</p>
                          <p className="text-sm font-medium text-gray-900">
                            {selectedProfile.address || "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Products Count
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            {productsCount[selectedProfile.id] || 0}
                          </p>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="text-xs text-gray-500 mb-1">
                            Member Since
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(
                              selectedProfile.created_at
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex flex-wrap gap-3 justify-between items-center border-t border-gray-200 pt-6">
                  <div className="flex flex-wrap gap-3">
                    {!selectedProfile.is_approved ? (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => approveVendor(selectedProfile.id)}
                        disabled={actionLoading}
                        className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 shadow-sm flex items-center gap-2"
                      >
                        <FiCheckCircle className="h-4 w-4" />
                        Approve Supplier
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          toggleVendorStatus(
                            selectedProfile.id,
                            selectedProfile.is_active
                          )
                        }
                        disabled={actionLoading}
                        className={`px-6 py-2.5 rounded-lg font-medium transition-all disabled:opacity-50 shadow-sm flex items-center gap-2 ${
                          !selectedProfile.is_active
                            ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                            : "bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white"
                        }`}
                      >
                        {selectedProfile.is_active ? (
                          <>
                            <FiToggleLeft className="h-4 w-4" />
                            Disable Supplier
                          </>
                        ) : (
                          <>
                            <FiToggleRight className="h-4 w-4" />
                            Enable Supplier
                          </>
                        )}
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openDeleteModal(selectedProfile)}
                      disabled={actionLoading}
                      className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 shadow-sm flex items-center gap-2"
                    >
                      <FiTrash2 className="h-4 w-4" />
                      Delete Supplier
                    </motion.button>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowProfileModal(false)}
                    className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-all shadow-sm"
                  >
                    Close
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products Modal */}
      <AnimatePresence>
        {showProductsModal && selectedProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowProductsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-6 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <FiPackage className="h-6 w-6" />
                    Products by {selectedProfile.full_name || "Supplier"}
                  </h2>
                  <span className="text-sm text-white/90 mt-1 inline-block">
                    {productsCount[selectedProfile.id] || 0} total products
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowProductsModal(false)}
                  className="text-white hover:bg-white/20 p-2 rounded-full transition-all"
                >
                  <FiX className="h-6 w-6" />
                </motion.button>
              </div>

              {productsLoading ? (
                <div className="flex justify-center items-center flex-1 py-20">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 1,
                      ease: "linear",
                    }}
                    className="h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full"
                  />
                </div>
              ) : profileProducts.length === 0 ? (
                <div className="flex flex-col justify-center items-center flex-1 py-20">
                  <FiPackage className="h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">
                    No products found for this supplier.
                  </p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="grid gap-4">
                    {profileProducts.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-md transition-all"
                      >
                        {product.images?.[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            width={80}
                            height={80}
                            className="rounded-lg object-cover shadow-sm"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <FiPackage className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base font-semibold text-gray-900 mb-1 truncate">
                            {product.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            SKU: {product.sku}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-orange-600">
                            ${product.price.toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500">
                            Stock: {product.stock_quantity}
                          </p>
                        </div>
                        <div>
                          <span
                            className={`px-3 py-1.5 text-xs font-semibold rounded-full ${
                              product.is_active
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {product.is_active ? "Active" : "Inactive"}
                          </span>
                          <p className="text-xs text-gray-500 mt-1 text-center">
                            {new Date(product.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 px-8 py-4 bg-gray-50">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowProductsModal(false)}
                  className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-lg font-medium transition-all shadow-sm ml-auto block"
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && selectedProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
                <FiAlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                Delete Supplier?
              </h3>
              <p className="text-gray-600 mb-4 text-center">
                Are you sure you want to delete{" "}
                <strong className="text-gray-900">
                  {selectedProfile.full_name || "this supplier"}
                </strong>
                ? This action cannot be undone.
              </p>
              {productsCount[selectedProfile.id] > 0 && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
                  <div className="flex gap-3">
                    <FiAlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-900 font-semibold text-sm mb-1">
                        Warning
                      </p>
                      <p className="text-red-700 text-sm">
                        This supplier has{" "}
                        <strong>
                          {productsCount[selectedProfile.id]} products
                        </strong>
                        . Deleting the supplier will also permanently remove all
                        their products.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDeleteModal(false)}
                  disabled={actionLoading}
                  className="flex-1 px-6 py-3 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium transition-all disabled:opacity-50"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => deleteVendor(selectedProfile.id)}
                  disabled={actionLoading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-xl font-medium transition-all disabled:opacity-50 shadow-sm"
                >
                  {actionLoading ? "Deleting..." : "Delete"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
