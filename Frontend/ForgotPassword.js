import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import styles from "./styling/ForgotPassword.module.css";
import ReCAPTCHA from "react-google-recaptcha";
import axiosInstance from "./api/axiosConfig";

const ForgotPassword = () => {
  const axios = axiosInstance();
  const history = useHistory();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [captchaValue, setCaptchaValue] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmationPassword, setConfirmationPassword] = useState("");
  const [requested, setRequested] = useState(false);

  const handleCaptchaResponse = (value) => {
    setCaptchaValue(value);
  };

  const getResetToken = (e) => {
    e.preventDefault();

    const headers = {
      "X-User-Email": email,
    };

    axios
      .get("/api/getResetToken", { headers: headers })
      .then((response) => {
        // Handle success
        setRequested(true);
      })
      .catch((error) => {
        // Handle error
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const headers = {
      "Content-Type": "application/json",
      "X-User-Email": email, // example custom header
      // ... any other headers you need to set
    };
    // The CAPTCHA value can be sent to the backend along with the token
    axios
      .post("/api/validateForgotPassword", {
        token: token,
        captcha: captchaValue,
        new_password: newPassword 
      }, {headers: headers})
      .then((response) => {
        history.push("/login");
      })
      .catch((error) => {
        // Handle error
      });
  };

  return (
    <div className={styles.forgotPage}>
      {requested ? (
        <form onSubmit={handleSubmit}>
          <label>New Password</label>
          <input
            name='newPassword'
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <label>Confirm New Password</label>
          <input
            name='confirmationPassword'
            value={confirmationPassword}
            onChange={(e) => setConfirmationPassword(e.target.value)}
          />
          <label>Token</label>
          <input
            name='token'
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <ReCAPTCHA
            sitekey='6LenhYcoAAAAAHHlIwi7yvoqOoxNzyT9UV79liz7'
            onChange={handleCaptchaResponse}
          />
          <button type='submit'>Submit</button>
        </form>
      ) : (
        <form onSubmit={getResetToken}>
          <label>Email</label>
          <input
            name='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type='submit'>Submit</button>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
