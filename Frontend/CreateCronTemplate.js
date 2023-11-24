import { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import Detail from "./Detail";
import Header from "./Header";
import { Helmet } from "react-helmet";
import axiosInstance from "./api/axiosConfig";

const CreateCronTemplate = ({_header}) => {
    const axios = axiosInstance();
    const history = useHistory();
    // A list containing all of the steps in the form
    const step = [
        {id: 0, title: "Step 1", detail: "Template Details"},
        {id: 1, title: "Step 2", detail: "Define Cron Template"},
        {id: 2, title: "Step 3", detail: "Review Details"}
    ];

    // Holds the data as a state so that it can be updated
    const [data, setData] = useState({
        template_name: null, 
        description: null, 
        hour: null, 
        minute: null, 
        month: null, 
        day_of_month: null, 
        day_of_week: null, 
        year: null
    });

    // Holds the state of the current step. Starts at Step 0
    const [currentStep, setCurrentStep] = useState(0);

    // Holds a list of Errors
    const [errorMessageS, setErrorMessageS] = useState([]);

    // Validates the inputs given in each step
    const handleStep = (step, value) => {
        // Initializes an emtpy list
        let listOfErrors = []

        // Checks for step 0
        if (step == 0){
            // Check if the name is not empty
            if (data.template_name === "" || data.template_name === null) listOfErrors.push("Name can not be left empty");
        }
        // Checks for step 1
        else if (step == 1){
            // Checks each for the patterns of each individual CRON input field

            const minutePattern = /^(?:\*|(?:[0-5]?[0-9])(?:-(?:[0-5]?[0-9]))?)$/;
            if (!minutePattern.test(data.minute)) listOfErrors.push("Minute should be a number between 0 and 59 or an asterisk (*)");
       
            const hourPattern = /^(?:\*|(?:[01]?[0-9]|2[0-3])(?:-(?:[01]?[0-9]|2[0-3]))?)$/;
            if (!hourPattern.test(data.hour)) listOfErrors.push("Hour should be a number between 0 and 23 or an asterisk (*)");
                        
            const dayOfMonthPattern = /^(?:\*|\?|[1-9]|[12][0-9]|3[01])$/;
            if (!dayOfMonthPattern.test(data.day_of_month)) listOfErrors.push("Day of Month shoud be a number between 1 and 31, an asterisk (*), or a question mark (?)");

            const monthPattern = /^(?:\*|(?:[1-9]|1[0-2])(?:-(?:[1-9]|1[0-2]))?|(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)(?:-(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC))?)$/;
            if (!monthPattern.test(data.month)) listOfErrors.push("Month should be a number between 1 and 12, the name of a month (JAN-DEC), or an asterisk (*)");
    
            const dayOfWeekPattern = /^(?:\*|(?:[0-7])(?:-(?:[0-7]))?|(?:MON|TUE|WED|THU|FRI|SAT|SUN)(?:-(?:MON|TUE|WED|THU|FRI|SAT|SUN))?)|\?$/;
            if (!dayOfWeekPattern.test(data.day_of_week)) listOfErrors.push("Day of Week should be the name of a day (MON-SUN), an asterisk (*), or a question mark (?)");

            const yearPattern = /^(?:\*|\d{4})$/;
            if (!yearPattern.test(data.year)) listOfErrors.push("Year should be a a 4-digit number or an asterisk (*)");

            // Day of week and Day of Month both can't be values. One has to be a '?'
            if (!(data.day_of_week === "?" ^ data.day_of_month === "?")) listOfErrors.push("Either Day of Week or Day of Month should be set to '?'");
        }

        // Show the list of errors if any.
        if (listOfErrors.length > 0){
            setErrorMessageS(listOfErrors);
        }
        // Emtpy the errors and go onto the next step
        else {
            setErrorMessageS([]);
            setCurrentStep(currentStep + 1);
        }
    }

    // Submits to the Laravel API
    const handleSubmission = async (e) => {
        e.preventDefault();
      
        try {
          const response = await axios
            .post("/api/makeCronTemplate/", data)
            .then((response) => {
                history.push('/app/templates')
            })
            .catch((error) => {
              console.log(error);
            });
      
        } catch (error) {
          console.error('Error submitting data:', error);
        }
    };


    return ( 
        <div className="my-5 flex flex-row space-x-5 mx-5">
            <Helmet>
                <title>Cloudimate | Cron Builder</title>
            </Helmet>

            <div className="hidden sm:flex flex-col space-y-6 p-4 w-1/5">
                {step.map((obj) => (
                    (currentStep === obj.id) ? (
                        <p onClick={() => setCurrentStep(obj["id"])} className="underline hover:cursor-pointer">
                                <Detail label={obj["title"]} detail={obj["detail"]} />
                        </p>
                    ) : (
                        (obj.id > currentStep) ? (
                            <p className="text-gray-500" >
                                <Detail label={obj["title"]} detail={obj["detail"]} />
                            </p>
                        ) : (
                            <p onClick={() => setCurrentStep(obj["id"])} className="hover:cursor-pointer">
                                <Detail label={obj["title"]} detail={obj["detail"]} />
                            </p>
                        )
                    )
                ))}
            </div>
            <div className="container">
                <Header title={step[currentStep]["detail"]} />
                <form className="p-4 flex flex-col space-y-5 text-sm" onSubmit={handleSubmission} >
                    {currentStep === 0 && (
                        <>
                            <div className="space-y-1">
                                <Detail label={"Template Name"} detail={"Enter the name of your cron template."} required={true} />
                                <input autoFocus onChange={(e) => setData({...data, template_name: e.target.value})} value={data.template_name} type="text" required placeholder="template-name" className="input-text"/>
                            </div>
                            <div className="space-y-1">
                                <Detail label={"Description"} detail={"Enter the name of your cron template."} />
                                <input onChange={(e) => setData({...data, description: e.target.value})} value={data.description} type="text" placeholder="Enter Description" className="input-text"/>
                            </div>
                        </>
                    )}
                    {currentStep === 1 && (
                        <div className="flex flex-col space-y-4">
                            <Detail label={"Cron Expression"} detail={"Define the cron expression for the template"} required={true} />
                            <span className="items-center space-x-2 flex flex-row">
                                <p>cron(</p> 
                                <input onChange={(e) => setData({...data, minute: e.target.value})} value={data.minute} type="text" className="input-text" placeholder="minute"/>
                                <input onChange={(e) => setData({...data, hour: e.target.value})} value={data.hour} type="text" className="input-text" placeholder="hour"/>
                                <input onChange={(e) => setData({...data, day_of_month: e.target.value})} value={data.day_of_month} type="text" className="input-text" placeholder="day of month"/>
                                <input onChange={(e) => setData({...data, month: e.target.value})} value={data.month} type="text" className="input-text" placeholder="month" />
                                <input onChange={(e) => setData({...data, day_of_week: e.target.value})} value={data.day_of_week} type="text" className="input-text" placeholder="day of week" />
                                <input onChange={(e) => setData({...data, year: e.target.value})} value={data.year} type="text" className="input-text" placeholder="year" />
                                <p>)</p>
                            </span>
                            {!(data.day_of_week == "?" ^ data.day_of_month == "?") && (
                                <p className="required text-xs">Either <u>Day of Week</u> or <u>Day of Month</u> should be set to "?"</p>
                            )}
                        </div>
                    )}
                    { currentStep === 2 && (
                        <div className="flex flex-col space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                { data.template_name ? (
                                    <Detail label={"Template Name"} detail={data.template_name} />
                                ) : (
                                    <Detail label={"Template Name"} detail={"empty"} required={true} />
                                )}
                                { data.description ? (
                                    <Detail label={"Description"} detail={data.description} />
                                ) : (
                                    <Detail label={"Description"} detail={"empty"} />
                                )}
                                <Detail label={"Cron Expression"} detail={data["hour"] + " " + data["minute"] + " " + data["day_of_month"] + " " + data["month"] + " " + data["day_of_week"] + " " + data["year"] } />
                            </div>
                        </div>
                    )}
                    <div className="flex flex-row justify-between space-x-5">
                        <Link to="/app/templates">
                            <button type="button" className="secondary-button flex flex-row items-center space-x-1">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                                </svg>
                                <p>Cancel</p>
                            </button>
                        </Link> 
                        <div className="space-x-4">
                            { currentStep >= 1 && (
                                currentStep <= 2 && (
                                    <button onClick={() => setCurrentStep(currentStep - 1)} type="button" className="secondary-button">Previous</button>
                                )
                            ) }
                            { currentStep <= 1 && (
                                currentStep >= 0 && (
                                    <button onClick={() => handleStep(currentStep)} type="button" className="secondary-button">Next</button>
                                )
                            ) }
                            { currentStep === 2 && (
                                errorMessageS.length === 0 ? (
                                    <input className="primary-button cursor-pointer" type="submit" value={"Create"}/>
                                ) : ( 
                                    <button className="primary-button-disabled" disabled>{"Create"}</button>
                                )
                            )}
                        </div>
                    </div>
                </form>
            </div>
            <div className="flex flex-col w-1/6 space-y-2">
                {errorMessageS.map((message) => (
                    <span className="error">{message}</span>
                ))}
            </div>
        </div>
     );
}
 
export default CreateCronTemplate;