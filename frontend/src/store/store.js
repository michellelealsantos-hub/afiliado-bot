import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  token: localStorage.getItem('token') || null,
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  isLoading: false,
  error: null,

  setToken: (token) => {
    localStorage.setItem('token', token);
    set({ token });
  },

  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  login: (token, user) => {
    set({ token, user });
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  logout: () => {
    set({ token: null, user: null });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error })
}));

export const useConfigStore = create((set) => ({
  affiliateConfigs: {},
  monitorGroups: [],
  postTargetGroups: [],
  isLoading: false,
  error: null,

  setAffiliateConfigs: (configs) => set({ affiliateConfigs: configs }),
  setMonitorGroups: (groups) => set({ monitorGroups: groups }),
  setPostTargetGroups: (groups) => set({ postTargetGroups: groups }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error })
}));

export const useWhatsAppStore = create((set) => ({
  status: 'disconnected',
  phoneNumber: null,
  groups: [],
  qrCode: null,
  isLoading: false,
  error: null,

  setStatus: (status) => set({ status }),
  setPhoneNumber: (phoneNumber) => set({ phoneNumber }),
  setGroups: (groups) => set({ groups }),
  setQrCode: (qrCode) => set({ qrCode }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error })
}));
