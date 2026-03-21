import { create } from "zustand";
import { getUserById } from "../apis/actions";

interface User {
  _id: string;
  email: string;
  name: string;
  isMe?: boolean;
  client_tokens?: string[];
  phone_tokens?: string[];
  utcOffset?: number;
}

interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  refetchUser: (userId: string) => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => {
    console.log("Setting user in store:", user);
    set({ user });
  },
  refetchUser: async (userId: string) => {
    try {
      const refreshedUser = await getUserById(userId);
      if (refreshedUser) {
        console.log("Refetched user:", refreshedUser);
        set({ user: refreshedUser });
      }
    } catch (error) {
      console.error("Failed to refetch user:", error);
    }
  },
}));
