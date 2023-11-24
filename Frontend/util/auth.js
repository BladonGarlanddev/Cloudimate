
export const handleLogout = (setUser) => {
  setUser(null);
};

export const handleLogin = (setUser, data, axios) => {
  axios
    .post("/api/login", data)
    .then((response) => {
        setUser(response.data);
        return true;
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};

export const handleSignup = (setUser, data, axios) => {
  return axios
    .post("/api/createUser", data)
    .then((response) => {
      console.log(response);
      setUser(response.data.user);
      return true; // Return true if signup was successful
    })
    .catch((error) => {
      console.error("Axios Error:", error);
      console.error("Response Data:", error.response.data);
      return false; // Return false if there was an error in signup
    });
};
