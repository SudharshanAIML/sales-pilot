import api from './api';

export const getCurrentUserProfile = async () => {
  const response = await api.get('/employees/me');
  return response.data;
};

export const updateUserProfile = async (profileData) => {
  const response = await api.patch('/employees/me', profileData);
  return response.data;
};