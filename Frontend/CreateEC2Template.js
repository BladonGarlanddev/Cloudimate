import { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import Detail from "./Detail";
import Header from "./Header";
import { Helmet } from "react-helmet";
import SelectCronTemplate from "./SelectCronTemplate";
import axiosInstance from "./api/axiosConfig";

const CreateEC2Template = () => {
  const history = useHistory();
  const axios = axiosInstance();
  const [create, setCreate] = useState(false);

  const [error, setError] = useState({});
  const [errorMessageS, setErrorMessageS] = useState([]);
  const [useExistingKeyPair, setUseExistingKeyPair] = useState(null);
  const [availableSecurityGroups, setAvailableSecurityGroups] = useState(null);
  const [EBSOptimized, setEBSOptimized] = useState(null);
  const [deleteOnTermination, setDeleteOnTermination] = useState(null);
  const [useIamRole, setUseIamRole] = useState(null);
  const [iamRoles, setIamRoles] = useState(null);

  const step = [
    { id: 0, title: "Step 1", detail: "EC2 Information" },
    { id: 1, title: "Step 2", detail: "Instance Configuration" },
    { id: 2, title: "Step 3", detail: "Review Details" },
    { id: 2, title: "Step 3", detail: "Submitted" },
  ];

  const [data, setData] = useState({
    template_name: null,
    description: null,
    EC2_type: "ON_DEMAND",
    instance_type: null,
    ami_id: null,
    security_group_ids: [],
    ebs_optimized: false,
    volume_size: null,
    volume_type: null,
    volume_size_unit: null,
    delete_on_termination: null,
    iam_role: null,
  });

  const [currentStep, setCurrentStep] = useState(0);

  const handleStep = (step, value) => {
    let listOfErrors = [];

    if (step === 0) {
      if (data.template_name === "" || data.template_name === null)
        listOfErrors.push("EC2 Name can not be left empty");
    } else if (step === 1) {
      if (!data.instance_type) listOfErrors.push("Select an instance type");

      if (data.ami_id == null || data.ami_id == "" || data.ami_id == " ")
        listOfErrors.push("Enter a valid AMI ID");

      if (data.ebs_optimized == null)
        listOfErrors.push("Must select yes or no for EBS Optimized");

      if (data.volume_type == null)
        listOfErrors.push("Must Select EBS volume type");

      if (data.volume_size == null || data.volume_size < 1)
        listOfErrors.push("Enter a valid volume size");

      if (data.volume_size_unit == null)
        listOfErrors.push("Select a volume size unit (GiB or TiB)");

      if (data.delete_on_termination == null)
        listOfErrors.push("Must select yes or no for delete on termination");
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

  const instanceTypes = {
    "General Purpose": [
      "t4g.micro",
      "t4g.small",
      "t4g.medium",
      "t4g.large",
      "t4g.xlarge",
      "t4g.2xlarge",
      "t3.nano",
      "t3.micro",
      "t3.small",
      "t3.medium",
      "t3.large",
      "t3.xlarge",
      "t3.2xlarge",
      "t3a.nano",
      "t3a.micro",
      "t3a.small",
      "t3a.medium",
      "t3a.large",
      "t3a.xlarge",
      "t3a.2xlarge",
      "m6g.medium",
      "m6g.large",
      "m6g.xlarge",
      "m6g.2xlarge",
      "m6g.4xlarge",
      "m6g.8xlarge",
      "m6g.12xlarge",
      "m6g.16xlarge",
      "t2.nano",
      "t2.micro",
      "t2.small",
      "t2.medium",
      "t2.large",
      "t2.xlarge",
      "t2.2xlarge",
    ],
    "Compute Optimized": [
      "c5.large",
      "c5.xlarge",
      "c5.2xlarge",
      "c5.4xlarge",
      "c5.9xlarge",
      "c5.18xlarge",
      "c5n.large",
      "c5n.xlarge",
      "c5n.2xlarge",
      "c5n.4xlarge",
      "c5n.9xlarge",
      "c5n.18xlarge",
      "c6g.medium",
      "c6g.large",
      "c6g.xlarge",
      "c6g.2xlarge",
      "c6g.4xlarge",
      "c6g.8xlarge",
      "c6g.12xlarge",
      "c6g.16xlarge",
    ],
    "Memory Optimized": [
      "r5.large",
      "r5.xlarge",
      "r5.2xlarge",
      "r5.4xlarge",
      "r5.12xlarge",
      "r5.24xlarge",
      "r6g.medium",
      "r6g.large",
      "r6g.xlarge",
      "r6g.2xlarge",
      "r6g.4xlarge",
      "r6g.8xlarge",
      "r6g.12xlarge",
      "r6g.16xlarge",
    ],
    "Accelerated Computing": [
      "p3.2xlarge",
      "p3.8xlarge",
      "p3.16xlarge",
      "p4d.24xlarge",
      "g4dn.xlarge",
      "g4dn.2xlarge",
      "g4dn.4xlarge",
      "g4dn.8xlarge",
      "g4dn.12xlarge",
      "g4dn.16xlarge",
    ],
    "Storage Optimized": [
      "i3.large",
      "i3.xlarge",
      "i3.2xlarge",
      "i3.4xlarge",
      "i3.8xlarge",
      "i3.16xlarge",
      "d2.xlarge",
      "d2.2xlarge",
      "d2.4xlarge",
      "d2.8xlarge",
    ],
  };

  const ebsVolume = {
    "General Purpose": [
      {
        type: "gp3",
        minSize: {
          int: 1, // Example values, adjust according to actual specs
          unit: "GiB",
        },
        maxSize: {
          int: 16, // Example values
          unit: "TiB",
        },
      },
      {
        type: "gp2",
        minSize: {
          int: 1, // Example values
          unit: "GiB",
        },
        maxSize: {
          int: 16, // Example values
          unit: "TiB",
        },
      },
    ],
    "Provisioned IOPS SSD": [
      {
        type: "io1",
        minSize: {
          int: 4,
          unit: "GiB",
        },
        maxSize: {
          int: 16,
          unit: "TiB",
        },
      },
      {
        type: "io2",
        minSize: {
          int: 4,
          unit: "GiB",
        },
        maxSize: {
          int: 64,
          unit: "TiB",
        },
      },
      {
        type: "io2 Block Express",
        minSize: {
          int: 4,
          unit: "GiB",
        },
        maxSize: {
          int: 64,
          unit: "TiB",
        },
      },
    ],
    "Throughput Optimized HDD": [
      {
        type: "st1",
        minSize: {
          int: 125,
          unit: "GiB",
        },
        maxSize: {
          int: 16,
          unit: "TiB",
        },
      },
    ],
    "Cold HDD": [
      {
        type: "sc1",
        minSize: {
          int: 125,
          unit: "GiB",
        },
        maxSize: {
          int: 16,
          unit: "TiB",
        },
      },
    ],
    Magnetic: [
      {
        type: "standard",
        minSize: {
          int: 1, // Example values
          unit: "GiB",
        },
        maxSize: {
          int: 1, // Example values, adjust if there are specific limits
          unit: "TiB",
        },
      },
    ],
  };

  const [instanceFamily, setInstanceFamily] = useState("General Purpose");
  console.log("using existing key pair: " + useExistingKeyPair);

  const handleSubmission = async (e) => {
    e.preventDefault();

    try {
      const response = await axios
        .post("/api/makeEC2Template", data)
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

  const [cronPopUp, setCronPopUp] = useState(true);
  const [selectCronTemplate, setSelectCronTemplate] = useState(false);
  const [currentCronTemplate, setCurrentCronTemplate] = useState({});

  useEffect(() => {
    axios
      .get("/api/aws/getSecurityGroups")
      .then((response) => {
        setAvailableSecurityGroups(response.data);
      })
      .catch((error) => {});
  }, []);

  useEffect(() => {
    if (useIamRole) {
      axios
        .get("/api/aws/listIamRoles")
        .then((response) => {
          setIamRoles(response.data.roles);
        })
        .catch((error) => {});
    }
  }, [useIamRole]);

  console.log(JSON.stringify(data.iam_role))

  return (
    <div className='my-5 flex flex-row space-x-5 mx-5'>
      <Helmet>
        <title>Cloudimate | EC2 Builder</title>
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
                  detail={"Enter a name of your EC2 template."}
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
                  detail={"Enter a description for your EC2 template."}
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
                  label={"EC2 type"}
                  detail={"This setting is already predetermined."}
                />
                <input
                  type='text'
                  className='input-text-disabled'
                  disabled
                  value={data.EC2_type}
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
                    onChange={(e) => setInstanceFamily(e.target.value)}
                    className='input-text w-11 google-text font-normal'
                  >
                    <option value={null}>Select an option</option>{" "}
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
                            checked={data.security_group_ids.includes(
                              securityGroup.GroupId
                            )}
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
                                  <option value=''>Select an option</option>{" "}
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
                      checked={deleteOnTermination === true}
                      onChange={() => {
                        setDeleteOnTermination(true);
                        data.delete_on_termination = true;
                      }}
                      className='form-radio h-4 w-4'
                    />
                    <span>Yes</span>
                  </label>
                  <label className='flex items-center space-x-3 ml-6'>
                    <input
                      type='radio'
                      name='delete_on_termination'
                      value='no'
                      checked={deleteOnTermination === false}
                      onChange={() => {
                        setDeleteOnTermination(false);
                        data.delete_on_termination = false;
                      }}
                      className='form-radio h-4 w-4'
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>
              <div className='space-y-1'>
                <Detail label={"Associate IAM Role"} required={true} />
                <div className='flex items-center'>
                  <label className='flex items-center space-x-3'>
                    <input
                      type='radio'
                      name='useIamRole'
                      value={true}
                      checked={useIamRole === true}
                      onChange={() => {
                        setUseIamRole(true);
                      }}
                      className='form-radio h-4 w-4'
                    />
                    <span>Yes</span>
                  </label>
                  <label className='flex items-center space-x-3 ml-6'>
                    <input
                      type='radio'
                      name='useIamRole'
                      value={false}
                      checked={useIamRole === false}
                      onChange={() => {
                        setUseIamRole(false);
                      }}
                      className='form-radio h-4 w-4'
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>
              <div className='space-y-1'>
                {useIamRole == true && Array.isArray(iamRoles) && (
                  <>
                    <Detail
                      label={"Choose IAM Role"}
                      detail={
                        "Choose an IAM Role to associate with your EC2 instance"
                      }
                      required={true}
                    />
                    <div className='flex flex-col space-y-2 rounded-md pb-2'>
                      <select
                        onChange={(e) => {
                          // Find the role object based on the RoleId
                          const selectedRole = iamRoles.find(
                            (role) => role.RoleId === e.target.value
                          );
                          // Set the role data into the state
                          if (selectedRole) {
                            setData({
                              ...data,
                              iam_role: {
                                RoleName: selectedRole.RoleName,
                                RoleId: selectedRole.RoleId,
                              },
                            });
                          }
                        }}
                        className='input-text w-11 google-text font-normal'
                      >
                        <option value=''>Select an option</option>{" "}
                        {iamRoles.map((role) => (
                          <option key={role.RoleId} value={role.RoleId}>
                            {role.RoleName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>
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
                  <Detail label={"EC2 Type"} detail={data["EC2_type"]} />
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
                  {data["ami_id"] ? (
                    <Detail label={"AMI_ID"} detail={data["ami_id"]} />
                  ) : (
                    <Detail label={"AMI_ID"} detail={"Empty"} required={true} />
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
                      label={"EBS Optimized"}
                      detail={`${data.ebs_optimized ? "Yes" : "No"}`}
                    />
                  ) : (
                    <Detail
                      label={"EBS Optimized"}
                      detail={"Empty"}
                      required={true}
                    />
                  )}
                  {data["volume_type"] ? (
                    <Detail
                      label={"EBS Volume Type"}
                      detail={data["volume_type"]}
                    />
                  ) : (
                    <Detail
                      label={"EBS Volume Type"}
                      detail={"Empty"}
                      required={true}
                    />
                  )}
                  {data["volume_size"] ? (
                    <Detail
                      label={"EBS Volume Size"}
                      detail={
                        data["volume_size"] + " " + data["volume_size_unit"]
                      }
                    />
                  ) : (
                    <Detail
                      label={"EBS Volume Size"}
                      detail={"Empty"}
                      required={true}
                    />
                  )}
                  {data["delete_on_termination"] ? (
                    <Detail
                      label={"Delete EBS Volume On Termination"}
                      detail={`${data.delete_on_termination ? "Yes" : "No"}`}
                    />
                  ) : (
                    <Detail
                      label={"EBS Volume Size"}
                      detail={"Empty"}
                      required={true}
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
              {currentStep >= 1 && (
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

export default CreateEC2Template;
