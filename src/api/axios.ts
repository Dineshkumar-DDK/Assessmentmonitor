import axios from 'axios'

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },

})

apiClient.interceptors.response.use(
    (res)=>res,
    (error)=>{
    const message =
      error.response?.data?.message ||
      error.message ||
      "Unexpected API error";

    return Promise.reject(new Error(message));
  }
)


export default apiClient