import { getCurrentUser, getCurrentVendor } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["auth", "current-user"],
    queryFn: getCurrentUser,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });
};
export const useCurrentVendor = ({ userId }) => {
  return useQuery({
    queryKey: ["vendor", userId],
    queryFn: () => getCurrentVendor({ userId }),
    enabled: !!userId, // prevents running before auth loads
    staleTime: 1000 * 60 * 5,
  });
};
