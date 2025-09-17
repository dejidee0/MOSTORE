"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase-client";
import { FixedSizeList as List } from "react-window";

export default function SuppliersPage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [productsCount, setProductsCount] = useState({});
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [profileProducts, setProfileProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from("profiles")
          .select("*", { count: "exact" })
          .eq("role", "supplier");

        if (searchTerm) {
          query = query.or(
            `full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%`
          );
        }

        const { data, error, count } = await query;
        console.log("Fetched profiles:", data);
        if (error) throw error;

        setProfiles(data || []);

        if (data?.length) {
          const { data: counts } = await supabase.rpc(
            "get_products_count_by_supplier",
            {
              supplier_ids: data.map((p) => p.id),
            }
          );

          const countsMap = counts?.reduce(
            (acc, item) => ({
              ...acc,
              [item.supplier_id]: item.count,
            }),
            {}
          );

          setProductsCount(countsMap || {});
        }
      } catch (error) {
        console.error("Error fetching profiles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, [searchTerm]);

  const fetchProfileProducts = async (profileId) => {
    setProductsLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("supplier_id", profileId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProfileProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setProductsLoading(false);
    }
  };

  const toggleVendorStatus = async (vendorId, currentStatus) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: !currentStatus })
        .eq("id", vendorId);

      if (error) throw error;

      setProfiles(
        profiles.map((profile) =>
          profile.id === vendorId
            ? { ...profile, is_active: !currentStatus }
            : profile
        )
      );

      if (selectedProfile?.id === vendorId) {
        setSelectedProfile({ ...selectedProfile, is_active: !currentStatus });
      }

      alert(`Vendor ${!currentStatus ? "enabled" : "disabled"} successfully!`);
    } catch (error) {
      console.error("Error updating vendor status:", error);
      alert("Error updating vendor status. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const approveVendor = async (vendorId) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_approved: true })
        .eq("id", vendorId);

      if (error) throw error;

      setProfiles(
        profiles.map((profile) =>
          profile.id === vendorId ? { ...profile, is_approved: true } : profile
        )
      );

      if (selectedProfile?.id === vendorId) {
        setSelectedProfile({ ...selectedProfile, is_approved: true });
      }

      alert("Vendor approved successfully!");
    } catch (error) {
      console.error("Error approving vendor:", error);
      alert("Error approving vendor. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const deleteVendor = async (vendorId) => {
    setActionLoading(true);
    try {
      const productCount = productsCount[vendorId] || 0;

      if (productCount > 0) {
        const confirmDelete = confirm(
          `This vendor has ${productCount} products. Deleting the vendor will also remove all their products. Are you sure you want to proceed?`
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

      setProfiles(profiles.filter((profile) => profile.id !== vendorId));

      if (selectedProfile?.id === vendorId) {
        setSelectedProfile(null);
        setShowProfileModal(false);
        setShowProductsModal(false);
      }

      setShowDeleteModal(false);
      alert("Vendor deleted successfully!");
    } catch (error) {
      console.error("Error deleting vendor:", error);
      alert("Error deleting vendor. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const openProfileModal = (profile) => {
    setSelectedProfile(profile);
    setShowProfileModal(true);
  };

  const openProductsModal = async (profile) => {
    setSelectedProfile(profile);
    await fetchProfileProducts(profile.id);
    setShowProductsModal(true);
  };

  const openDeleteModal = (profile) => {
    setSelectedProfile(profile);
    setShowDeleteModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-orange-500 font-semibold">
        Loading profiles...
      </div>
    );
  }

  return (
    <div className="p-6 md:pt-10 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-orange-500">My Vendors</h1>
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search profiles..."
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

      {profiles.length === 0 ? (
        <div className="text-gray-600 bg-white p-8 rounded-xl text-center">
          No profiles found. {searchTerm && "Try a different search term."}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className={`bg-white shadow-lg rounded-xl p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col ${
                profile.is_active === false ? "opacity-60 bg-gray-50" : ""
              }`}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-15 h-15 shrink-0">
                  {profile.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt={profile.full_name || "Profile Avatar"}
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
                        {profile.full_name?.[0]?.toUpperCase() || "P"}
                      </span>
                    </div>
                  )}
                  {profile.is_approved === false && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">!</span>
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-gray-800 truncate">
                    {profile.full_name || "No Name"}
                    {profile.is_approved === false && (
                      <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        Pending Approval
                      </span>
                    )}
                    {profile.is_active === false && (
                      <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                        Disabled
                      </span>
                    )}
                  </h2>
                  <p className="text-sm text-gray-500 truncate">
                    {profile.email}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-700 mb-4">
                <p className="truncate">
                  <span className="font-medium text-orange-500">Phone:</span>{" "}
                  {profile.phone || "—"}
                </p>
                <p className="truncate">
                  <span className="font-medium text-orange-500">Products:</span>{" "}
                  {productsCount[profile.id] || 0}
                </p>
                <p>
                  <span className="font-medium text-orange-500">Joined:</span>{" "}
                  {new Date(profile.created_at).toLocaleDateString()}
                </p>
                <p>
                  <span className="font-medium text-orange-500">Approval:</span>{" "}
                  <span
                    className={`font-medium ${
                      profile.is_approved === false
                        ? "text-yellow-600"
                        : "text-green-600"
                    }`}
                  >
                    {profile.is_approved === false
                      ? "Pending Approval"
                      : "Approved"}
                  </span>
                </p>
                <p>
                  <span className="font-medium text-orange-500">Status:</span>{" "}
                  <span
                    className={`font-medium ${
                      profile.is_active === false
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {profile.is_active === false ? "Disabled" : "Active"}
                  </span>
                </p>
              </div>

              <div className="mt-auto space-y-2">
                <button
                  onClick={() => openProfileModal(profile)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-medium transition-colors"
                >
                  View Profile
                </button>
                <button
                  onClick={() => openProductsModal(profile)}
                  className="w-full bg-white hover:bg-gray-50 text-orange-500 py-2 rounded-lg font-medium border border-orange-500 transition-colors"
                  disabled={!profile.role || profile.role !== "supplier"}
                >
                  View Products
                </button>

                <div className="flex gap-2">
                  {profile.is_approved === false ? (
                    <button
                      onClick={() => approveVendor(profile.id)}
                      disabled={actionLoading}
                      className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 py-2 rounded-lg font-medium border border-green-300 transition-colors disabled:opacity-50"
                    >
                      Approve
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        toggleVendorStatus(profile.id, profile.is_active)
                      }
                      disabled={actionLoading}
                      className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                        profile.is_active === false
                          ? "bg-green-100 hover:bg-green-200 text-green-700 border border-green-300"
                          : "bg-yellow-100 hover:bg-yellow-200 text-yellow-700 border border-yellow-300"
                      } disabled:opacity-50`}
                    >
                      {profile.is_active === false ? "Enable" : "Disable"}
                    </button>
                  )}
                  <button
                    onClick={() => openDeleteModal(profile)}
                    disabled={actionLoading}
                    className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2 rounded-lg font-medium border border-red-300 transition-colors disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showProfileModal && selectedProfile && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white/90 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/50 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white/80 backdrop-blur-lg px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-orange-500">
                {selectedProfile.full_name || "Profile Details"}
                {selectedProfile.is_approved === false && (
                  <span className="ml-3 text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                    Pending Approval
                  </span>
                )}
                {selectedProfile.is_active === false && (
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
                    {selectedProfile.avatar_url ? (
                      <Image
                        src={selectedProfile.avatar_url}
                        alt={selectedProfile.full_name || "Profile Avatar"}
                        width={120}
                        height={120}
                        className="rounded-full border-4 border-orange-500 object-cover"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full border-4 border-orange-500 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-4xl font-semibold">
                          {selectedProfile.full_name?.[0]?.toUpperCase() || "P"}
                        </span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Contact Information
                  </h3>
                  <div className="mt-2 space-y-2">
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {selectedProfile.email || "—"}
                    </p>
                    <p>
                      <span className="font-medium">Phone:</span>{" "}
                      {selectedProfile.phone || "—"}
                    </p>
                    <p>
                      <span className="font-medium">Username:</span>{" "}
                      {selectedProfile.username || "—"}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Bank Details
                    </h3>
                    <div className="mt-2 space-y-2">
                      <p>
                        <span className="font-medium">Bank Name:</span>{" "}
                        {selectedProfile.bank_name || "—"}
                      </p>
                      <p>
                        <span className="font-medium">Account Number:</span>{" "}
                        {selectedProfile.bank_account_number || "—"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Additional Information
                    </h3>
                    <div className="mt-2 space-y-2">
                      <p>
                        <span className="font-medium">Address:</span>{" "}
                        {selectedProfile.address || "—"}
                      </p>
                      <p>
                        <span className="font-medium">Products:</span>{" "}
                        {productsCount[selectedProfile.id] || 0}
                      </p>
                      <p>
                        <span className="font-medium">Approval:</span>{" "}
                        <span
                          className={`font-medium ${
                            selectedProfile.is_approved === false
                              ? "text-yellow-600"
                              : "text-green-600"
                          }`}
                        >
                          {selectedProfile.is_approved === false
                            ? "Pending Approval"
                            : "Approved"}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium">Status:</span>{" "}
                        <span
                          className={`font-medium ${
                            selectedProfile.is_active === false
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {selectedProfile.is_active === false
                            ? "Disabled"
                            : "Active"}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium">Member Since:</span>{" "}
                        {new Date(
                          selectedProfile.created_at
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-between">
                <div className="flex gap-3">
                  {selectedProfile.is_approved === false ? (
                    <button
                      onClick={() => approveVendor(selectedProfile.id)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      Approve Vendor
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        toggleVendorStatus(
                          selectedProfile.id,
                          selectedProfile.is_active
                        )
                      }
                      disabled={actionLoading}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                        selectedProfile.is_active === false
                          ? "bg-green-500 hover:bg-green-600 text-white"
                          : "bg-yellow-500 hover:bg-yellow-600 text-white"
                      }`}
                    >
                      {selectedProfile.is_active === false
                        ? "Enable Vendor"
                        : "Disable Vendor"}
                    </button>
                  )}
                  <button
                    onClick={() => openDeleteModal(selectedProfile)}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    Delete Vendor
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

      {showProductsModal && selectedProfile && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white/90 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/50 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="sticky top-0 bg-white/80 backdrop-blur-lg px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-orange-500">
                  Products by {selectedProfile.full_name || "Profile"}
                </h2>
                <span className="text-sm text-gray-500">
                  {productsCount[selectedProfile.id] || 0} products
                </span>
              </div>
              <button
                onClick={() => setShowProductsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            {productsLoading ? (
              <div className="flex justify-center items-center flex-1">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
              </div>
            ) : profileProducts.length === 0 ? (
              <div className="flex justify-center items-center flex-1 text-gray-500">
                No products found for this profile.
              </div>
            ) : (
              <List
                height={500}
                itemCount={profileProducts.length}
                itemSize={70}
                width="100%"
              >
                {({ index, style }) => {
                  const product = profileProducts[index];
                  return (
                    <div
                      style={style}
                      className="flex items-center px-6 py-3 border-b border-gray-100 hover:bg-gray-50"
                    >
                      {product.images?.[0] && (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          width={40}
                          height={40}
                          className="rounded-md object-cover"
                        />
                      )}
                      <div className="ml-4 flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.sku}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 w-24">
                        ${product.price.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500 w-20">
                        {product.stock_quantity}
                      </div>
                      <div className="w-20">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            product.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 w-28">
                        {new Date(product.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  );
                }}
              </List>
            )}
            <div className="mt-auto px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowProductsModal(false)}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && selectedProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Delete Vendor
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete{" "}
              <strong>{selectedProfile.full_name || "this vendor"}</strong>?
              This action cannot be undone.
            </p>
            {productsCount[selectedProfile.id] > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-red-700 text-sm">
                  <strong>Warning:</strong> This vendor has{" "}
                  {productsCount[selectedProfile.id]} products. Deleting the
                  vendor will also remove all their products.
                </p>
              </div>
            )}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={actionLoading}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteVendor(selectedProfile.id)}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {actionLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
