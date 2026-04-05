export default function ({ store, app: { $axios }, route, redirect }) {
  // the two interceptors here will run in every $axios requests
  // On Request for this purpose is used to add the Bearer token on every request
  $axios.onRequest((config) => {
    let userRole = store.getters.getThisUserRole
    if (userRole != 'isSuperAdmin' && config['data']) {
      config['data']['selected_company_id'] = [store.getters.getSelectedCompany]
    } else {

    }
    let accessToken = store.state.client_token;
    if (accessToken && config.url !== "/employees/login") {
      // config.headers.Authorization = "Bearer " + accessToken;
    }
    return config;
  });
  // On Error, when there is no Bearer token or token expired it will trigger logout
  $axios.onError(async (error) => {
    // Error status code
    const statusCode = error.response ? error.response.status : -1;
    console.log('Axios error:', statusCode, route.path);

    // Don't treat 204 (No Content) as an error - this is used by forgot password
    if (statusCode === 204) {
      return Promise.resolve();
    }

    // Handle authentication errors
    if (route.path !== "/" && (statusCode === 401 || (statusCode === 500 && error.response?.data?.status === 401))) {
      // Try to refresh token first
      try {
        const refreshToken = store.getters.getRefreshToken;
        if (refreshToken) {
          console.log('Attempting to refresh token...');
          const response = await $axios.$post('/users/auth/refresh-tokens', {
            refreshToken: refreshToken
          });

          if (response && response.tokens) {
            console.log('Token refreshed successfully');
            // Update tokens in store
            store.dispatch('setToken', response.tokens.access.token);
            store.dispatch('setRefreshToken', response.tokens.refresh.token);

            // Retry the original request
            const originalRequest = error.config;
            originalRequest.headers.Authorization = `Bearer ${response.tokens.access.token}`;
            return $axios(originalRequest);
          }
        }
      } catch (refreshError) {
        console.log('Token refresh failed:', refreshError);
        // Refresh failed, proceed with logout
      }

      // If refresh failed or no refresh token, logout
      store.dispatch("logout");
      return redirect("/");
    }

    return Promise.reject(error);
  });
}
