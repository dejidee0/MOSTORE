import { getAllCategories, getAllProducts } from "@/lib/data/products";
import { useQuery } from "@tanstack/react-query";
export const useProducts = () => {
  return useQuery({
    queryKey: ["products", "all"],
    queryFn: getAllProducts,
    staleTime: 1000 * 60 * 5,
  });
};
export const useCategories = () => {
  return useQuery({
    queryKey: ["categories", "all"],
    queryFn: getAllCategories,
    staleTime: 1000 * 60 * 5,
  });
};
