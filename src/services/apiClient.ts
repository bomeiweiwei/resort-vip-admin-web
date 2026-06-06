import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_PROXY_API,
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("employee_name");
      localStorage.removeItem("role");
      window.location.reload();
    }

    return Promise.reject(error);
  }
);

export default apiClient;