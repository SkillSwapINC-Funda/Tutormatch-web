import axios from 'axios';

const API_URL = process.env.TUTORMATCH_BACKEND_URL;


const authApi = {
  login: async (email: string, password: string) => {
    return axios.post(`${API_URL}/auth/login`, { email, password });
  },
  
  register: async (registerData: any) => {
    return axios.post(`${API_URL}/auth/register`, registerData);
  },
  
  logout: async () => {
    return axios.post(`${API_URL}/auth/logout`);
  }
};

export default authApi;