import React, { useState, useContext, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import { UserContext } from "./context/UserContext";
import styles from "./styling/SettingsPage.module.css";
import gear from "./assets/gear.png";
import billing from "./assets/billing.png";
import profile from "./assets/profile.png";
import calendar from "./assets/calendar.png";
import bolt from "./assets/bolt.png";
import useAxios from "./api/axiosConfig";
import QRCode from "qrcode.react";
import Popup from "./Popup";

const SettingsPage = ({ selectedRegion, setSelectedRegion}) => {
  const [selectedItem, setSelectedItem] = useState("Account"); // Initial selected item
  const [events, setEvents] = useState([]);
  const eventAreaBody = useRef(null);
  const { user, setUser } = useContext(UserContext);
  const [qrCode, setQrCode] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isSet, setIsSet] = useState(false);
  const [lastToggleTime, setLastToggleTime] = useState(0);
  const [lastTokenTime, setLastTokenTime] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState();
  const [subscriptionDetails, setSubscriptionDetails] = useState()
  const [newName, setNewName] = useState(user.name);
  const [region, setRegion] = useState(null);
  
  const popupValue = useRef("");
  const axios = useAxios();
  const history = useHistory();
  
  const regions = [
    "us-east-1", // US East (N. Virginia)
    "us-east-2", // US East (Ohio)
    "us-west-1", // US West (N. California)
    "us-west-2", // US West (Oregon)
    "af-south-1", // Africa (Cape Town)
    "ap-east-1", // Asia Pacific (Hong Kong)
    "ap-south-1", // Asia Pacific (Mumbai)
    "ap-northeast-1", // Asia Pacific (Tokyo)
    "ap-northeast-2", // Asia Pacific (Seoul)
    "ap-northeast-3", // Asia Pacific (Osaka-Local)
    "ap-southeast-1", // Asia Pacific (Singapore)
    "ap-southeast-2", // Asia Pacific (Sydney)
    "ca-central-1", // Canada (Central)
    "eu-central-1", // Europe (Frankfurt)
    "eu-west-1", // Europe (Ireland)
    "eu-west-2", // Europe (London)
    "eu-west-3", // Europe (Paris)
    "eu-north-1", // Europe (Stockholm)
    "eu-south-1", // Europe (Milan)
    "me-south-1", // Middle East (Bahrain)
    "sa-east-1", // South America (São Paulo)
  ];

  useEffect(() => {
    // This function will run when the component mounts
    axios
      .post("/api/getMFADetails", { email: user.email })
      .then((response) => {
        console.log(response);
        if (response.data.mfa_enabled == true) {
          setIsActive(true);
        } else {
          setIsActive(false);
        }
        if (response.data.is_pending == true || response.data.is_pending == 1) {
          setIsPending(true);
          setEvents([
            ...events,
            {
              type: "Important",
              message:
                "Your MFA is currently in a pending state. Add the QR code to google auth then authenticate using a code from Google Auth in Cloudimate. If you are still having issues contact customer support.",
            },
          ]);
        } else {
          setIsPending(false);
        }
        if (response.data.is_set == true) {
          setIsSet(true);
        } else {
          setIsSet(false);
        }
      })
      .catch((error) => {
        setEvents([
          ...events,
          {
            type: "Error",
            message: "There was an error retrieving MFA details",
          },
        ]);
      });

    axios
      .post("/api/getSubscriptionData", { email: user.email })
      .then((response) => {
        handleDate(response.data.end_date, response.data.subscription_type);
      })
      .catch((error) => {
        setEvents([
          ...events,
          {
            type: "Error",
            message: "There was an error getting subscription data",
          },
        ]);
      });
    
      axios
      .get("/api/getDefaultRegion")
      .then((response) => {
        setRegion(response.data);
      })
      .catch((error) => {
        setEvents([
          ...events,
          {
            type: "Error",
            message: "There was an error getting your default region ",
          },
        ]);
      });
  }, []);

  useEffect(() => {
    const scrollToBottom = () => {
      const element = eventAreaBody.current;
      element.scrollTop = element.scrollHeight;
    };

    scrollToBottom();
  }, [events]);

  const handleDate = ($endDate, $subscriptionType) => {
    let formattedEndDate = $endDate;

// If the end date is not 'Never expires', format it as per the requirement.
    if ($endDate !== "Never expires" && $endDate !== "N/A") {
      console.log("end date: " + $endDate)
      const dateObject = new Date($endDate);
      const monthShortName = dateObject.toLocaleString("default", {
        month: "short",
      });
      const day = dateObject.getDate();
      formattedEndDate = `${monthShortName} ${day}`;
    } else if ($endDate !== "Never expires") {
      setSubscriptionDetails({
        endDate: "Never Ends",
        type: "Free",
      });
    } else {
      setSubscriptionDetails({
        endDate: "N/A",
        type: "No Subscription",
      });
    }

// Update the subscriptionDetails state
    setSubscriptionDetails({
      endDate: formattedEndDate,
      type:
      $subscriptionType === "free-trial" ? "Free Trial" : $subscriptionType,
    });
  }
  console.log(subscriptionDetails);

  const handleItemClick = (item) => {
    setSelectedItem(item); // Update the selected item when clicked
  };

  const handleNameBlur = () => {
    sendNameUpdate();
  };

  const handleNameKeyUp = (e) => {
    if (e.key === "Enter") {
      sendNameUpdate();
    }
  };

  const handleNameChange = (e) => {
    setNewName(e.target.value);
  };

  const sendNameUpdate = () => {
    if (newName !== user.name) {
      axios
        .put("/api/updateName", { email: user.email, name: newName })
        .then((response) => {
          setUser({...user, name: newName});
          setEvents([
            ...events,
            {
              type: "Info",
              message: "Name changed",
            },
          ]);
        })
        .catch((error) => {
          setEvents([
            ...events,
            {
              type: "Error",
              message: "Name change failed",
            },
          ]);
        });
    }
  };

  const handleSubscriptionCancel = () => {
    axios
      .post("/api/deleteSubscription", user)
      .then((response) => {
        console.log(response);
        setEvents([
          ...events,
          {
            type: "Info",
            message: "Subscription successfully deleted",
          },
        ]);
      })
      .catch((error) => {
        console.log(error);
        setEvents([
          ...events,
          {
            type: "Error",
            message:
              "Subscription failed to deleted. This event has been recorded and will be addressed. If you get charged again contact customer support",
          },
        ]);
      });
  };

  const updateAwsCredentials = (e) => {
    e.preventDefault();
    console.log(user);
    const ARN = e.target.elements["ARN"].value;
    axios
      .post("/api/updateAwsCredentials", {arn: ARN})
      .then((response) => {
        console.log(response);
        setEvents([
          ...events,
          {
            type: "Info",
            message: "Credentials successfully updated",
          },
        ]);
      })
      .catch((error) => {
        console.log(error);
        setEvents([
          ...events,
          {
            type: "Error",
            message:
              "Subscription failed to deleted. This event has been recorded and will be addressed. If you get charged again contact customer support",
          },
        ]);
      });
  };

  const getQR = () => {
    axios
      .post("/api/enableMfa", { email: user.email })
      .then((response) => {
        setQrCode(response.data.qrCodeUrl);
        setEvents([
          ...events,
          {
            type: "Info",
            message: "QR code successfully made",
          },
        ]);
      })
      .catch((error) => {
        setEvents([
          ...events,
          {
            type: "Error",
            message: "MFA set up failed. You most likely don't have a subscription",
          },
        ]);
      });
  };

  const validateMfa = (event) => {
    event.preventDefault();
    axios
      .post("/api/validateMfa", {
        email: user.email,
        otp: event.target.elements.TOPT.value,
      })
      .then((response) => {
        setIsActive(true);
        setIsPending(false);
        setIsSet(true);
        setEvents([
          ...events,
          {
            type: "Info",
            message: "MFA is now activated",
          },
        ]);
      })
      .catch((error) => {
        console.log(error);
        setEvents([
          ...events,
          {
            type: "Error",
            message: "MFA validation failed",
          },
        ]);
      });
  };

  const getToken = (e) => {
    e.preventDefault();

    axios
      .get("/api/getResetToken", user)
      .then((response) => {
        console.log(response);
        setEvents([
          ...events,
          {
            type: "Info",
            message: "One time code was made",
          },
        ]);
      })
      .catch((error) => {
        console.log(error);
        setEvents([
          ...events,
          {
            type: "Error",
            message:
              "One time code failed. You must wait 5 minutes between code requests",
          },
        ]);
      });
  };

  const changePassword = (e) => {
    e.preventDefault();
    const password = e.target.elements["password"].value;
    const new_password = e.target.elements["new_password"].value;
    const confirmPassword = e.target.elements["confirm_password"].value;
    const token = e.target.elements["token"].value;

    if (new_password !== confirmPassword) {
      setEvents([
        ...events,
        {
          type: "Error",
          message: "passwords do not match",
        },
      ]);
      return null;
    }

    const data = { user, password, new_password, token };
    axios
      .post("/api/changePassword", data)
      .then((response) => {
        console.log(response);
        setEvents([
          ...events,
          {
            type: "Info",
            message: "Password Successfully changed",
          },
        ]);
      })
      .catch((error) => {
        console.log(error);
        setEvents([
          ...events,
          {
            type: "Error",
            message: "Password change failed",
          },
        ]);
      });
  };

  const rotateApiKey = (e) => {
    e.preventDefault();

    axios
      .put("/api/rotateApiKey", user)
      .then((response) => {
        console.log("api_key: " + response.data.api_key);
        setUser({...user,
          api_key: response.data.api_key,
        });
        setEvents([
          ...events,
          {
            type: "Info",
            message: "Successfully rotated API key",
          },
        ]);
      })
      .catch((error) => {
        console.log(error);
        setEvents([
          ...events,
          {
            type: "Error",
            message:
              "Could not rotate API key. You most likely don't have a membership.",
          },
        ]);
      });
  };

  const toggleButton = () => {
    const currentTime = new Date().getTime();
    const timeDifference = (currentTime - lastToggleTime) / 1000;

    if (timeDifference < 10) {
      setEvents([
        ...events,
        {
          type: "Error",
          message:
            "You have to wait atleast 10 seconds between toggles. This is done to prevent someone from overloading the server with requests.",
        },
      ]);
      return;
    }

    axios
      .post("/api/toggleMFA", { email: user.email, otp: popupValue.current })
      .then((response) => {
        setIsActive(!isActive);
        setEvents([
          ...events,
          {
            type: "Important",
            message: `MFA toggled to ${!isActive}`,
          },
        ]);
      })
      .catch((error) => {
        setEvents([
          ...events,
          {
            type: "Error",
            message: "Error toggling MFA. MFA retained its state",
          },
        ]);
      });
    setLastToggleTime(currentTime);
  };

  const setDefaultRegion = () => {
    axios.post("/api/setDefaultRegion", {region: selectedRegion})
    .then((response) => {
      setRegion(response.data);
      setEvents([
        ...events,
        {
          type: "info",
          message: "Default region set",
        },
      ]);
    })
    .catch((error) => {
      setEvents([
        ...events,
        {
          type: "Error",
          message: "Error setting default region",
        },
      ]);
    })
  }

  return (
    <div className={styles.settingsPage}>
      <Popup
        show={showPopup}
        message='Enter Google Auth MFA code to disable MFA'
        showInput={true}
        buttonText='Submit'
        onClose={(input) => {
          setShowPopup(false);
          popupValue.current = input;
          toggleButton();
        }}
      />
      <div className={styles.settingsLeftNav}>
        <div className={styles.settingsNav}>
          <ul>
            <li
              className={selectedItem === "Account" ? styles.selected : ""}
              onClick={() => handleItemClick("Account")}
            >
              <img src={gear} className={styles.icon} />
              Account
            </li>
            <li
              className={selectedItem === "Billing" ? styles.selected : ""}
              onClick={() => handleItemClick("Billing")}
            >
              <img src={billing} className={styles.icon} />
              Billing
            </li>
            <li
              className={selectedItem === "Profile" ? styles.selected : ""}
              onClick={() => handleItemClick("Profile")}
            >
              <img src={profile} className={styles.icon} />
              Profile
            </li>
          </ul>
        </div>
        <div className={styles.eventArea}>
          <div className={styles.eventAreaHeader}>
            <h1>Events</h1>
          </div>
          <div className={styles.eventAreaBody} ref={eventAreaBody}>
            <div className={styles.eventTextArea}>
              {events.length !== 0 && events.map((event) => (
                <div className={styles.message}>
                  <p
                    className={
                      event.type === "Error"
                        ? styles.typeError
                        : event.type === "Important"
                        ? styles.typeImportant
                        : styles.type
                    }
                  >
                    {event.type}
                  </p>
                  <p>{event.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.settingsArea}>
        {selectedItem === "Account" && (
          <>
            <div className={styles.settingsContainer}>
              <div className={styles.settingsHeader}>
                <h1>
                  AWS Role ARN
                  <p>Manage your AWS credentials</p>
                </h1>
              </div>
              <form onSubmit={updateAwsCredentials}>
                <label>Role ARN</label>
                <input name='ARN'></input>
                <button type='submit'>Update Credentials</button>
              </form>
            </div>
            <div
              className={styles.qrContainer + " " + styles.settingsContainer}
            >
              {isSet ? (
                // Render the slider when isSet is true
                <div className={styles.toggleArea}>
                  {isActive ? <h2>MFA enabled</h2> : <h2>MFA disabled</h2>}
                  <div
                    className={`${styles.toggleButton} ${
                      isActive ? styles.active : ""
                    }`}
                    onClick={() =>
                      isActive ? setShowPopup(true) : toggleButton()
                    }
                  >
                    <div className={styles.toggleButtonCircle}></div>
                  </div>
                </div>
              ) : !qrCode && !isPending ? (
                // Render the "Set Up MFA" button if isSet is false and qrCode is either false or null
                <button onClick={getQR}>Set Up MFA</button>
              ) : (
                // Render the QR code if the state is either pending or has received a QR URL
                <>
                  <QRCode value={qrCode} />
                  <form onSubmit={validateMfa}>
                    <label> TOPT Code </label>
                    <input name='TOPT' />
                    <button type='submit'>Validate MFA</button>
                  </form>
                  <div className={styles.qrTextArea}>
                    <h1>How to enable MFA</h1>
                    <ul>
                      <li>
                        Scan this QR with your phone using Google Authenticator
                      </li>
                      <li>
                        A 6 digit code will appear, enter it into the input next
                        to the QR
                      </li>
                      <li>Hit the validate button</li>
                    </ul>
                  </div>
                </>
              )}
            </div>
            <div className={styles.settingsContainer}>
              <div className={styles.settingsHeader}>
                <h1>Change Password</h1>
                <p></p>
              </div>
              <form onSubmit={changePassword}>
                <label>Password</label>
                <input name='password'></input>
                <label>New password </label>
                <input name='new_password'></input>
                <label>Confirm password </label>
                <input name='confirm_password'></input>
                <label>Verification Code </label>
                <input name='token'></input>
                <button
                  className={styles.verificationCodeButton}
                  onClick={getToken}
                >
                  Get Verification Code
                </button>
                <button type='submit'>Submit</button>
              </form>
            </div>
            <div className={styles.settingsContainer}>
              <h1>API key last rotated (days) ago</h1>
              <div className='ml-3'>
                {showApiKey ? (
                  <h2>API key: {user.api_key}</h2>
                ) : (
                  <button onClick={() => setShowApiKey(true)}>Show key</button>
                )}
              </div>
              <button onClick={rotateApiKey}>Rotate API key</button>
            </div>
          </>
        )}
        {selectedItem === "Billing" && (
          <>
            <div className={styles.settingsContainer}>
              <h1>Statements</h1>
            </div>
            <div className={styles.settingsContainer}>
              <div className={styles.settingsHeader}>
                <h1>Subscription Plan</h1>
                <p>Your current plan and usage across this biling cycle</p>
              </div>
              <div className={styles.settingsBody}>
                <div className={styles.settingsBodyChild}>
                  <img src={bolt} className={styles.subscriptionIcon} />
                  <div className={styles.imGettingTiredOfComingUpWithNames}>
                    <h1>{subscriptionDetails.type}</h1>
                    <p>Plan</p>
                  </div>
                </div>
                <div className={styles.settingsBodyChild}>
                  <img src={calendar} className={styles.subscriptionIcon} />
                  <div className={styles.imGettingTiredOfComingUpWithNames}>
                    <h1>{subscriptionDetails.endDate}</h1>
                    <p>Turnover Date</p>
                  </div>
                </div>
              </div>
              {subscriptionDetails.type == "No Subscription" && (
                <button
                  className='mt-4'
                  onClick={() => {
                    history.push("/subscription");
                  }}
                >
                  Get a subscription
                </button>
              )}
            </div>
            {!subscriptionDetails.type == "No Subscription" && (
              <a onClick={handleSubscriptionCancel}>Cancel Subscription</a>
            )}
          </>
        )}

        {selectedItem === "Profile" && (
          <>
            <div className={styles.settingsContainer}>
              <div className={styles.settingsHeader}>
                <h1>User Data</h1>
                <p></p>
              </div>
              <div className={styles.looseText}>
                <h1>
                  Name:{" "}
                  <input
                    placeholder={user.name}
                    onChange={handleNameChange}
                    onBlur={handleNameBlur}
                    onKeyUp={handleNameKeyUp}
                  />
                </h1>
                <h1> Email: {user.email}</h1>
                <h1>Default Region: {region ? region : "None set"}</h1>
                {region ? (
                  <button onClick={() => setRegion(null)}>Change Default Region</button>
                ) : (
                  <>
                    <div className={styles.regionsArea}>
                      {regions.map((r) => (
                        <div key={r} className='flex items-center my-2'>
                          <input
                            type='radio'
                            name='region'
                            value={r}
                            onChange={(e) => setSelectedRegion(e.target.value)}
                            className='align-middle'
                          />
                          <span className='-ml-5 p-0'>{r}</span>
                        </div>
                      ))}
                    </div>
                    <button onClick={setDefaultRegion}>
                      Set default region
                    </button>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
