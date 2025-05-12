
import { Profile } from "@/lib/types";

// Find user details by ID
export const getUserName = (users: Profile[], userId?: string) => {
  if (!userId) return null;
  const user = users.find(u => u.id === userId);
  return user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : null;
};
