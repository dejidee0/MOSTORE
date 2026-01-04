import { getCurrentUser } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["user", "current"],
    queryFn: getCurrentUser,
  });
};
