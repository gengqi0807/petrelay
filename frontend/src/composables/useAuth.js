import { ref } from 'vue';
import api from '../utils/api';

const user = ref(null);

const getToken = () => sessionStorage.getItem('petrelay_token');

const loadUser = async () => {
  const token = getToken();
  if (!token) {
    user.value = null;
    return;
  }
  try {
    const res = await api.get('/users/me');
    user.value = res.data;
  } catch (error) {
    user.value = null;
    sessionStorage.removeItem('petrelay_token');
  }
};

const setToken = (token) => {
  sessionStorage.setItem('petrelay_token', token);
};

const logout = () => {
  sessionStorage.removeItem('petrelay_token');
  user.value = null;
};

export function useAuth() {
  return {
    user,
    loadUser,
    logout,
    setToken,
    getToken,
  };
}
