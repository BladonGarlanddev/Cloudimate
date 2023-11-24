import { useEffect, useState } from "react";
import ErrorMessage from "./ErrorMessage";
import Header from "./Header";
import Detail from "./Detail";
import SubmitBtn from "./SubmitBtn";
import useAxios from "./api/axiosConfig";

const SchedulePopUp = ({selectedSchool, handleFleetStatus, selected, RequestOutput}) => {
    const axios = useAxios();
    useEffect(() => {

        axios.get("https://rug0208del.execute-api.us-east-2.amazonaws.com/v1/rules")
            .then(response => {
                return response.json();
            })
            .then(data => {
                setRules(data);
            })
    }, []);

    const [error, setError] = useState({open: false});
    const [errorMessages, setErrorMessages]= useState([]);

    const handleSubmission = (e) => {
        e.preventDefault();

        setVerify(true);

        let errors = 0;

        let listofErrors = [];

        if (ruleError.open){
            errors ++;
            listofErrors.push("Invalid input for Name. Name has been taken.")
        }
        if (formData.name.length < 1){
            errors ++;
            listofErrors.push("Invalid input for Name. Name can not be empty.")
        }
        if (formData.intent === ""){
            errors ++;
            listofErrors.push("Invalid input for Intent. Must be Start or Stop.")
        }

        switch(mode){
            case "template":
                if (!selectedTemplate){
                    errors ++;
                    listofErrors.push("Select a template.");
                }
                break;
            case "custom":
                let minutePattern = /^(?:\*|(?:[0-5]?[0-9])(?:-(?:[0-5]?[0-9]))?)$/;

                if (!minutePattern.test(formData.minute)){
                    errors ++;
                    listofErrors.push("Invalid input for Minute. Use integers 0-59 or *");
                };

                let hourPattern = /^(?:\*|(?:[01]?[0-9]|2[0-3])(?:-(?:[01]?[0-9]|2[0-3]))?)$/;

                if (!hourPattern.test(formData.hour)){
                    errors ++;
                    listofErrors.push("Invalid input for Hour. Use integers 0-23 or *");
                };

                let dayOfMonthPattern = /^(?:\*|\?|[1-9]|[12][0-9]|3[01])$/;

                if (!dayOfMonthPattern.test(formData.dayOfMonth)){
                    errors ++;
                    listofErrors.push("Invalid input for Day of Month. Use integers 1-31, *, or ?");
                };

                let monthPattern = /^(?:\*|(?:[1-9]|1[0-2])(?:-(?:[1-9]|1[0-2]))?|(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)(?:-(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC))?)$/;

                if (!monthPattern.test(formData.month)){
                    errors ++;
                    listofErrors.push("Invalid input for Month. Use integers 1-12, JAN-DEC or *");
                };

                let dayOfWeekPattern = /^(?:\*|(?:[0-7])(?:-(?:[0-7]))?|(?:MON|TUE|WED|THU|FRI|SAT|SUN)(?:-(?:MON|TUE|WED|THU|FRI|SAT|SUN))?)|\?$/;

                if (!dayOfWeekPattern.test(formData.dayOfWeek)){
                    errors ++;
                    listofErrors.push("Invalid input for Day of Week. Use integers 0-7, MON-SUN, *, or ?");
                };

                let yearPattern = /^(?:\*|\d{4})$/;

                if (!yearPattern.test(formData.yr)){
                    errors ++;
                    listofErrors.push("Invalid input for Year. Must use four digits or use *");
                };

                if (!(formData.dayOfMonth === "?" ^ formData.dayOfWeek === "?")){
                    errors ++;
                    listofErrors.push("Either Day of Month or Day of Week must use '?'");
                }

                break;
        }

        if (errors > 0 && listofErrors){
            console.log(errors, listofErrors);
            setErrorMessages(listofErrors);
            setError(true);
            setVerify(false);
            return;
        }

        

        axios.post("https://rug0208del.execute-api.us-east-2.amazonaws.com/v1/fleets/schedule", formData)
            .then(response => {
                return response.json();
            })
            /// FIXX this undefined error message
            .then(data => {
                console.log(data);
                if (data["statusCode"] === 200){
                    RequestOutput(data);
                    handleFleetStatus(3);
                } else if (data["statusCode"] === 500){
                    setErrorMessages([data["body"]]);
                    setError(true);
                    setVerify(false);
                } else if (data["errorMessage"]) {
                    setErrorMessages([data["errorMessage"]]);
                    setError(true);
                    setVerify(false);
                }
            })
            .catch(error => {
                console.log("ERROR", error);
            })
    }

    const handleName = (e) => {
        if (rules.includes(e)){
            setRuleError({"open": true, "message": "That name already exists"});
            setFormData({...formData, name:""});
        } else {
            setRuleError({"open": false});
            setFormData({...formData, name:e});
        }
    }

    const handleTemplateSelection = (template) => {
        setSelectedTemplate(true);
        setFormData({
            ...formData, 
            minute: template.min, 
            hour: template.hour,
            dayOfMonth: template.day_of_month,
            month: template.month,
            dayOfWeek: template.day_of_week,
            yr: template.year
        })
    }


    const [rules, setRules] = useState(null)
    const [ruleError, setRuleError] = useState({"open": false});

    const [formData, setFormData] = useState({
        account_id: selectedSchool.account_id,
        name: "",
        fleets: selected,
        intent: true,
        month: "",
        dayOfMonth: "",
        dayOfWeek: "",
        yr: "",
        hour: "",
        minute: ""
    });

    const [cronTemplates, setCronTemplates] = useState([{id: 0, template_name:"Testing", description:"Description for template", min:"10", hour:"20", day_of_month:"?", month:"1", day_of_week:"*", year:"2030", checked: false}, {id: 1, template_name:"Tacos", description:"Tacos are delicious", min:"5", hour:"15", day_of_month:"?", month:"1", day_of_week:"*", year:"2025", checked: false}]);

    const [verify, setVerify] = useState(false);

    const [mode, setMode] = useState("template");

    const [selectedTemplate, setSelectedTemplate] = useState(false);

    return ( 
        <div className="fixed flex justify-center place-items-center bg-gray-300 bg-opacity-60 top-0 left-0 h-screen w-screen">
            <div className="h-fit flex flex-col max-w-lg w-full mx-4 rounded-sm text-start bg-white shadow shadow-gray-400">
                
                <Header title="Define a schedule" />

                <div className="flex flex-row font-normal text-sm bg-white rounded-sm divide-x border border-gray-300">
                    {mode === "template" ? (
                        <button className="rounded-l-sm bg-gray-100 w-full p-2">
                            Cron Templates
                        </button>
                    ) : (
                        <button onClick={() => setMode("template")} className="rounded-l-sm  w-full hover:bg-gray-50 text-gray-600 p-2 transition-colors">
                            Cron Templates
                        </button>
                    )}
                    {mode === "custom" ? (
                        <button className="rounded-l-sm bg-gray-100  w-full p-2">
                            Custom Schedule
                        </button>
                    ) : (
                        <button onClick={() => setMode("custom")} className="rounded-l-sm hover:bg-gray-50 w-full text-gray-600 p-2 transition-colors">
                            Custom Schedule
                        </button>
                    )}
                </div>

                {mode === "template" ? (
                    <form onSubmit={handleSubmission} className="flex flex-col space-y-4 p-4 text-sm">
                        {error === true && <ErrorMessage errorMessageS={errorMessages}  />}
                        <div>
                            <Detail label={"Schedule Name"} required={true} />
                            <input type="text" autoFocus placeholder="schedule-name" className="input-text" value={formData.name} onChange={(e) => {setFormData({...formData, name:e.target.value}); handleName(e.target.value);}} />
                            {ruleError.open === true && <p className="required text-xs font-thin">{ruleError.message}</p>}
                        </div>
                        <div>
                            <Detail label={"Action"} detail={"Specify the action that will be applied to the fleet(s)."} required={true} />
                            <select className="input-text" required value={formData.intent}>
                                <option onClick={() => {setFormData({...formData, intent:true});}} value={true}>Start fleet</option>
                                <option onClick={() => {setFormData({...formData, intent:false});}} value={false}>End fleet</option>
                            </select>
                        </div>
                        <div>
                            {selectedTemplate ? (
                                <Detail label={"Select Template"} detail={selectedTemplate.template_name} required={true} />
                            ) : (
                                <Detail label={"Select Template"} required={true} />
                            )}
                            <div className="flex flex-col space-y-3 p-2 mx-2 max-h-48 overflow-y-auto">
                                {cronTemplates.map((template) => (
                                    <div key={template.id} className="container space-y-2 p-3">
                                        <div className="flex flex-row justify-between">
                                            <h1 className="text-base">{template.template_name}</h1>
                                            {template.template_name === selectedTemplate.template_name ? (
                                                <input type="radio" defaultChecked name="template" onClick={() => handleTemplateSelection(template)}/>
                                            ) :(
                                                <input type="radio" name="template" onClick={() => handleTemplateSelection(template)}/>
                                            )}
                                        </div>
                                        <div className="flex flex-row space-x-2">
                                            <Detail detail={"Cron (" + template.min + " " + template.hour + " " + template.day_of_month + " " + template.month + " " + template.day_of_week + " " + template.year + ")"}/>
                                        </div>
                                        {template && (
                                            <p className="border-t pt-2 text-xs border-gray-300">
                                                {template.description}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-row space-x-4 justify-end">
                            <button onClick={() => handleFleetStatus(3)} className="secondary-button">Cancel</button>
                            {verify ? (
                                <SubmitBtn verify={true}/>
                                ) : (
                                <SubmitBtn verify={false}/>
                            )}
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleSubmission} className="flex flex-col space-y-4 p-4 text-sm">
                        {error === true && <ErrorMessage errorMessageS={errorMessages}  />}
                        <div>
                            <Detail label={"Schedule Name"} required={true} />
                            <input type="text" autoFocus placeholder="schedule-name" className="input-text" value={formData.name} onChange={(e) => {setFormData({...formData, name:e.target.value}); handleName(e.target.value);}} />
                            {ruleError.open === true && <p className="required text-xs font-thin">{ruleError.message}</p>}
                        </div>
                        <div>
                            <Detail label={"Action"} required={true} />
                            <select className="input-text" required value={formData.intent}>
                                <option onClick={() => {setFormData({...formData, intent:true});}} value={true}>Start fleet</option>
                                <option onClick={() => {setFormData({...formData, intent:false});}} value={false}>End fleet</option>
                            </select>
                        </div>
                        <div>
                            <Detail label={"Cron Expression"} detail={"Define the cron expression"} required={true} />
                            <span className="items-center space-x-2 flex flex-row">
                                <p>cron(</p>
                                <input onChange={(e) => setFormData({...formData, minute:e.target.value})} value={formData.minute} type="text" className="input-text" placeholder="minute"/>
                                <input onChange={(e) => setFormData({...formData, hour:e.target.value})} value={formData.hour} type="text" className="input-text" placeholder="hour"/>
                                <input onChange={(e) => setFormData({...formData, dayOfMonth:e.target.value})} value={formData.dayOfMonth} type="text" className="input-text" placeholder="day of month"/>
                                <input onChange={(e) => setFormData({...formData, month:e.target.value})} value={formData.month} type="text" className="input-text" placeholder="month" />
                                <input onChange={(e) => setFormData({...formData, dayOfWeek:e.target.value})} value={formData.dayOfWeek} type="text" className="input-text" placeholder="day of week" />
                                <input onChange={(e) => setFormData({...formData, yr:e.target.value})} value={formData.yr} type="text" className="input-text" placeholder="year" />
                                <p>)</p>
                            </span>
                        </div>
                        <div className="flex flex-row space-x-4 justify-end">
                            <button onClick={() => handleFleetStatus(3)} className="secondary-button">Cancel</button>
                            {verify ? (
                                <SubmitBtn verify={true}/>
                                ) : (
                                <SubmitBtn verify={false}/>
                            )}
                        </div>
                    </form>
                )}
                
            </div>
        </div>
     );
}
 
export default SchedulePopUp;