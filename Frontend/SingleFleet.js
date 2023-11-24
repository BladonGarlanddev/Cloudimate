import { useParams } from "react-router-dom";
import RefreshBtn from "./RefreshBtn";
import DropdownBtn from "./DropdownBtn";
import Header from "./Header";
import Detail from "./Detail";
import { useEffect, useState } from "react";
import Loading from "./Loading";
import SuccessMessage from "./SuccessMessage";
import ErrorMessage from "./ErrorMessage";
import useAxios from "./api/axiosConfig";

const SingleFleet = ({selectedSchool}) => {

    // Gets the URL parameters, making this dynamic
    const { FleetName } = useParams();

    const [fleetDetails, setFleetDetails] = useState(null);

    const [refresh, setRefresh] = useState(false);

    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const [success, setSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);

    // Sets the state for the App Stream 2.0 instance metric data
    const[fleetData, setFleetData] = useState(null);

    const axios = useAxios();

    const handleRefresh = () => {
        setRefresh(true);
        setFleetDetails(null);
        setFleetData(null);
        getFleetDetails();
        getAppStreamData();
        setRefresh(false);
    }

    // Function that is used to show a Success or Error message after making a fetch request
    const RequestOutput = (data) => {
        if (data["statusCode"] === 200){
            setSuccess(true);
            console.log(data["body"]);
            setSuccessMessage(data["body"]);
        } else {
            setError(true);
            setErrorMessage(data["body"]);
        }
    }

    const getFleetDetails = () => {

        const url = new URL("https://rug0208del.execute-api.us-east-2.amazonaws.com/v1/fleets");
        url.searchParams.append("account_id", selectedSchool["account_id"]);
        url.searchParams.append("fleetname", FleetName);

        axios.get(url)
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                console.log(data);
                setFleetDetails(data["body"]);
            })
            .catch((error) => {
                console.log(error);
            })
    }

    const getAppStreamData = () => {

        const url = new URL("https://rug0208del.execute-api.us-east-2.amazonaws.com/v1/appstream");
        url.searchParams.append("fleetname", FleetName);

        axios.get(url)
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                setFleetData(data);
            })
            .catch((error) => {
                console.log(error);
            })
    }

    const handleFleetStatus = (option) => {
        if (option === 1){
            const request = {
                    "account_id": selectedSchool["account_id"],
                    "intent": true,
                    "fleets": [FleetName]
            }

            axios.patch("https://rug0208del.execute-api.us-east-2.amazonaws.com/v1/fleets", request)
                .then(response => {
                    return response.json();
                })
                .then(message => {
                    console.log(message);
                    RequestOutput(message);
                })
                .catch(error => {
                    console.log(error);
                    setError(true);
                    setErrorMessage(String(error));
                })
        } 
        else if (option === 2){
            const request = {
                    "account_id": selectedSchool["account_id"],
                    "intent": false,
                    "fleets": [FleetName]
            }

            axios.patch("https://rug0208del.execute-api.us-east-2.amazonaws.com/v1/fleets", request)
                .then(response => {
                    return response.json();
                })
                .then(message => {
                    console.log(message);
                    RequestOutput(message);
                })
                .catch(error => {
                    console.log(error);
                    setError(true);
                    setErrorMessage(String(error));
                })
        }
        else {
            const request  = {
                "account_id": selectedSchool["account_id"],
                "fleets": [FleetName]
            }

            axios.delete("https://rug0208del.execute-api.us-east-2.amazonaws.com/v1/fleets", request)
                .then(response => {
                    return response.json();
                })
                .then(message => {
                    RequestOutput(message);
                })
                .catch(error => {
                    console.log("error", error);
                })
        }

        handleRefresh();
    }
    
    // Options of the dropdown menu
    const dropdown = [
        {"Name": "Start Fleet", "Param": 1, "Function": handleFleetStatus},
        {"Name": "Stop Fleet", "Param": 2, "Function": handleFleetStatus},
        {"Name": "Delete", "Param": 3, "Function": handleFleetStatus}
    ];

    useEffect(() => {
        getFleetDetails();
        getAppStreamData();
    }, [])

    return ( 
        <div className="page">

            <div className="container">
                { success && <SuccessMessage setSuccess={setSuccess} successMessage={successMessage} setSuccessMessage={setSuccessMessage} /> }
                { error && <ErrorMessage  errorMessage={errorMessage} setErrorMessage={setErrorMessage} /> }
            </div>

            <div className="container space-y-5 lg:text-base sm:text-sm text-xs p-4">
                <h1 className="google-text font-normal text-lg">{FleetName}</h1>
                <div className="flex flex-row space-x-3">
                    {fleetDetails && (
                        <>
                            {(fleetDetails["State"] === "STOPPED" || fleetDetails["State"] === "STOPPING") ? (
                                <button onClick={() => handleFleetStatus(1)} className="primary-button">Start</button>
                            ) : (
                                <button onClick={() => handleFleetStatus(2)} className="primary-button">Stop</button>
                            )}
                        </>
                    )}
                    <button onClick={() => handleFleetStatus(3)} className="secondary-button">Delete</button>
                    <RefreshBtn handleRefresh={handleRefresh} />
                </div>
            </div>

            
            <div className="container sm:text-sm text-xs">
                <Header title="Fleet Details" />
                {fleetDetails ? (
                    <div className="grid grid-cols-2 gap-6 py-4 divide-x-2 divide-gray-200">
                        <div>
                            <Detail padding={true} label="Status" detail={fleetDetails["State"]} />
                        </div>
                        <div>
                            <Detail padding={true} label="Time Created" detail={fleetDetails["CreatedTime"]} />
                        </div>
                    </div>
                ) : (
                    !error && <Loading />
                )}
            </div>

            <div className="container sm:text-sm text-xs">
                <Header title="Fleet Usage" />
                {fleetData ? (
                    <div className="p-4">
                       
                    </div>
                ) : (
                    <Loading />
                )}
            </div>

            <div className="container sm:text-sm text-xs">
                <Header title="Fleet Configuration" />
                {fleetDetails ? (
                    <div className="grid grid-cols-2 gap-6 py-4 divide-x-2 divide-gray-200">
                        <div className="flex space-y-4 flex-col">
                            <Detail padding={true} label="Instance Type" detail={fleetDetails["InstanceType"]} />
                            <Detail padding={true} label="Fleet Type" detail={fleetDetails["FleetType"]} />
                            <Detail padding={true} label="Stream View" detail={fleetDetails["StreamView"]} />
                        </div>
                        <div className="flex space-y-4 flex-col">
                            <Detail padding={true} label="Disconnect Timeout (Seconds)" detail={fleetDetails["DisconnectTimeoutInSeconds"]} />
                            <Detail padding={true} label="Idle Timeout (Seconds)" detail={fleetDetails["IdleDisconnectTimeoutInSeconds"]} />
                            <Detail padding={true} label="Maximum Session Duration (Seconds)" detail={fleetDetails["MaxUserDurationInSeconds"]} />
                        </div>
                    </div>
                 ) : (
                    !error && <Loading />
                )}
            </div>          

            <div className="container sm:text-sm text-xs">
                <Header title="Image Details" />
                {fleetDetails ? (
                    <div className="py-4">
                        <Detail padding={true} label="Image Name" detail={fleetDetails["ImageName"]} link="image/{INSERT}" />                    
                    </div>
                ) : (
                    !error && <Loading />
                )}
            </div>            
        </div>
     );
}
 
export default SingleFleet;