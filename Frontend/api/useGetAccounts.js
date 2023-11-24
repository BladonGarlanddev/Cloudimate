import { useEffect } from "react";
import axiosInstance from "./axiosConfig";

function useGetAccounts(setAccounts, setSelectedAccount) {
  const axios = axiosInstance();
  useEffect(() => {
    console.log("GetAccounts hook mounted");
  

    // Making the request
    axios
      .get("/api/aws/getAccounts")
      .then((response) => {
        const data = response.data;
        console.log("data: " + data);
        setAccounts([data]);
        if(Array.isArray(data)) {
          setSelectedAccount(data[0]);
        } else {
          setSelectedAccount(data);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);
}

export default useGetAccounts;
