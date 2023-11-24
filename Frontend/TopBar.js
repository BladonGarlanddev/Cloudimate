import { useEffect, useState, useContext } from "react";
import useGetAccounts from "./api/useGetAccounts";
import { handleLogout } from "./util/auth";
import { UserContext } from "./context/UserContext";
import { useHistory, useLocation } from "react-router-dom";
import Logo from "./assets/blue-cloud-logo.png";
import styles from "./styling/TopBar.module.css";
import axiosInstance from "./api/axiosConfig";
import Routes from "./util/RenderRoutes.json";

const TopBar = ({
  accounts,
  setAccounts,
  selectedAccount,
  setSelectedAccount,
  selectedRegion,
  setSelectedRegion
}) => {
  
  const axios = axiosInstance();
  const { user, setUser } = useContext(UserContext);
  const history = useHistory();
  const location = useLocation();

  const [userDropdown, setUserDropdown] = useState(false);
  const [accountDropDown, setAccountDropDown] = useState(false);
  const [regionDropDown, setRegionDropDown] = useState(false);

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

  console.log(JSON.stringify(user));
  console.log("selected region: " + selectedRegion)
  useEffect(() => {
    axios
      .get("/api/aws/getAccounts")
      .then((response) => {
        const data = response.data;
        console.log("data: " + data);
        setAccounts([data]);
        if (Array.isArray(data)) {
          setSelectedAccount(data[0]);
        } else {
          setSelectedAccount(data);
        }
      })
      .catch((error) => {
        setAccounts(["No account"]);
        setSelectedAccount(accounts[0]);
        console.log(error);
      });

    if(selectedRegion == null) {
      axios
        .get("/api/getDefaultRegion")
        .then((response) => {
          console.log("response data: (" + response.data + ")");
          console.log("Data type:", typeof response.data);
          if (
            response.data &&
            typeof response.data === "string" &&
            response.data.trim() !== "" &&
            selectedRegion == null
          ) {
            setUser({ ...user, region: response.data });
            setSelectedRegion(response.data);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
    
  }, []);

  const handleAccount = (account) => {
    setSelectedAccount(account);
    handleDropDown(0);
  };

  const handleRegion = (region) => {
    setSelectedRegion(region);
    setUser({ ...user, region: region });
    handleDropDown(2);
  };

  const handleDropDown = (num) => {
    switch (num) {
      case 0:
        switch (accountDropDown) {
          case false:
            setUserDropdown(false);
            setRegionDropDown(false);

            setAccountDropDown(true);
            break;
          case true:
            setAccountDropDown(false);
            break;
        }
        break;
      case 1:
        switch (userDropdown) {
          case false:
            setAccountDropDown(false);
            setRegionDropDown(false);
            setUserDropdown(true);
            break;
          case true:
            setUserDropdown(false);
            break;
        }
        break;
      case 2:
        switch (regionDropDown) {
          case false:
            setAccountDropDown(false);
            setUserDropdown(false);
            setRegionDropDown(true);
            break;
          case true:
            setRegionDropDown(false);
            break;
        }
        break;
    }
  };

  return (
    <div className={styles.topBarContainer}>
      {Routes.routes.includes(location.pathname) && (
        <button onClick={() => history.push("/app/")}>
          <img src={Logo} className='w-8 -mt-2 -mb-2 mr-3 p-0' />
        </button>
      )}

      <div className={styles.contentArea}>
        <button
          onClick={() => handleDropDown(2)}
          className='flex flex-row space-x-1 items-center navbar-option'
        >
          <span className='font-normal text-sm text-ellipsis overflow-hidden whitespace-nowrap'>
            {selectedRegion ? selectedRegion : <p>No Region</p>}
          </span>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth='3'
            stroke='currentColor'
            className='w-4 h-4'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M19.5 8.25l-7.5 7.5-7.5-7.5'
            />
          </svg>
        </button>
        <button
          onClick={() => handleDropDown(0)}
          className='flex flex-row space-x-1 items-center navbar-option'
        >
          <span className='font-normal text-sm text-ellipsis overflow-hidden whitespace-nowrap'>
            {selectedAccount}
          </span>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth='3'
            stroke='currentColor'
            className='w-4 h-4'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M19.5 8.25l-7.5 7.5-7.5-7.5'
            />
          </svg>
        </button>
        {regionDropDown && (
          <div className={styles.regionDropDown}>
            {regions.map((region, index) =>
              region !== selectedRegion ? (
                <button
                  key={index}
                  onClick={() => handleRegion(region)}
                  className='font-thin p-2 w-full text-start text-white hover:text-yellow-600 transition-all'
                >
                  {region}
                </button>
              ) : (
                <button
                  key={index}
                  onClick={() => handleRegion(region)}
                  className='font-normal p-2 w-full text-start text-yellow-600 transition-all'
                >
                  {region}
                </button>
              )
            )}
          </div>
        )}
        {accountDropDown && (
          <div className={styles.accountDropDown}>
            {accounts.length > 0 &&
              accounts.map((account, index) =>
                account !== selectedAccount ? (
                  <button
                    key={index}
                    onClick={() => handleAccount(account)}
                    className='font-thin p-2 text-start text-white hover:text-yellow-600 transition-all'
                  >
                    {account}
                  </button>
                ) : (
                  <button
                    key={index}
                    onClick={() => handleAccount(account)}
                    className='font-normal p-2 w-full text-start text-yellow-600 transition-all'
                  >
                    {account}
                  </button>
                )
              )}
          </div>
        )}
      </div>
      <div className='relative flex'>
        <button
          onClick={() => handleDropDown(1)}
          className='flex flex-row space-x-1 items-center navbar-option w-fit'
        >
          <span className='font-normal text-sm whitespace-nowrap'>
            {user.name}
          </span>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth='3'
            stroke='currentColor'
            className='w-4 h-4'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M19.5 8.25l-7.5 7.5-7.5-7.5'
            />
          </svg>
        </button>
        {userDropdown && (
          <div
            style={{ backgroundColor: "rgb(48, 48, 48)" }}
            className='appDropDown absolute right-0 top-10 flex flex-col w-60 text-xs text-white p-2 space-y-2'
          >
            <span>
              <a
                className='hover:text-yellow-600 transition-all'
                onClick={() => history.push("/app/settings")}
              >
                Settings
              </a>
            </span>
            <span>
              <a
                className='hover:text-yellow-600 transition-all'
                onClick={() => history.push("/app/help")}
              >
                Help
              </a>
            </span>
            <span className='text-gray-400'>Name: {user.name}</span>
            <span className='text-gray-400'>Email: {user.email}</span>
            <button
              onClick={() => {
                history.push("/signin");
                handleLogout(setUser, history);
              }}
              className='primary-button'
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopBar;
