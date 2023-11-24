import { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import Detail from "./Detail";
import Header from "./Header";
import { Helmet } from "react-helmet";
import SelectCronTemplate from "./SelectCronTemplate";
import axiosInstance from "./api/axiosConfig";

const CreateRDSTemplate = () => {
  const history = useHistory();
  const axios = axiosInstance();
  const [create, setCreate] = useState(false);

  const [error, setError] = useState({});
  const [errorMessageS, setErrorMessageS] = useState([]);
  const [engineSelected, setEngineSelected] = useState(null);
  const [engineVersions, setEngineVersions] = useState(null);
  //const [templates, setTemplates] = useState(null);
  const [selectedVersion, setSelctedVersion] = useState(null);
  const [instanceTypes, setInstanceTypes] = useState(null);
  const [selectedInstanceType, setSelectedInstanceType] = useState(null);
  const [storageTypes, setStorageTypes] = useState(null);
  const [minMaxStorage, setMinMaxStorage] = useState([null, null]);
  const [EC2Instances, setEC2Instances] = useState(null);
  const [retentionPeriod, setRetentionPeriod] = useState(null);
  const [availableSecurityGroups, setAvailableSecurityGroups] = useState(null);
  const [licenses, setLicenses] = useState(null);

  const step = [
    { id: 0, title: "Step 1", detail: "RDS Information" },
    { id: 1, title: "Step 2", detail: "Instance Configuration" },
    { id: 2, title: "Step 3", detail: "Review Details" },
  ];

  const [data, setData] = useState({
    template_name: null,
    description: null,
    RDS_type: "ON_DEMAND",
    engine: null,
    engine_version: null,
    license: null,
    instance_type: null,
    storage_type: null,
    master_username: null,
    master_user_password: null,
    allocated_storage: null,
    retention_period: null,
    storage_encrypted: false,
    security_group_ids: [],
    associated_EC2_instance: null,
    database_authentication: null,
    performance_insights: null,
  });

  const [currentStep, setCurrentStep] = useState(0);

  const handleStep = (step, value) => {
    let listOfErrors = [];

    if (step === 0) {
      if (data.template_name === "" || data.template_name === null)
        listOfErrors.push("RDS Name can not be left empty");
    } else if (step === 1) {
      if (!data.instance_type) listOfErrors.push("Select an instance type");

      if (data.engine == null || data.ami_id == "" || data.ami_id == " ")
        listOfErrors.push("Select an engine");

      if (data.engine_version == null)
        listOfErrors.push("Must select an engine version");

      if (data.storage_type == null)
        listOfErrors.push("Must select a storage type");

      if (data.allocated_storage == null)
        listOfErrors.push("Must enter allocated storage amount");
    }

    if (listOfErrors.length > 0) {
      setError(true);
      setErrorMessageS(listOfErrors);
    } else {
      setError(false);
      setErrorMessageS([]);
      setCurrentStep(currentStep + 1);
    }
  };

  const engines = {
    MySQL: "mysql",
    PostgreSQL: "postgres",
    Aurora: "aurora",
    "Aurora (PostgreSQL Compatible)": "aurora-postgresql",
    MariaDB: "mariadb",
    Oracle: "oracle-ee",
    "Microsoft SQL Server": "sqlserver-ee", // This is an example, the actual value depends on the edition (express, standard, etc.)
  };

  const handleSubmission = async (e) => {
    e.preventDefault();

    try {
      axios
        .post("/api/makeRDSTemplate", data)
        .then((response) => {
          console.log(response);
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (error) {
      console.error("Error submitting data:", error);
    }
  };

  function findStorageTypes() {
    const filteredOptions = instanceTypes.filter(
      (option) => option.DBInstanceClass == data.instance_type
    );
    const storageTypes = filteredOptions.map((option) => option.StorageType);

    setStorageTypes([...new Set(storageTypes)]);
  }

  function getStorageSize() {
    if (data.storage_type) {
      const sizePossibilities = instanceTypes.filter(
        (option) =>
          option.StorageType == data.storage_type &&
          option.DBInstanceClass == data.instance_type
      );

      console.log(
        "items in sizePossibilities: " +
          JSON.stringify(sizePossibilities) +
          "\n" +
          "type of sizePossibilities: " +
          typeof sizePossibilities
      );

      setMinMaxStorage([
        sizePossibilities[0].MinStorageSize,
        sizePossibilities[0].MaxStorageSize,
      ]);
    } else {
      console.log("No storage type??: " + data.storage_type);
    }
  }

  /*
  if (instanceTypes) {
    console.log("instance type: " + data.instance_type);
    console.log(JSON.stringify(instanceTypes));
    console.log("storage types of the selected instance type: " + storageTypes);
  }

  */

  useEffect(() => {
    let array = ["7 days (free tier)", "1 month"];

    for (let i = 1; i <= 24; i++) {
      array.push(`${i} months`);
    }

    setRetentionPeriod(array);

    axios
      .get("/api/aws/getSecurityGroups")
      .then((response) => {
        setAvailableSecurityGroups(response.data);
      })
      .catch((error) => {});
  }, []);

  useEffect(() => {
    if (engineSelected !== null) {
      axios
        .get("/api/aws/getEngineVersions", {
          params: {
            engine: engines[data.engine],
          },
        })
        .then((response) => {
          setEngineVersions(response.data.versions);
        })
        .catch((error) => {});
    }
  }, [engineSelected]);

  useEffect(() => {
    if (data.engine_version !== null) {
      axios
        .get("/api/aws/getOrderableDBInstanceOptions", {
          params: {
            engine: engines[data.engine],
            version: data.engine_version,
          },
        })
        .then((response) => {
          setInstanceTypes(response.data.instanceOptions);
          response.data.license.length == 1
            ? setData({ ...data, license: response.data.license[0] })
            : setLicenses(response.data.license);
        
        })
        .catch((error) => {});
    }
  }, [selectedVersion]);

  useEffect(() => {
    getStorageSize();
  }, [data.storage_type]);

  useEffect(() => {
    if(data.instance_type) {
      findStorageTypes();
    }
  }, [data.instance_type]);

  useEffect(() => {
    if (data.attach_to_instance == true) {
      axios
        .get("/api/aws/getResourceData", {
          params: {
            EC2: true,
          },
        })
        .then((response) => {
          setEC2Instances(response.data.EC2_instances.Reservations);
        })
        .catch((error) => {});
    }
  }, [data.attach_to_instance]);



  return (
    <div className='my-5 flex flex-row space-x-5 mx-5'>
      <Helmet>
        <title>Cloudimate | RDS Builder</title>
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
                  detail={"Enter a name of your RDS template."}
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
                  detail={"Enter a description for your RDS template."}
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
                  label={"RDS type"}
                  detail={"This setting is already predetermined."}
                />
                <input
                  type='text'
                  className='input-text-disabled'
                  disabled
                  value={data.RDS_type}
                />
              </div>
            </>
          )}
          {currentStep === 1 && (
            <>
              <div className='space-y-1'>
                {data["engine"] ? (
                  <Detail
                    label={"Choose Database Engine"}
                    detail={"Selected: " + data["engine"]}
                    required={true}
                  />
                ) : (
                  <Detail label={"Choose Database Engine"} required={true} />
                )}
                <div className='flex flex-col space-y-2 rounded-md pb-2'>
                  <select
                    onChange={(e) => {
                      setData({ ...data, engine: e.target.value });
                      setEngineSelected(e.target.value);
                    }}
                    className='input-text w-11 google-text font-normal'
                  >
                    <option value={null}>Select an option</option>{" "}
                    {Object.keys(engines).map((engine) => (
                      <option key={engine} value={engine}>
                        {engine}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className='space-y-1'>
                {engineVersions && (
                  <>
                    <Detail
                      label={"Choose Database Engine Version"}
                      detail={"Selected: " + data["engine_version"]}
                      required={false}
                    />
                    <div className='flex flex-col space-y-2 rounded-md pb-2'>
                      <select
                        onChange={(e) => {
                          setData({ ...data, engine_version: e.target.value });
                          setSelctedVersion(e.target.value);
                        }}
                        className='input-text w-11 google-text font-normal'
                      >
                        <option value={null}>Select an option</option>{" "}
                        {engineVersions.map((version) => (
                          <option key={version} value={version}>
                            {version}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>
              <div className='space-y-1'>
                {data["license"] ? (
                  <Detail
                    label={"License"}
                    detail={data["license"]}
                    required={true}
                  />
                ) : licenses && licenses.length > 0 ? (
                  <>
                    <Detail label={"Choose Database License"} required={true} />
                    <div className='flex flex-col space-y-2 rounded-md pb-2'>
                      <select
                        onChange={(e) => {
                          setData({ ...data, license: e.target.value });
                        }}
                        className='input-text w-11 google-text font-normal'
                      >
                        <option value={null}>Select an option</option>{" "}
                        {licenses &&
                          licenses.length > 0 &&
                          licenses.map((license) => (
                            <option key={license} value={license}>
                              {license}
                            </option>
                          ))}
                      </select>
                    </div>
                  </>
                ) : null}
              </div>
              {/*}
              <div className='space-y-1'>
                <Detail label={"Template Type"} required={true} />
                <div className='flex items-center'>
                  <label className='flex items-center space-x-3'>
                    <input
                      type='radio'
                      name='existingKeyPair'
                      value='production'
                      checked={data.template === "production"}
                      onChange={() =>
                        setData({ ...data, template: "production" })
                      }
                      className='form-radio h-4 w-4'
                    />
                    <span className='google-text font-normal'>Production</span>
                  </label>
                  <label className='flex items-center space-x-3 ml-6'>
                    <input
                      type='radio'
                      name='template'
                      value='development'
                      checked={data.template === "development"}
                      onChange={() =>
                        setData({ ...data, template: "development" })
                      }
                      className='form-radio h-4 w-4'
                    />
                    <span className='google-text font-normal'>Development</span>
                  </label>
                </div>
              </div>
                    */}
              <div className='space-y-1'>
                <Detail
                  label={"Master Username"}
                  detail={
                    "The entered username will be identical across all copies of this template."
                  }
                  required={false}
                />
                <input
                  onChange={(e) => {
                    setData({
                      ...data,
                      master_username: e.target.value,
                    });
                  }}
                  value={data.master_username}
                  type='text'
                  className='input-text'
                />
              </div>

              <div className='space-y-1'>
                <Detail label={"Master Password"} required={true} />
                <div className='flex flex-col space-y-2'>
                  <label className='flex items-center'>
                    <input
                      onClick={(e) =>
                        setData({ ...data, master_user_password: "manual" })
                      }
                      type='radio'
                      checked={data.master_user_password == "manual"}
                      className='form-radio h-4 w-4' // Adjust the size as needed
                    />
                    <span className='ml-2 text-sm google-text font-normal'>
                      Set during deployment
                    </span>{" "}
                    {/* Adjust the margin and font size as needed */}
                  </label>
                  <label className='flex items-center'>
                    <input
                      onClick={(e) =>
                        setData({ ...data, master_user_password: "auto" })
                      }
                      type='radio'
                      checked={data.master_user_password == "auto"}
                      className='form-radio h-4 w-4' // Adjust the size as needed
                    />
                    <span className='ml-2 text-sm google-text font-normal'>
                      Use autogenerated password
                    </span>{" "}
                    {/* Adjust the margin and font size as needed */}
                  </label>
                </div>
              </div>
              {instanceTypes && (
                <div className='space-y-1'>
                  <Detail
                    label={"Choose Database Instance Class"}
                    detail={"Selected: " + data["instance_type"]}
                    required={true}
                  />
                  <div className='flex flex-col space-y-2 rounded-md pb-2'>
                    <select
                      onChange={(e) => {
                        setData({ ...data, instance_type: e.target.value });
                      }}
                      className='input-text w-11 google-text font-normal'
                    >
                      <option value={null}>Select an option</option>{" "}
                      {instanceTypes.map((type) => (
                        <option
                          key={`${type.DBInstanceClass}-${type.StorageType}`}
                          value={type.DBInstanceClass}
                        >
                          {type.DBInstanceClass}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              <div className='space-y-1'>
                {storageTypes && storageTypes.length > 0 && (
                  <>
                    <Detail
                      label={"Choose Storage Type"}
                      detail={"Selected: " + data["storage_type"]}
                      required={true}
                    />
                    <div className='flex flex-col space-y-2 rounded-md pb-2'>
                      <select
                        onChange={(e) => {
                          setData({ ...data, storage_type: e.target.value });
                        }}
                        className='input-text w-11 google-text font-normal'
                      >
                        <option value={null}>Select an option</option>{" "}
                        {storageTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>
              <div className='space-y-1'>
                {minMaxStorage && minMaxStorage[1] !== null && (
                  <>
                    <Detail
                      label={"Enter Storage Size"}
                      detail={`Enter a value between ${minMaxStorage[0]} & ${minMaxStorage[1]}`}
                      required={true}
                    />
                    <input
                      onChange={(e) =>
                        setData({ ...data, allocated_storage: e.target.value })
                      }
                      type='text'
                      value={data.allocated_storage}
                    />
                  </>
                )}
              </div>
              {/*
              <div className='space-y-1'>
                <Detail label={"Multi AZ deployment"} required={true} />
                <div className='flex flex-col space-y-2'>
                  <label className='flex items-center'>
                    <input
                      onClick={(e) =>
                        setData({ ...data, multi_az_deployment: false })
                      }
                      type='radio'
                      checked={data.multi_az_deployment == false}
                      className='form-radio h-4 w-4' // Adjust the size as needed
                    />
                    <span className='ml-2 text-sm google-text font-normal'>
                      Do not create a standby instance
                    </span>{" "}
                  </label>
                  <label className='flex items-center'>
                    <input
                      onClick={(e) =>
                        setData({ ...data, multi_az_deployment: true })
                      }
                      type='radio'
                      checked={data.multi_az_deployment == true}
                      className='form-radio h-4 w-4' // Adjust the size as needed
                    />
                    <span className='ml-2 text-sm google-text font-normal'>
                      Create a standby instance
                    </span>{" "}
                  </label>
                </div>
              </div>
                    */}
              <div className='space-y-1'>
                <Detail label={"Attach to EC2 Instance"} required={true} />
                <div className='flex flex-col space-y-2'>
                  <label className='flex items-center'>
                    <input
                      onClick={(e) =>
                        setData({ ...data, attach_to_instance: false })
                      }
                      type='radio'
                      checked={data.attach_to_instance == false}
                      className='form-radio h-4 w-4' // Adjust the size as needed
                    />
                    <span className='ml-2 text-sm google-text font-normal'>
                      No
                    </span>{" "}
                    {/* Adjust the margin and font size as needed */}
                  </label>
                  <label className='flex items-center'>
                    <input
                      onClick={(e) =>
                        setData({ ...data, attach_to_instance: true })
                      }
                      type='radio'
                      checked={data.attach_to_instance == true}
                      className='form-radio h-4 w-4' // Adjust the size as needed
                    />
                    <span className='ml-2 text-sm google-text font-normal'>
                      Yes
                    </span>{" "}
                    {/* Adjust the margin and font size as needed */}
                  </label>
                </div>
              </div>
              {data.attach_to_instance == true &&
                EC2Instances &&
                EC2Instances.length > 0 && (
                  <div className='space-y-1'>
                    <Detail
                      label={"Select EC2 Instance"}
                      detail={"Select the EC2 instance you want to connect to."}
                      required={false}
                    />
                    <div className='flex flex-col space-y-2 rounded-md pb-2'>
                      <select
                        onChange={(e) => {
                          setData({
                            ...data,
                            associated_EC2_instance: e.target.value,
                          });
                        }}
                        className='input-text w-11 google-text font-normal'
                      >
                        <option value={null}>Select an option</option>{" "}
                        {EC2Instances.map((instance) => (
                          <option
                            key={instance.Instances[0].InstanceId}
                            value={instance.Instances[0].InstanceId}
                          >
                            {instance.Instances[0].InstanceId}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              <div className='space-y-1'>
                <Detail label={"Attach Security Groups"} required={true} />
                <div className='flex flex-col max-h-[50vh] overflow-auto pb-5 pt-5'>
                  {availableSecurityGroups &&
                    availableSecurityGroups.map((securityGroup, index) => {
                      // Determine if the current securityGroup is selected
                      const isChecked = data.security_group_ids.includes(
                        securityGroup.GroupId
                      );

                      return (
                        <div
                          key={securityGroup.GroupId} // It's important to use a unique key for list items, GroupId if it's unique.
                          className='flex border-t border-b border-gray-300 w-full google-text font-normal container-hover flex items-center'
                        >
                          <div>
                            <input
                              type='checkbox'
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  // Add GroupId to array if checked
                                  setData((prevData) => ({
                                    ...prevData,
                                    security_group_ids: [
                                      ...prevData.security_group_ids,
                                      securityGroup.GroupId,
                                    ],
                                  }));
                                } else {
                                  // Remove GroupId from array if unchecked
                                  setData((prevData) => ({
                                    ...prevData,
                                    security_group_ids:
                                      prevData.security_group_ids.filter(
                                        (id) => id !== securityGroup.GroupId
                                      ),
                                  }));
                                }
                              }}
                              className='mr-2'
                            />
                          </div>
                          <div className='flex flex-col text-left justify-start'>
                            <h1 className='mr-auto'>
                              Group name: {securityGroup.GroupName}
                            </h1>
                            <h2>Description: {securityGroup.Description}</h2>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
              <div className='space-y-1'>
                <Detail
                  label={"Turn On Performance Insights"}
                  required={true}
                />
                <div className='flex flex-col space-y-2'>
                  <label className='flex items-center'>
                    <input
                      onClick={(e) =>
                        setData({ ...data, performance_insights: false })
                      }
                      type='radio'
                      checked={data.performance_insights == false}
                      className='form-radio h-4 w-4' // Adjust the size as needed
                    />
                    <span className='ml-2 text-sm google-text font-normal'>
                      No
                    </span>{" "}
                    {/* Adjust the margin and font size as needed */}
                  </label>
                  <label className='flex items-center'>
                    <input
                      onClick={(e) =>
                        setData({ ...data, performance_insights: true })
                      }
                      type='radio'
                      checked={data.performance_insights == true}
                      className='form-radio h-4 w-4' // Adjust the size as needed
                    />
                    <span className='ml-2 text-sm google-text font-normal'>
                      Yes
                    </span>{" "}
                    {/* Adjust the margin and font size as needed */}
                  </label>
                </div>
              </div>
              <div className='space-y-1'>
                <Detail
                  label={"Select Retention Period"}
                  detail={"Selected: " + data["retention_period"]}
                  required={true}
                />
                <div className='flex flex-col space-y-2 rounded-md pb-2'>
                  <select
                    onChange={(e) => {
                      setData({
                        ...data,
                        retention_period: e.target.value,
                      });
                    }}
                    className='input-text w-11 google-text font-normal'
                  >
                    <option value={null}>Select an option</option>{" "}
                    {retentionPeriod.map((period) => (
                      <option key={period} value={period}>
                        {period}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className='space-y-1'>
                <Detail label={"Database Authentication"} required={true} />
                <div className='flex flex-col space-y-2'>
                  <label className='flex items-center'>
                    <input
                      onClick={(e) =>
                        setData({
                          ...data,
                          database_authentication: "password",
                        })
                      }
                      type='radio'
                      checked={data.database_authentication == "password"}
                      className='form-radio h-4 w-4' // Adjust the size as needed
                    />
                    <span className='ml-2 text-sm google-text font-normal'>
                      Password authentication
                    </span>{" "}
                    {/* Adjust the margin and font size as needed */}
                  </label>
                  <label className='flex items-center'>
                    <input
                      onClick={(e) =>
                        setData({ ...data, database_authentication: "iam" })
                      }
                      type='radio'
                      checked={data.database_authentication == "iam"}
                      className='form-radio h-4 w-4' // Adjust the size as needed
                    />
                    <span className='ml-2 text-sm google-text font-normal'>
                      IAM database authentication
                    </span>{" "}
                    {/* Adjust the margin and font size as needed */}
                  </label>
                  <label className='flex items-center'>
                    <input
                      onClick={(e) =>
                        setData({
                          ...data,
                          database_authentication: "password_kerberos",
                        })
                      }
                      type='radio'
                      checked={
                        data.database_authentication == "password_kerberos"
                      }
                      className='form-radio h-4 w-4' // Adjust the size as needed
                    />
                    <span className='ml-2 text-sm google-text font-normal'>
                      Password and kerberos
                    </span>{" "}
                    {/* Adjust the margin and font size as needed */}
                  </label>
                </div>
              </div>
              {/*
              
              
              
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
                    onChange={(e) => setInstanceFamily(e.target.value)}
                    className='input-text w-11 google-text font-normal'
                  >
                    {Object.keys(instanceTypes).map((family) => (
                      <option key={family} value={family}>
                        {family}
                      </option>
                    ))}
                  </select>
                  <div className='flex mx-2 divide-y divide-gray-200 flex-col max-h-[50vh] overflow-auto'>
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
                  label={"AMI ID"}
                  detail={
                    "Enter an AMI ID from an AMI such as AWS Linux or Ubunutu Linux."
                  }
                  required={true}
                />
                <input
                  onChange={(e) => {
                    setData({
                      ...data,
                      ami_id: e.target.value,
                    });
                  }}
                  value={data.ami_id}
                  type='text'
                  className='input-text'
                />
              </div>

              <div className='space-y-1'>
                <Detail label={"Attach Security Groups"} required={true} />
                <div className='flex flex-col max-h-[50vh] overflow-auto pb-5 pt-5'>
                  {availableSecurityGroups &&
                    availableSecurityGroups.map((securityGroup, index) => (
                      <div
                        key={index} // It's important to use a unique key for list items
                        className='flex border-t border-b border-gray-300 w-full google-text font-normal container-hover flex items-center'
                      >
                        <div>
                          <input
                            type='checkbox'
                            checked={engineSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                // Add GroupId to array if checked
                                setData((prevData) => ({
                                  ...prevData,
                                  security_group_ids: [
                                    ...prevData.security_group_ids,
                                    securityGroup.GroupId,
                                  ],
                                }));
                              } else {
                                // Remove GroupId from array if unchecked
                                setData((prevData) => ({
                                  ...prevData,
                                  security_group_ids:
                                    prevData.security_group_ids.filter(
                                      (id) => id !== securityGroup.GroupId
                                    ),
                                }));
                              }
                            }}
                            className='mr-2'
                          />
                        </div>
                        <div className='flex flex-col text-left justify-start'>
                          <h1 className='mr-auto'>
                            Group name: {securityGroup.GroupName}
                          </h1>
                          <h2>Description: {securityGroup.Description}</h2>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              <div className='space-y-1'>
                <Detail label={"EBS Optimized"} required={true} />
                <div className='flex items-center'>
                  <label className='flex items-center space-x-3'>
                    <input
                      type='radio'
                      name='existingKeyPair'
                      value='yes'
                      checked={data.ebs_optimized === true}
                      onChange={() => setData({ ...data, ebs_optimized: true })}
                      className='form-radio h-4 w-4'
                    />
                    <span>Yes</span>
                  </label>
                  <label className='flex items-center space-x-3 ml-6'>
                    <input
                      type='radio'
                      name='existingKeyPair'
                      value='no'
                      checked={data.ebs_optimized === false}
                      onChange={() =>
                        setData({ ...data, ebs_optimized: false })
                      }
                      className='form-radio h-4 w-4'
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>
              <div className='space-y-1 mr-auto w-full'>
                <Detail
                  label={"EBS Type"}
                  required={true}
                  className='google-text font-semibold font-lg'
                />
                {Object.keys(ebsVolume).map((family) => (
                  <div className='border-b'>
                    <h1 className='google-text font-medium text-base text-left '>
                      {family}
                    </h1>
                    {ebsVolume[family].map((volume) => (
                      <>
                        <h1
                          className={`google-text font-sm text-left hover:bg-gray-100 ${
                            data.volume_type == volume.type
                              ? "bg-gray-200"
                              : null
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            setData({ ...data, volume_type: volume.type });
                            console.log(volume);
                          }}
                        >
                          {volume.type}
                          {data.volume_type !== null &&
                          data.volume_type == volume.type ? (
                            <div className='flex flex-col'>
                              <div>
                                <h2>Enter volume size</h2>
                              </div>
                              <div className='flex'>
                                <input
                                  onChange={(e) =>
                                    setData({
                                      ...data,
                                      volume_size: parseInt(e.target.value),
                                    })
                                  }
                                  value={data.volume_size}
                                  type='number'
                                  placeholder={
                                    volume.minSize.int +
                                    volume.minSize.unit +
                                    " to " +
                                    volume.maxSize.int +
                                    volume.maxSize.unit
                                  }
                                  className='input-text'
                                />

                                <select
                                  className='bg-gray-100'
                                  onChange={(e) => {
                                    setData({
                                      ...data,
                                      volume_size_unit: e.target.value,
                                    });
                                  }}
                                >
                                  <option key={1} value='GiB'>
                                    GiB
                                  </option>
                                  <option key={2} value='TiB'>
                                    {" "}
                                    TiB
                                  </option>
                                </select>
                              </div>
                            </div>
                          ) : null}
                        </h1>
                        <div className='mt-2 mb-2'></div>
                      </>
                    ))}
                    <div className='mt-2 mb-2 h-1'></div>
                  </div>
                ))}
              </div>
              <div className='space-y-1'>
                <Detail
                  label={"Delete volume on termination"}
                  required={true}
                />
                <div className='flex items-center'>
                  <label className='flex items-center space-x-3'>
                    <input
                      type='radio'
                      name='delete_on_termination'
                      value='yes'
                      checked={engineSelected}
                      onChange={() => {}}
                      className='form-radio h-4 w-4'
                    />
                    <span>Yes</span>
                  </label>
                  <label className='flex items-center space-x-3 ml-6'>
                    <input
                      type='radio'
                      name='delete_on_termination'
                      value='no'
                      checked={engineSelected}
                      onChange={() => {}}
                      className='form-radio h-4 w-4'
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>
              */}
            </>
          )}
          {currentStep === 2 && (
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
                  <Detail label={"RDS Type"} detail={data["RDS_type"]} />
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
                  {data["engine"] ? (
                    <Detail label={"Engine"} detail={data["engine"]} />
                  ) : (
                    <Detail label={"Engine"} detail={"Empty"} required={true} />
                  )}
                  {data["security_group_ids"] ? (
                    <Detail
                      label={"Security Groups"}
                      detail={JSON.stringify(data["security_group_ids"])}
                    />
                  ) : (
                    <Detail
                      label={"Security Groups"}
                      detail={"Empty"}
                      required={true}
                    />
                  )}
                  {data.idle_timeout >= 0 ? (
                    <Detail
                      label={"Engine Version"}
                      detail={data.engine_version}
                    />
                  ) : (
                    <Detail
                      label={"Engine Version"}
                      detail={"Empty"}
                      required={true}
                    />
                  )}
                  {data["License"] ? (
                    <Detail label={"License"} detail={data["license"]} />
                  ) : (
                    <Detail
                      label={"License"}
                      detail={"Empty"}
                      required={true}
                    />
                  )}
                  {data["storage_type"] ? (
                    <Detail
                      label={"Storage Type"}
                      detail={data["storage_type"]}
                    />
                  ) : (
                    <Detail
                      label={"Storage Type"}
                      detail={"Empty"}
                      required={true}
                    />
                  )}
                  {data["allocated_storage"] ? (
                    <Detail
                      label={"Allocated Storage"}
                      detail={data.allocated_storage}
                    />
                  ) : (
                    <Detail
                      label={"Allocated Storage"}
                      detail={"Empty"}
                      required={true}
                    />
                  )}
                  {data["retention_period"] ? (
                    <Detail
                      label={"Retention Period"}
                      detail={data.retention_period}
                    />
                  ) : (
                    <Detail
                      label={"Retention Period"}
                      detail={"Empty"}
                      required={true}
                    />
                  )}
                  {data["associated_EC2_instance"] ? (
                    <Detail
                      label={"Associated EC2 Instance"}
                      detail={data.associated_EC2_instance}
                    />
                  ) : (
                    <Detail
                      label={"Associated EC2 Instance"}
                      detail={"Empty"}
                      required={true}
                    />
                  )}
                  {data["performance_insights"] == true ? (
                    <Detail label={"Performance Insights"} detail={"Enabled"} />
                  ) : (
                    <Detail
                      label={"Performance Insights"}
                      detail={"Disabled"}
                    />
                  )}
                  {data["database_authentication"] && (
                    <Detail
                      label={"Database Authentication"}
                      detail={"Enabled"}
                    />
                  )}
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
              {currentStep <= 1 && currentStep >= 0 && (
                <button
                  onClick={() => handleStep(currentStep)}
                  type='button'
                  className='secondary-button'
                >
                  Next
                </button>
              )}
              {currentStep == 2 && (
                <button
                  onClick={(e) => handleSubmission(e)}
                  type='button'
                  className='secondary-button'
                >
                  Submit
                </button>
              )}
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
};

export default CreateRDSTemplate;
