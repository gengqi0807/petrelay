import { ref } from 'vue';
import api from '../utils/api';

const user = ref(null);

const loadUser = async () => {
  const token = localStorage.getItem('petrelay_token');
  if (!token) {
    user.value = null;
    return;
  }
  try {
    const res = await api.get('/users/me');
    user.value = res.data;
  } catch (error) {
    user.value = null;
    localStorage.removeItem('petrelay_token');
  }
};

const logout = () => {
  localStorage.removeItem('petrelay_token');
  user.value = null;
};

export function useAuth() {
  return {
    user,
    loadUser,
    logout,
  };
}
