"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase-client";
import { FixedSizeList as List } from "react-window";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [productsCount, setProductsCount] = useState({});
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [supplierProducts, setSupplierProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const itemsPerPage = 12;

  useEffect(() => {
    const fetchSuppliers = async () => {
      setLoading(true);
      try {
        const from = (currentPage - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1;

        let query = supabase
          .from("profiles")
          .select("*", { count: "exact" })
          .eq("role", "supplier")
          .range(from, to);

        if (searchTerm) {
          query = query.or(
            `full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%`
          );
        }

        const { data, error, count } = await query;

        if (error) throw error;

        setSuppliers(data || []);

        // Fetch product counts
        if (data?.length) {
          const { data: counts } = await supabase.rpc(
            "get_products_count_by_supplier",
            {
              supplier_ids: data.map((s) => s.id),
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
        console.error("Error fetching suppliers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, [currentPage, searchTerm]);

  const fetchSupplierProducts = async (supplierId) => {
    setProductsLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("supplier_id", supplierId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSupplierProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setProductsLoading(false);
    }
  };

  const openProfileModal = (supplier) => {
    setSelectedSupplier(supplier);
    setShowProfileModal(true);
  };

  const openProductsModal = async (supplier) => {
    setSelectedSupplier(supplier);
    await fetchSupplierProducts(supplier.id);
    setShowProductsModal(true);
  };

  const totalPages = Math.ceil(suppliers.count / itemsPerPage);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-orange-500 font-semibold">
        Loading suppliers...
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Search and header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-orange-500">Suppliers</h1>
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search suppliers..."
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
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
            ></path>
          </svg>
        </div>
      </div>

      {/* Supplier grid */}
      {suppliers.length === 0 ? (
        <div className="text-gray-600 bg-white p-8 rounded-xl text-center">
          No suppliers found. {searchTerm && "Try a different search term."}
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {suppliers.map((supplier) => (
              <div
                key={supplier.id}
                className="bg-white shadow-lg rounded-xl p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                {/* Supplier card content */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-15 h-15 shrink-0">
                    {supplier.avatar_url ? (
                      <Image
                        src={supplier.avatar_url}
                        alt={supplier.full_name || "Supplier Avatar"}
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
                          {supplier.full_name?.[0]?.toUpperCase() || "S"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-gray-800 truncate">
                      {supplier.full_name || "No Name"}
                    </h2>
                    <p className="text-sm text-gray-500 truncate">
                      {supplier.email}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-700 mb-4">
                  <p className="truncate">
                    <span className="font-medium text-orange-500">Phone:</span>{" "}
                    {supplier.phone || "—"}
                  </p>
                  <p className="truncate">
                    <span className="font-medium text-orange-500">
                      Products:
                    </span>{" "}
                    {productsCount[supplier.id] || 0}
                  </p>
                  <p>
                    <span className="font-medium text-orange-500">Joined:</span>{" "}
                    {new Date(supplier.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="mt-auto space-y-2">
                  <button
                    onClick={() => openProfileModal(supplier)}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-medium transition-colors"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => openProductsModal(supplier)}
                    className="w-full bg-white hover:bg-gray-50 text-orange-500 py-2 rounded-lg font-medium border border-orange-500 transition-colors"
                  >
                    View Products
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Profile Modal */}
      {showProfileModal && selectedSupplier && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white/90 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/50 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Sticky Header */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-lg px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-orange-500">
                {selectedSupplier.full_name || "Supplier Profile"}
              </h2>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Profile content */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex justify-center mb-6">
                    {selectedSupplier.avatar_url ? (
                      <Image
                        src={selectedSupplier.avatar_url}
                        alt={selectedSupplier.full_name || "Supplier Avatar"}
                        width={120}
                        height={120}
                        className="rounded-full border-4 border-orange-500 object-cover"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full border-4 border-orange-500 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-4xl font-semibold">
                          {selectedSupplier.full_name?.[0]?.toUpperCase() ||
                            "S"}
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
                      {selectedSupplier.email || "—"}
                    </p>
                    <p>
                      <span className="font-medium">Phone:</span>{" "}
                      {selectedSupplier.phone || "—"}
                    </p>
                    <p>
                      <span className="font-medium">Username:</span>{" "}
                      {selectedSupplier.username || "—"}
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
                        {selectedSupplier.bank_name || "—"}
                      </p>
                      <p>
                        <span className="font-medium">Account Number:</span>{" "}
                        {selectedSupplier.bank_account_number || "—"}
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
                        {selectedSupplier.address || "—"}
                      </p>
                      <p>
                        <span className="font-medium">Products:</span>{" "}
                        {productsCount[selectedSupplier.id] || 0}
                      </p>
                      <p>
                        <span className="font-medium">Member Since:</span>{" "}
                        {new Date(
                          selectedSupplier.created_at
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
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

      {/* Products Modal */}
      {showProductsModal && selectedSupplier && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white/90 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/50 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Sticky Header */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-lg px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-orange-500">
                  Products by {selectedSupplier.full_name || "Supplier"}
                </h2>
                <span className="text-sm text-gray-500">
                  {productsCount[selectedSupplier.id] || 0} products
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
            ) : supplierProducts.length === 0 ? (
              <div className="flex justify-center items-center flex-1 text-gray-500">
                No products found for this supplier.
              </div>
            ) : (
              <List
                height={500}
                itemCount={supplierProducts.length}
                itemSize={70}
                width="100%"
              >
                {({ index, style }) => {
                  const product = supplierProducts[index];
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
    </div>
  );
}
