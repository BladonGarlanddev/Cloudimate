import { useEffect, useState, useContext } from "react";
import { Helmet } from "react-helmet";
import Logo from "./assets/blue-cloud-logo.png";
import jwtDecode from "jwt-decode";
import { useHistory, Link } from "react-router-dom";
import useAxios from "./api/axiosConfig";
import styles from "./styling/Login.module.css";
import { handleLogin } from "./util/auth";
import banner from "./assets/banner.png";
import { UserContext } from "./context/UserContext";

const Login = () => {
  const {user, setUser} = useContext(UserContext);
  const [error, setError] = useState(null);
  const [showMFA, setShowMFA] = useState(false);

  const axios = useAxios();
  const history = useHistory();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    mfa_code: ""
  });

  const headers = {
    "X-User-Email": formData.email,
  };

  const handleEmailSubmitted = () => {
    console.log('ran');
    if (formData.email != null || formData.email != "") {
      axios
        .post("/api/getMFADetails", {}, { headers: headers })
        .then((response) => {
          if(response.data.mfa_enabled == 1) {
            setShowMFA(true);
          }
        })
        .catch((error) => {
          console.log("no mfa detected");
        });
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };


  const handleSubmit = (e) => {
    e.preventDefault();

    axios
      .post("/api/login", formData, {headers: headers})
      .then((response) => {
        setUser(response.data.user);
        history.push("/app/");
      })
      .catch((error) => {
        console.error("Error:", error);
        setError("Incorrect email or password");
      });
    
  };

  useEffect(() => {
    const google = window.google;
    google.accounts.id.initialize({
      client_id: process.env.REACT_APP_G_CLIENT_ID,
      callback: (response) => {
        const googleToken = response.credential;
        console.log("google token: " + googleToken)
        axios.post("/api/validateGoogleUser", { token: googleToken })
        .then((response) => {
          console.log(response.data);
          setUser(response.data);
          history.push("/app/");
        })
        .catch((error) => {
          setError("Google sign in failed. Either your google account is incorrectly set up or there was a server side error. For now, login using Cloudimates login system.")
        })
        
      },
    });

    google.accounts.id.renderButton(
      document.getElementById("googleSignInDiv"),
      { theme: "outline", size: "large" }
    );

    google.accounts.id.prompt();
  }, []);

  return (
    <div className='w-screen h-screen bg-gradient-to-tl from-[#08c3fd] to-[#0973FC] flex md:flex-row items-center'>
      <Helmet>
        <title>Cloudimate | Login</title>
      </Helmet>
      <div className={styles.loginBanner}>
        <img src={banner} />
      </div>
      <div className={styles.loginContainer}>
        <div className={styles.loginHead}>
          <img src={Logo} />
        </div>
        <form className={styles.loginForm}>
          <label>Email</label>
          <input
            type='text'
            name='email'
            value={formData.email}
            onChange={handleChange}
            onBlur={handleEmailSubmitted}
          />
          <label>Password</label>
          <input
            type='password'
            name='password'
            value={formData.password}
            onChange={handleChange}
          />
          {showMFA && (
            <>
              <label>MFA</label>
              <input
                type='text'
                name='mfa_code'
                value={formData.mfa_code}
                onChange={handleChange}
              />
            </>
          )}

          {error && <p className={styles.loginError}>{error}</p>}
          <button
            type='submit'
            onClick={handleSubmit}
            className={styles.loginButton}
          >
            Login
          </button>
          <div id='googleSignInDiv' className={styles.googleSignin}></div>
        </form>
        <section className={styles.textArea}>
          <div>
            Forgot your{" "}
            <Link className={styles.link} to='/forgot-password'>
              password
            </Link>
            ?
          </div>
          <div>
            Don't have an account?{" "}
            <Link className={styles.link} to='/free-trial/signup'>
              SIGN UP
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;
