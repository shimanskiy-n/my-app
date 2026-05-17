import { create } from 'zustand';

import {
  fetchUsers as fetchUsersApi,
  patchUserName as patchUserNameRequest,
  type UserRecord,
} from '@/services/usersApi';

type UsersState = {
  users: UserRecord[];
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  /** Локально обновляет имя и шлёт PATCH (JSONPlaceholder не сохраняет). */
  patchUserName: (id: number, name: string) => Promise<void>;
  mergeUser: (user: UserRecord) => void;
};

export const useUsersStore = create<UsersState>((set, get) => ({
  users: [],
  loading: false,
  error: null,

  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const users = await fetchUsersApi();
      set({ users, loading: false });
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : 'Unknown error',
        loading: false,
      });
    }
  },

  patchUserName: async (id, name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const prev = get().users;
    set({ users: prev.map((u) => (u.id === id ? { ...u, name: trimmed } : u)) });
    try {
      await patchUserNameRequest(id, trimmed);
    } catch (err) {
      set({ users: prev });
      throw err;
    }
  },

  mergeUser: (user) => {
    set((s) => ({
      users: s.users.some((u) => u.id === user.id)
        ? s.users.map((u) => (u.id === user.id ? user : u))
        : [...s.users, user],
    }));
  },
}));
