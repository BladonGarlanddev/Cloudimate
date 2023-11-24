import { useContext } from "react";
import axios from "axios";
import { UserContext } from "../context/UserContext";

const useAxios = () => {
  const { user } = useContext(UserContext);
  const axiosInstance = axios.create({
    baseURL: "https://api.cloudimate.tech", // Replace with your base URL
  });

  if (user && user.api_key) {
    axiosInstance.defaults.headers.common["Authorization"] =
      "Bearer " + user.api_key;
    axiosInstance.defaults.headers.common["X-User-Email"] =
      user.email;
    if(user.region) {
      axiosInstance.defaults.headers.common["X-Region"] = user.region;
    }
  }

  return axiosInstance;
};

export default useAxios;
