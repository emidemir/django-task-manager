import axios from 'axios';

const api = axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_URL}`, // Replace with your actual API URL
  headers: {
    'Content-Type': 'application/json',
  },
});


// ---------- Request Interceptor ----------
// Logic for appending the token into request.
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---------- Response Interceptor ----------
// The Silent Refresher: When 401 received.
api.interceptors.response.use(
  (response) => {
    // If the request succeeds, pass it back to the React component
    return response;
  },
  async (error) => {
    // Grab the original request envelope that failed
    const originalRequest = error.config;

    // Check if the error is 401 Unauthorized AND we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Mark it so we don't get stuck in an infinite loop
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        // Use the default 'axios' here, NOT 'api', to avoid triggering interceptors again
        const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/token/refresh/`, {
          refresh: refreshToken // SimpleJWT expects the key "refresh"
        });

        // SimpleJWT returns the new token in the "access" property
        const newAccessToken = response.data.access;
        localStorage.setItem('accessToken', newAccessToken);

        // If you have "ROTATE_REFRESH_TOKENS" set to True in Django settings:
        if (response.data.refresh) {
          localStorage.setItem('refreshToken', response.data.refresh);
        }

        // Update the failed request with the fresh token
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        // Retry the exact same request silently
        return api(originalRequest);
        
      } catch (refreshError) {
        // The refresh token is dead. The user must log in again.
        console.error("Refresh token expired. Logging out.");
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login'; 
        
        return Promise.reject(refreshError);
      }
    }

    // For any other error (500 Server Error, 404 Not Found), pass it to React
    return Promise.reject(error);
  }
);

export default api;