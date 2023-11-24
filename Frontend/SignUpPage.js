import React, { useState, useContext } from "react";
import { useLocation, useHistory, Link } from "react-router-dom";
import styles from "./styling/SignUpPage.module.css";
import axiosInstance from "./api/axiosConfig";
import { handleSignup } from "./util/auth";
import { UserContext } from "./context/UserContext";
import ReactMarkdown from "react-markdown";
import Tos from "./legal/Tos";
import PrivacyPolicy from "./legal/PrivacyPolicy";

const SignUp = () => {
  const axios = axiosInstance();
  const { user, setUser } = useContext(UserContext);
  const location = useLocation();
  const history = useHistory();
  const currentPath = location.pathname;
  if (currentPath == "/free-trial/signup") {
    console.log("Current path says go to free trial");
  } else {
    console.log("some error occured");
  }
  const [tosIsChecked, setTosIsChecked] = useState(false);
  const [ppIsChecked, setPpIsChecked] = useState(false);
  const [display, setDisplay] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password2: "",
    street_address: "",
    city: "",
    zip: "",
    state: "",
  });
  
  const [errors, setErrors] = useState({});
  const [emailExists, setEmailExists] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate the form
    const newErrors = {};
    if (!formData.name) {
      newErrors.name = "Name is required.";
    }
    if (!formData.email) {
      newErrors.email = "Email is required.";
    }
    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password != formData.password2) {
      newErrors.password2 = "Passwords do not match.";
      console.log(`(${formData.password}) (${formData.password2})`);
      //setErrors(newErrors);
    }
    /*
    if (!formData.street_address) {
      newErrors.city = "City is required.";
    }
    if (!formData.city) {
      newErrors.city = "City is required.";
    }
    if (!formData.zip) {
      newErrors.zip = "Zip is required.";
    }
    if (!formData.state) {
      newErrors.state = "State is required.";
    }

    <div>
            <label>Street Address</label>
            <input
              type='text'
              name='street_address'
              value={formData.street_address}
              onChange={handleChange}
            />
            {errors.street_address && (
              <p className={styles.error}>{errors.street_address}</p>
            )}
          </div>
          <div className={styles.address}>
            <div>
              <label>City</label>
              <input
                type='text'
                name='city'
                value={formData.city}
                onChange={handleChange}
              />
              {errors.city && <p className={styles.error}>{errors.city}</p>}
            </div>
            <div>
              <label>Zip</label>
              <input
                type='text'
                name='zip'
                value={formData.zip}
                onChange={handleChange}
              />
              {errors.zip && <p className={styles.error}>{errors.zip}</p>}
            </div>
            <div className={styles.state}>
              <label>State</label>
              <select
                name='state' // You can use 'state' as the name
                value={formData.state}
                onChange={handleChange}
              >
                <option value=''>Select a state</option>{" "}
                <option value='Alabama'>Alabama</option>
                <option value='Alaska'>Alaska</option>
                <option value='Arizona'>Arizona</option>
                <option value='Arkansas'>Arkansas</option>
                <option value='California'>California</option>
                <option value='Colorado'>Colorado</option>
                <option value='Connecticut'>Connecticut</option>
                <option value='Delaware'>Delaware</option>
                <option value='Florida'>Florida</option>
                <option value='Georgia'>Georgia</option>
                <option value='Hawaii'>Hawaii</option>
                <option value='Idaho'>Idaho</option>
                <option value='Illinois'>Illinois</option>
                <option value='Indiana'>Indiana</option>
                <option value='Iowa'>Iowa</option>
                <option value='Kansas'>Kansas</option>
                <option value='Kentucky'>Kentucky</option>
                <option value='Louisiana'>Louisiana</option>
                <option value='Maine'>Maine</option>
                <option value='Maryland'>Maryland</option>
                <option value='Massachusetts'>Massachusetts</option>
                <option value='Michigan'>Michigan</option>
                <option value='Minnesota'>Minnesota</option>
                <option value='Mississippi'>Mississippi</option>
                <option value='Missouri'>Missouri</option>
                <option value='Montana'>Montana</option>
                <option value='Nebraska'>Nebraska</option>
                <option value='Nevada'>Nevada</option>
                <option value='New Hampshire'>New Hampshire</option>
                <option value='New Jersey'>New Jersey</option>
                <option value='New Mexico'>New Mexico</option>
                <option value='New York'>New York</option>
                <option value='North Carolina'>North Carolina</option>
                <option value='North Dakota'>North Dakota</option>
                <option value='Ohio'>Ohio</option>
                <option value='Oklahoma'>Oklahoma</option>
                <option value='Oregon'>Oregon</option>
                <option value='Pennsylvania'>Pennsylvania</option>
                <option value='Rhode Island'>Rhode Island</option>
                <option value='South Carolina'>South Carolina</option>
                <option value='South Dakota'>South Dakota</option>
                <option value='Tennessee'>Tennessee</option>
                <option value='Texas'>Texas</option>
                <option value='Utah'>Utah</option>
                <option value='Vermont'>Vermont</option>
                <option value='Virginia'>Virginia</option>
                <option value='Washington'>Washington</option>
                <option value='West Virginia'>West Virginia</option>
                <option value='Wisconsin'>Wisconsin</option>
                <option value='Wyoming'>Wyoming</option>
              </select>
              {errors.state && <p className={styles.error}>{errors.state}</p>}
            </div>
          </div>
    */
    if (!ppIsChecked) {
      newErrors.pp = "Must agree to the Privacy Policy to continue.";
      console.log("not checked ig");
    }

    if (!tosIsChecked) {
      newErrors.tos = "Must agree to the Terms of service to continue.";
      console.log("not checked ig");
    }

    const formDataToSend = { ...formData };
    delete formDataToSend.password2;
    if (Object.keys(newErrors).length === 0) {
      console.log("ran");
      axios
        .post("/api/createUser", formDataToSend)
        .then((response) => {
          if (response.status === 409) {
            newErrors.email = "Email taken";
          } else {
            console.log(response.data.user);
            setUser(response.data.user)
            if (currentPath == "/free-trial/signup") {
              console.log("free trial route")
              history.push("/free-trial");
            } else if (currentPath == "/subscription/signup") {
              history.push("/subscription");
            } else {
              history.push("/signin");
            }
          }
        })
        .catch((error) => {
          console.log("email taken");
          newErrors.email = "Email taken";
          setErrors(newErrors);
        });
    } else {
      console.log("errors: " + JSON.stringify(newErrors));
      setErrors(newErrors);
    }
  };

  return (
    <div className={styles.signUpPage}>
      <div className={styles.signUpContainer}>
        <h1>Sign Up</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Name</label>
            <input
              type='text'
              name='name'
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && <p className={styles.error}>{errors.name}</p>}
          </div>
          <div>
            <label>Email</label>
            <input
              type='email'
              name='email'
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <p className={styles.error}>{errors.email}</p>}
            {emailExists && (
              <p className={styles.error}>
                Email already exists. Please choose another or login.
              </p>
            )}
          </div>
          <div>
            <label>Password</label>
            <input
              type='password'
              name='password'
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && (
              <p className={styles.error}>{errors.password}</p>
            )}
            <label>Confirm Password</label>
            <input
              type='password'
              name='password2'
              value={formData.password2}
              onChange={handleChange}
            />
            {errors.password2 && (
              <p className={styles.error}>{errors.password2}</p>
            )}
          </div>
          
          <div className={styles.legalArea}>
            <div className={styles.checkBox}>
              <label>I have read and agree to the </label>
              <button
                onClick={() => setDisplay("tos")}
                className={styles.legalButton}
              >
                Terms of Service
              </button>
              <input
                type='checkbox'
                checked={tosIsChecked}
                onChange={() => {
                  setTosIsChecked(!tosIsChecked)
                }}
              />
            </div>
            {errors.tos && (<p className={styles.error}>{errors.tos}</p>)}

            <div className={styles.checkBox}>
              <label>I have read agree to the terms of the</label>
              <button
                onClick={() => setDisplay("pp")}
                className={styles.legalButton}
              >
                {" "}
                Privacy Policy
              </button>
              <input
                type='checkbox'
                checked={ppIsChecked}
                onChange={() => setPpIsChecked(!ppIsChecked)}
              />
            </div>
            {errors.pp && <p className={styles.error}>{errors.pp}</p>}
          </div>
          <button className={styles.button} type='submit'>
            Sign Up
          </button>
        </form>
      </div>
      {display == "tos" ? (
        <div className={styles.legalContainer}>
          <Tos />
        </div>
      ) : display === "pp" ? (
        <div className={styles.legalContainer}>
          <PrivacyPolicy />
        </div>
      ) : (
        <div className={styles.warningContainer}>
          <div className={styles.warningHeader}>
            <h1> Please Read: </h1>
          </div>
          <div className={styles.warningText}>
            <p>
              This application can make changes to your AWS account by your
              choice. It is highly reccomended you take every precaution
              possible to ensure your account remain secure in this application.
              Here are some tips to keep your account safe:
            </p>
            <ul>
              <li>
                DO NOT use admin level privelages in your Cloudimate IAM role
              </li>
              <li>Rotate your Cloudimate API key often</li>
              <li>
                Make a custom, least privelaged role to interface with
                Cloudimate
              </li>
              <li>Set up MFA</li>
              <li>Use a very strong password</li>
            </ul>
          </div>
        </div>
      )}
      ;
    </div>
  );
};

export default SignUp;
