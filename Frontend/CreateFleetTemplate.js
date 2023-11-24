import { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import Detail from "./Detail";
import Header from "./Header";
import { Helmet } from "react-helmet";
import SelectCronTemplate from "./SelectCronTemplate";
import axiosInstance from "./api/axiosConfig"

const CreateFleetTemplate = () => {
    const history = useHistory();
    const axios = axiosInstance();
    const [create, setCreate] = useState(false);

    const [error, setError] = useState({});
    const [errorMessageS, setErrorMessageS] = useState([]);

    const step = [
        {id: 0, title: "Step 1", detail: "Fleet Information"},
        {id: 1, title: "Step 2", detail: "Instance Configuration"},
        {id: 2, title: "Step 3", detail: "Stream View and Scale Policies"},
        {id: 3, title: "Step 4", detail: "Review Details"}
    ];

    const [data, setData] = useState({
        template_name: null,
        description: null,
        fleet_type: "ON_DEMAND",
        instance_type: null,
        max_session: null,
        disconnect_timeout: null,
        idle_timeout: null,
        min_cap: null,
        max_cap: 5,
        stream_view: "APP",
        scale_policy: {
            min_cap: null,
            max_cap: null,
            minute: "",
            hour: "",
            day_of_month: "",
            month: "",
            day_of_week: "",
            year: ""
        },
      });
      
    const [currentStep, setCurrentStep] = useState(0);

    const handleStep = (step, value) => {
        let listOfErrors = [];

        if (step === 0){

            if (data.template_name === "" || data.template_name === null) listOfErrors.push("Fleet Name can not be left empty");



        } else if (step === 1) {

            if (!data.instance_type) listOfErrors.push("Select an instance type");

            if (!(data.max_session >= 10 && data.max_session <= 7200)) listOfErrors.push("The max user duration timeout must be a number between 15 and 5760.");

            if (!(data.disconnect_timeout >= 1 && data.disconnect_timeout <= 5760)) listOfErrors.push("The disconnect timeout must be a number between 1 and 5760.");

            if (!(data.idle_timeout >= 0 && data.idle_timeout <= 60)) listOfErrors.push("The idle disconnect timeout must be a number between 0 and 60.");

            if (data.min_cap > data.max_cap) listOfErrors.push("Min. Capacity value should be less than or equal to Max. Capacity value.");
            
            if (data.min_cap < 1 || data.min_cap > 2147483647) listOfErrors.push("Min. Capacity value should be greater than or equal to 1.");

            if (data.max_cap < data.min_cap) listOfErrors.push("Max. Capacity value should be greater than or equal to Min. Capacity value.");
            
            if (data.max_cap < 1 || value > 2147483647)listOfErrors.push("Max. Capacity value should be greater than or equal to 1.");
               
        } else if (step === 2 ) {

            if (!(data.stream_view == "APP" || data.stream_view == "DESKTOP")) listOfErrors.push("Stream View must be 'APP' or 'DESKTOP'.");
            
            if (data.scale_policy.min_cap > data.scale_policy.max_cap) listOfErrors.push("Min. Capacity value should be less than or equal to " + data.scale_policy.max_cap + ".");
            
            if (data.scale_policy.min_cap < 1 || data.scale_policy.min_cap > 2147483647) listOfErrors.push("Min. Capacity falls outside the range 1-2147483647.");

            if (data.scale_policy.max_cap < data.scale_policy.min_cap) listOfErrors.push("Max. Capacity value should be greater than or equal to " + data.scale_policy.min_cap + ".");
            
            if (data.scale_policy.max_cap < 1 || data.scale_policy.max_cap > 2147483647) listOfErrors.push("Max. Capacity falls outside the range 1-2147483647.");

            const minutePattern = /^(?:\*|(?:[0-5]?[0-9])(?:-(?:[0-5]?[0-9]))?)$/;
            if (!minutePattern.test(data.scale_policy.minute)) listOfErrors.push("Minute should be a number between 0 and 59 or an asterisk (*)");
       
            const hourPattern = /^(?:\*|(?:[01]?[0-9]|2[0-3])(?:-(?:[01]?[0-9]|2[0-3]))?)$/;
            if (!hourPattern.test(data.scale_policy.hour)) listOfErrors.push("Hour should be a number between 0 and 23 or an asterisk (*)");
                        
            const dayOfMonthPattern = /^(?:\*|\?|[1-9]|[12][0-9]|3[01])$/;
            if (!dayOfMonthPattern.test(data.scale_policy.day_of_month)) listOfErrors.push("Day of Month shoud be a number between 1 and 31, an asterisk (*), or a question mark (?)");

            const monthPattern = /^(?:\*|(?:[1-9]|1[0-2])(?:-(?:[1-9]|1[0-2]))?|(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)(?:-(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC))?)$/;
            if (!monthPattern.test(data.scale_policy.month)) listOfErrors.push("Month should be a number between 1 and 12, the name of a month (JAN-DEC), or an asterisk (*)");
    
            const dayOfWeekPattern = /^(?:\*|(?:[0-7])(?:-(?:[0-7]))?|(?:MON|TUE|WED|THU|FRI|SAT|SUN)(?:-(?:MON|TUE|WED|THU|FRI|SAT|SUN))?)|\?$/;
            if (!dayOfWeekPattern.test(data.scale_policy.day_of_week)) listOfErrors.push("Day of Week should be the name of a day (MON-SUN), an asterisk (*), or a question mark (?)");

            const yearPattern = /^(?:\*|\d{4})$/;
            if (!yearPattern.test(data.scale_policy.year)) listOfErrors.push("Year should be a a 4-digit number or an asterisk (*)");

            if (!(data.scale_policy.day_of_week === "?" ^ data.scale_policy.day_of_month === "?")) listOfErrors.push("Either Day of Week or Day of Month should be set to '?'");
        }

        if (listOfErrors.length > 0){
            setError(true);
            setErrorMessageS(listOfErrors);
        } else {
            setError(false);
            setErrorMessageS([]);
            setCurrentStep(currentStep + 1);
        }
    }

    const instanceTypes = {
        "General Purpose": [
          "stream.standard.small",
          "stream.standard.medium",
          "stream.standard.large",
          "stream.standard.xlarge",
          "stream.standard.2xlarge",
        ],
        "Compute Optimized": [
          "stream.compute.large",
          "stream.compute.xlarge",
          "stream.compute.2xlarge",
          "stream.compute.4xlarge",
          "stream.compute.8xlarge",
        ],
        "Memory Optimized": [
          "stream.memory.large",
          "stream.memory.xlarge",
          "stream.memory.2xlarge",
          "stream.memory.4xlarge",
          "stream.memory.8xlarge",
          "stream.memory.z1d.large",
          "stream.memory.z1d.xlarge",
          "stream.memory.z1d.2xlarge",
          "stream.memory.z1d.3xlarge",
          "stream.memory.z1d.6xlarge",
          "stream.memory.z1d.12xlarge",
        ],
        "Graphics Desktop": ["stream.graphics-desktop.2xlarge"],
        "Graphics Design": [
          "stream.graphics-design.large",
          "stream.graphics-design.xlarge",
          "stream.graphics-design.2xlarge",
          "stream.graphics-design.4xlarge",
        ],
        "Graphics Pro": [
          "stream.graphics-pro.4xlarge",
          "stream.graphics-pro.8xlarge",
          "stream.graphics-pro.16xlarge",
        ],
        "Graphics G4": [
          "stream.graphics.g4dn.xlarge",
          "stream.graphics.g4dn.2xlarge",
          "stream.graphics.g4dn.4xlarge",
          "stream.graphics.g4dn.8xlarge",
          "stream.graphics.g4dn.12xlarge",
          "stream.graphics.g4dn.16xlarge",
        ],
      };

    const [instanceFamily, setInstanceFamily] = useState("General Purpose");

    const handleSubmission = async (e) => {
        e.preventDefault();
      
        try {
          const response = await axios.post("/api/makeFleetTemplate/", data)
          .then((response) => {
            history.push("/app/templates")
          })
          .catch((error) => {
            console.log(error);
          })
      
        } catch (error) {
          console.error('Error submitting data:', error);
        }
    };

    const [cronPopUp, setCronPopUp] = useState(true);
    const [selectCronTemplate, setSelectCronTemplate] = useState(false);
    const [currentCronTemplate, setCurrentCronTemplate] = useState({});

    const handleTemplateSelection = (template) => {
        console.log(template);
        setCurrentCronTemplate(template);
        setData({...data, scale_policy: {...data.scale_policy, minute: template.minute, hour: template.hour, day_of_month: template.day_of_month, month: template.month, day_of_week: template.day_of_week, year: template.year}});      
    }


    return (
      <div className='my-5 flex flex-row space-x-5 mx-5'>
        <Helmet>
          <title>Cloudimate | Fleet Builder</title>
        </Helmet>

        <div className='hidden sm:flex flex-col space-y-6 p-4 w-1/5'>
          {step.map((obj) =>
            currentStep === obj.id ? (
              <p
                onClick={() => setCurrentStep(obj["id"])}
                className='underline hover:cursor-pointer'
              >
                <Detail label={obj["title"]} detail={obj["detail"]} />
              </p>
            ) : obj.id > currentStep ? (
              <p className='text-gray-500'>
                <Detail label={obj["title"]} detail={obj["detail"]} />
              </p>
            ) : (
              <p
                onClick={() => setCurrentStep(obj["id"])}
                className='hover:cursor-pointer'
              >
                <Detail label={obj["title"]} detail={obj["detail"]} />
              </p>
            )
          )}
        </div>
        <div className='container'>
          {selectCronTemplate && (
            <div className='fixed flex justify-center place-items-center bg-gray-300 bg-opacity-60 top-0 left-0 h-screen w-screen'>
              <div className='flex flex-col max-w-3xl h-fit w-full mx-4 rounded-md text-start bg-white shadow-lg'>
                <Header title={"Cron Templates"} />

                <SelectCronTemplate
                  handleTemplateSelection={handleTemplateSelection}
                  currentCronTemplate={currentCronTemplate}
                />

                <div className='p-4'>
                  <button
                    onClick={() => {
                      setSelectCronTemplate(false);
                    }}
                    className='primary-button w-full'
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          <Header title={step[currentStep]["detail"]} />

          <form
            onSubmit={handleSubmission}
            className='p-4 flex flex-col space-y-5 text-sm'
          >
            {currentStep === 0 && (
              <>
                <div className='space-y-1'>
                  <Detail
                    label={"Template Name"}
                    detail={"Enter a name of your fleet template."}
                    required={true}
                  />
                  <input
                    autoFocus
                    onChange={(e) =>
                      setData({ ...data, template_name: e.target.value })
                    }
                    value={data.template_name}
                    type='text'
                    required
                    placeholder='template-name'
                    className='input-text'
                  />
                </div>
                <div className='space-y-1'>
                  <Detail
                    label={"Description Name"}
                    detail={"Enter a description for your fleet template."}
                  />
                  <input
                    onChange={(e) =>
                      setData({ ...data, description: e.target.value })
                    }
                    value={data.description}
                    type='text'
                    placeholder='Enter Description'
                    className='input-text'
                  />
                </div>
                <div className='space-y-1'>
                  <Detail
                    label={"Fleet type"}
                    detail={"This setting is already predetermined."}
                  />
                  <input
                    type='text'
                    className='input-text-disabled'
                    disabled
                    value={data.fleet_type}
                  />
                </div>
              </>
            )}
            {currentStep === 1 && (
              <>
                <div className='space-y-1'>
                  {data["instance_type"] ? (
                    <Detail
                      label={"Choose instance type"}
                      detail={"Selected: " + data["instance_type"]}
                      required={true}
                    />
                  ) : (
                    <Detail label={"Choose instance type"} required={true} />
                  )}
                  <div className='flex flex-col space-y-2 bg-gray-100 rounded-md pb-2'>
                    <select
                      className='input-text w-11 google-text font-normal'
                      onChange={(e) => setInstanceFamily(e.target.value)}
                    >
                      {Object.keys(instanceTypes).map((family) => (
                        <option
                          id={family}
                          value={family}
                        >
                          {family}
                        </option>
                      ))}
                    </select>
                    <div className='flex mx-2 divide-y divide-gray-200 flex-col'>
                      {Object.keys(instanceTypes).map((family) =>
                        instanceTypes[family].map((instance) =>
                          family === instanceFamily ? (
                            instance === data["instance_type"] ? (
                              <label className='hover:bg-gray-200 p-1 text-sm transition-all font-normal'>
                                <input
                                  checked
                                  onClick={(e) =>
                                    setData({
                                      ...data,
                                      instance_type: e.target.value,
                                    })
                                  }
                                  type='radio'
                                  template_name='instance_type'
                                  id={instance}
                                  value={instance}
                                />
                                {" " + instance}{" "}
                              </label>
                            ) : (
                              <label className='hover:bg-gray-200 p-1 text-sm transition-all'>
                                <input
                                  onClick={(e) =>
                                    setData({
                                      ...data,
                                      instance_type: e.target.value,
                                    })
                                  }
                                  type='radio'
                                  template_name='instance_type'
                                  id={instance}
                                  value={instance}
                                />
                                {" " + instance}{" "}
                              </label>
                            )
                          ) : (
                            <label className='hidden' htmlFor={instance}>
                              <input
                                type='radio'
                                template_name='instance_type'
                                id={instance}
                                value={instance}
                              />
                              {" " + instance}{" "}
                            </label>
                          )
                        )
                      )}
                    </div>
                  </div>
                </div>

                <div className='space-y-1'>
                  <Detail
                    label={"Maximum session duration in minutes"}
                    detail={
                      "The max user duration timeout must be a number between 10 and 7200."
                    }
                    required={true}
                  />
                  <input
                    onChange={(e) =>
                      setData({
                        ...data,
                        max_session: parseInt(e.target.value),
                      })
                    }
                    max={10}
                    min={7200}
                    value={data.max_session}
                    type='number'
                    className='input-text'
                  />
                </div>

                <div className='space-y-1'>
                  <Detail
                    label={"Disconnect timeout in minutes"}
                    detail={
                      "The disconnect timeout must be a number between 1 and 5760."
                    }
                    required={true}
                  />
                  <input
                    onChange={(e) =>
                      setData({
                        ...data,
                        disconnect_timeout: parseInt(e.target.value),
                      })
                    }
                    max={5760}
                    min={15}
                    value={data.disconnect_timeout}
                    type='number'
                    className='input-text'
                  />
                </div>

                <div className='space-y-1'>
                  <Detail
                    label={"Idle Disconnect Timeout in minutes"}
                    detail={
                      "The idle disconnect timeout must be a number between 0 and 60."
                    }
                    required={true}
                  />
                  <input
                    onChange={(e) =>
                      setData({
                        ...data,
                        idle_timeout: parseInt(e.target.value),
                      })
                    }
                    max={60}
                    min={0}
                    value={data.idle_timeout}
                    type='number'
                    className='input-text'
                  />
                </div>

                <div className='space-y-1'>
                  <Detail
                    label={"Minimum capacity"}
                    detail={"This value should be greater than or equal to 1."}
                    required={true}
                  />
                  <input
                    onChange={(e) =>
                      setData({ ...data, min_cap: parseInt(e.target.value) })
                    }
                    max={2147483647}
                    min={1}
                    value={data.min_cap}
                    type='number'
                    className='input-text'
                  />
                </div>

                <div className='space-y-1'>
                  <Detail
                    label={"Maximum capacity"}
                    detail={"This value should be greater than or equal to 1."}
                    required={true}
                  />
                  <input
                    onChange={(e) =>
                      setData({ ...data, max_cap: parseInt(e.target.value) })
                    }
                    max={2147483647}
                    min={1}
                    value={data.max_cap}
                    type='number'
                    className='input-text'
                  />
                </div>
              </>
            )}
            {currentStep === 2 && (
              <>
                <div className='space-y-1'>
                  <Detail
                    label={"Stream view"}
                    detail={
                      "Select the stream view you wish your users to have."
                    }
                    required={true}
                  />
                  <select
                    onChange={(e) => setData({ ...data })}
                    value={data["stream_view"]}
                    className='input-text'
                  >
                    <option
                      onClick={() => setData({ ...data, stream_view: "APP" })}
                      value='APP'
                    >
                      Application
                    </option>
                    <option
                      onClick={() =>
                        setData({ ...data, stream_view: "DESKTOP" })
                      }
                      value='DESKTOP'
                    >
                      Desktop
                    </option>
                  </select>
                </div>

                <div className='space-y-5 border-t pt-5'>
                  <Detail label={"Scheduled Scaling Policy"} required={true} />

                  <span className='flex space-x-5 items-center'>
                    <Detail label={"Min. capacity"} required={true} />
                    <input
                      max={2147483647}
                      type='number'
                      value={data.scale_policy.min_cap}
                      onChange={(e) =>
                        setData({
                          ...data,
                          scale_policy: {
                            ...data.scale_policy,
                            min_cap: e.target.value,
                          },
                        })
                      }
                      className='input-text'
                    />
                  </span>

                  <span className='flex space-x-5 items-center'>
                    <Detail label={"Max. capacity"} required={true} />
                    <input
                      max={2147483647}
                      type='number'
                      value={data.scale_policy.max_cap}
                      onChange={(e) =>
                        setData({
                          ...data,
                          scale_policy: {
                            ...data.scale_policy,
                            max_cap: e.target.value,
                          },
                        })
                      }
                      className='input-text'
                    />
                  </span>

                  <span className='flex flex-col space-y-2'>
                    <div className='flex flex-row justify-between'>
                      <Detail
                        label={"Cron Expression"}
                        detail={"Write a cron expression."}
                        required={true}
                      />
                      <button
                        onClick={() => setSelectCronTemplate(true)}
                        title='Use Template'
                        className='secondary-button'
                      >
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          fill='none'
                          viewBox='0 0 24 24'
                          strokeWidth={1.5}
                          className='w-6 h-6'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            d='M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z'
                          />
                        </svg>
                      </button>
                    </div>
                    <span className='items-center space-x-2 flex flex-row'>
                      <input
                        onChange={(e) =>
                          setData({
                            ...data,
                            scale_policy: {
                              ...data.scale_policy,
                              minute: e.target.value,
                            },
                          })
                        }
                        value={data.scale_policy.minute}
                        type='text'
                        className='input-text'
                        placeholder='minute'
                      />
                      <input
                        onChange={(e) =>
                          setData({
                            ...data,
                            scale_policy: {
                              ...data.scale_policy,
                              hour: e.target.value,
                            },
                          })
                        }
                        value={data.scale_policy.hour}
                        type='text'
                        className='input-text'
                        placeholder='hour'
                      />
                      <input
                        onChange={(e) =>
                          setData({
                            ...data,
                            scale_policy: {
                              ...data.scale_policy,
                              day_of_month: e.target.value,
                            },
                          })
                        }
                        value={data.scale_policy.day_of_month}
                        type='text'
                        className='input-text'
                        placeholder='day of month'
                      />
                      <input
                        onChange={(e) =>
                          setData({
                            ...data,
                            scale_policy: {
                              ...data.scale_policy,
                              month: e.target.value,
                            },
                          })
                        }
                        value={data.scale_policy.month}
                        type='text'
                        className='input-text'
                        placeholder='month'
                      />
                      <input
                        onChange={(e) =>
                          setData({
                            ...data,
                            scale_policy: {
                              ...data.scale_policy,
                              day_of_week: e.target.value,
                            },
                          })
                        }
                        value={data.scale_policy.day_of_week}
                        type='text'
                        className='input-text'
                        placeholder='day of week'
                      />
                      <input
                        onChange={(e) =>
                          setData({
                            ...data,
                            scale_policy: {
                              ...data.scale_policy,
                              year: e.target.value,
                            },
                          })
                        }
                        value={data.scale_policy.year}
                        type='text'
                        className='input-text'
                        placeholder='year'
                      />
                    </span>
                    {!(
                      (data.scale_policy.day_of_week == "?") ^
                      (data.scale_policy.day_of_month == "?")
                    ) && (
                      <p className='required text-xs'>
                        Either <u>Day of Week</u> or <u>Day of Month</u> should
                        be set to "?"
                      </p>
                    )}
                  </span>
                </div>
              </>
            )}

            {currentStep === 3 && (
              <>
                <div className='space-y-2'>
                  <Detail label={"Step 1: Fleet Information"} />
                  <div className='px-4 grid grid-cols-3 gap-4'>
                    {data["template_name"] ? (
                      <Detail
                        label={"Template Name"}
                        detail={data["template_name"]}
                      />
                    ) : (
                      <Detail
                        label={"Template Name"}
                        detail={"Empty"}
                        required={true}
                      />
                    )}
                    {data["description"] ? (
                      <Detail label={"Description"} detail={data.description} />
                    ) : (
                      <Detail label={"Description"} detail={"Empty"} />
                    )}
                    <Detail label={"Fleet Type"} detail={data["fleet_type"]} />
                  </div>
                </div>
                <div className='space-y-2'>
                  <Detail label={"Step 2: Instance Configuration"} />
                  <div className='px-4 grid grid-cols-2 gap-4'>
                    {data["instance_type"] ? (
                      <Detail
                        label={"Instance Type"}
                        detail={data["instance_type"]}
                      />
                    ) : (
                      <Detail
                        label={"Instance Type"}
                        detail={"Empty"}
                        required={true}
                      />
                    )}
                    {data["max_session"] ? (
                      <Detail
                        label={"Max. Session"}
                        detail={data["max_session"]}
                      />
                    ) : (
                      <Detail
                        label={"Max. Session"}
                        detail={"Empty"}
                        required={true}
                      />
                    )}
                    {data["disconnect_timeout"] ? (
                      <Detail
                        label={"Disconnect Timeout"}
                        detail={data["disconnect_timeout"]}
                      />
                    ) : (
                      <Detail
                        label={"Disconnect Timeout"}
                        detail={"Empty"}
                        required={true}
                      />
                    )}
                    {data.idle_timeout >= 0 ? (
                      <Detail
                        label={"Idle Timeout"}
                        detail={data.idle_timeout}
                      />
                    ) : (
                      <Detail
                        label={"Idle Timeout"}
                        detail={"Empty"}
                        required={true}
                      />
                    )}
                    {data["min_cap"] ? (
                      <Detail
                        label={"Min. Capacity"}
                        detail={data["min_cap"]}
                      />
                    ) : (
                      <Detail
                        label={"Min. Capacity"}
                        detail={"Empty"}
                        required={true}
                      />
                    )}
                    {data["max_cap"] ? (
                      <Detail
                        label={"Max. Capacity"}
                        detail={data["max_cap"]}
                      />
                    ) : (
                      <Detail
                        label={"Max. Capacity"}
                        detail={"Empty"}
                        required={true}
                      />
                    )}
                  </div>
                  <div className='space-y-2'>
                    <Detail label={"Step 3: Stream View and Scale Policies"} />
                    <div className='px-4 grid grid-cols-2 gap-4'>
                      {data["stream_view"] ? (
                        <Detail
                          label={"Stream View"}
                          detail={data["stream_view"]}
                        />
                      ) : (
                        <Detail
                          label={"Stream View"}
                          detail={"Empty"}
                          required={true}
                        />
                      )}
                      <Detail
                        label={"Cron Expression"}
                        detail={
                          "cron( " +
                          data.scale_policy.minute +
                          " " +
                          data.scale_policy.hour +
                          " " +
                          data.scale_policy.day_of_month +
                          " " +
                          data.scale_policy.month +
                          " " +
                          data.scale_policy.day_of_week +
                          " " +
                          data.scale_policy.year +
                          " )"
                        }
                      />
                      <Detail
                        label={"Max. Capacity"}
                        detail={data.scale_policy.max_cap}
                      />
                      <Detail
                        label={"Min. Capacity"}
                        detail={data.scale_policy.min_cap}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
            <div className='flex flex-row justify-between space-x-5'>
              <Link to='/templates'>
                <button
                  type='button'
                  className='secondary-button flex flex-row items-center space-x-1'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth='1.5'
                    className='w-5 h-5'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75'
                    />
                  </svg>
                  <p>Cancel</p>
                </button>
              </Link>
              <div className='space-x-4'>
                {currentStep >= 1 && currentStep <= 3 && (
                  <button
                    onClick={() => setCurrentStep(currentStep - 1)}
                    type='button'
                    className='secondary-button'
                  >
                    Previous
                  </button>
                )}
                {currentStep <= 2 && currentStep >= 0 && (
                  <button
                    onClick={() => handleStep(currentStep)}
                    type='button'
                    className='secondary-button'
                  >
                    Next
                  </button>
                )}
                {currentStep === 3 &&
                  (errorMessageS.length === 0 ? (
                    <input
                      className='primary-button cursor-pointer'
                      type='submit'
                      value={"Create"}
                    />
                  ) : (
                    <button className='primary-button-disabled' disabled>
                      {"Create"}
                    </button>
                  ))}
              </div>
            </div>
          </form>
        </div>
        <div className='flex flex-col w-1/6 space-y-2'>
          {errorMessageS.map((message) => (
            <span className='error'>{message}</span>
          ))}
        </div>
      </div>
    );
}
 
export default CreateFleetTemplate;