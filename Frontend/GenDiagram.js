import React, { useState, useEffect, useRef, useContext } from "react";
import { useHistory } from "react-router-dom";
import axiosInstance from "./api/axiosConfig";
import { RegionContext } from "./context/RegionContext";
import styles from "./styling/GenDiagram.module.css";
import add from "./assets/add.png";
import minus from "./assets/minus.png";
import gateway from "./assets/gateway.png";
import EC2 from "./assets/EC2.png";
import RDS from "./assets/RDS.png";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useDrag } from "react-dnd";
import { useDrop } from "react-dnd";
//import ResourceGrid from "./ResourceGrid";
import DraggableResource from "./DragableResource";
import ResourceNavBar from "./ResourceNavBar";

const GenDiagram = ({ selectedTemplate, setSelectedTemplate }) => {
  const history = useHistory();
  const axios = axiosInstance();
  const { selectedRegion, setSelectedRegion } = useContext(RegionContext);

  const [environmentStructure, setEnvironmentStructure] = useState(
    selectedTemplate.environment_structure
  );

  const copyStructure = { ...environmentStructure };

  const [resourceTemplates, setResourceTemplates] = useState([]);
  const [selectedResourceId, setSelectedResourceId] = useState(null);

  const [gridItems, setGridItems] = useState(null);

  useEffect(() => {
    setEnvironmentStructure(selectedTemplate.environment_structure);
    return () => {
      handleTemplateSubmission();
    };
  }, [selectedTemplate]);

  useEffect(() => {}, [selectedRegion]);

  const az = {
    "us-east-1": 5,
    "us-east-2": 3,
    "us-west-1": 3,
    "us-west-2": 3,
  };

  //chat gpt wrote this. I cannot decipher it.
  const generatedOptions = Object.entries(az).flatMap(([region, zoneCount]) => {
    if (region === selectedRegion) {
      return Array.from({ length: zoneCount }).map((_, index) => {
        const azLetter = String.fromCharCode(97 + index); // 'a' corresponds to index 0
        const optionValue = `${region}${azLetter}`;
        const optionText = `${region} - Zone ${azLetter}`;
        return (
          <option key={optionValue} value={optionValue}>
            {optionText}
          </option>
        );
      });
    }
    return []; // Return an empty array for non-matching regions, so it gets flattened
  });

  const emptyStructure = {
    VPC: {
      IGW: false,
      name: "Choose Name",
      IP: null,
      availabilityZones: [
        {
          id: 1,
          name: null,
          subnets: [
            {
              id: 1,
              name: "Choose Name",
              IP: null,
              IGW: false,
              resources: [],
              routeTable: {
                name: null,
                entries: [
                  {
                    id: 1,
                    destination: null,
                    target: null,
                  },
                ],
              },
            },
          ],
        },
      ],
    },
  };

  const RouteTable = ({ name, entries, p_index }) => {
    const [editing, setEditing] = useState(false);
    const destinationRef = useRef(null);
    const targetRef = useRef(null);

    const handleSubmit = (index) => {
      copyStructure.VPC.availabilityZones[p_index[0]].subnets[
        p_index[1]
      ].routeTable.entries[index].destination = destinationRef.current.value;
      copyStructure.VPC.availabilityZones[p_index[0]].subnets[
        p_index[1]
      ].routeTable.entries[index].target = targetRef.current.value;
      setEnvironmentStructure(copyStructure);
    };
    const handleInputKeyDown = (e, index) => {
      if (e.key === "Enter") {
        handleSubmit(index);
      }
    };
    const handleClick = (index) => {
      setEditing(true);
    };
    const EntryHeader = ({
      index,
      p_index,
      environmentStructure,
      setEnvironmentStructure,
    }) => (
      <div className={styles.entryHeader}>
        Entry {index + 1}{" "}
        <button
          onClick={() => {
            copyStructure.VPC.availabilityZones[p_index[0]].subnets[
              p_index[1]
            ].routeTable.entries.splice(index, 1);
            setEnvironmentStructure(copyStructure);
          }}
        >
          <img src={minus} alt='Remove Entry' />
        </button>
      </div>
    );

    const EntryInput = ({ defaultValue, placeholder, refValue, onKeyDown }) => (
      <input
        className={styles.entryInput}
        type='text'
        placeholder={placeholder}
        defaultValue={defaultValue}
        ref={refValue}
        onKeyDown={onKeyDown}
      />
    );

    const EditableField = ({ isEditing, value, placeholder, inputProps }) =>
      isEditing || !value ? (
        <EntryInput {...inputProps} />
      ) : (
        <div
          className={`${
            inputProps.placeholder == "Target"
              ? styles.submittedTarget
              : styles.submittedDestination
          }`}
          onClick={inputProps.onClick}
        >
          {value !== null ? value : placeholder}
        </div>
      );

    return (
      <div className={styles.tableContainer}>
        <div className={styles.tableName}>Route Table</div>
        <div className={styles.table}>
          <div className={styles.tableColumns}></div>
          <div className={styles.tableRowNames}>
            <div className={styles.entryDestination}>Destination:</div>
            <div className={styles.entryTarget}>Target:</div>
          </div>
          {entries.map((entry, index) => (
            <div key={index} className={styles.entryArea}>
              <EntryHeader
                index={index}
                p_index={p_index}
                environmentStructure={environmentStructure}
                setEnvironmentStructure={setEnvironmentStructure}
              />

              <EditableField
                isEditing={editing || !entry.destination}
                value={entry.destination}
                placeholder='Click to edit'
                inputProps={{
                  placeholder: "Destination",
                  defaultValue: entry.destination,
                  refValue: destinationRef,
                  onKeyDown: (e) => handleInputKeyDown(e, index),
                }}
              />

              <EditableField
                isEditing={editing || !entry.target}
                value={entry.target}
                placeholder='Click to Edit'
                inputProps={{
                  placeholder: "Target",
                  defaultValue: entry.target,
                  refValue: targetRef,
                  onKeyDown: (e) => handleInputKeyDown(e, index),
                  onClick: () => handleClick(index),
                }}
              />
            </div>
          ))}
          <button
            className={styles.entryAddButton}
            onClick={() => {
              if (
                copyStructure.VPC.availabilityZones[p_index[0]].subnets[
                  p_index[1]
                ].routeTable.entries.length < 9
              ) {
                const data = { destination: null, target: null };
                copyStructure.VPC.availabilityZones[p_index[0]].subnets[
                  p_index[1]
                ].routeTable.entries.push(data);
                setEnvironmentStructure(copyStructure);
              }
            }}
          >
            +
          </button>
        </div>
      </div>
    );
  };

  const removeResource = (resourceIndex, azIndex, subnetIndex) => {
    const resources =
      copyStructure.VPC.availabilityZones[azIndex].subnets[subnetIndex]
        .resources;

    resources.splice(resourceIndex, 1);
    setEnvironmentStructure(copyStructure);
  };

  const ResourceGrid = ({ azIndex, subnetIndex }) => {
    const _resources =
      environmentStructure.VPC.availabilityZones[azIndex].subnets[subnetIndex]
        .resources;

    const [{ isOver }, drop] = useDrop(() => ({
      accept: "resource",
      drop: (item) => addResourceToGrid(item.id),
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }));

    const addResourceToGrid = (id) => {
      const resourceToAdd = resourceTemplates.find(
        (resource) => id === resource.id
      );
      if (resourceToAdd) {
        const newResources = [..._resources, resourceToAdd];
        copyStructure.VPC.availabilityZones[azIndex].subnets[
          subnetIndex
        ].resources = newResources;
        setEnvironmentStructure(copyStructure);
      }
    };

    return (
      <div ref={drop} className={styles.gridContainer}>
        {_resources.length > 0 ? (
          _resources.map((resource, index) => (
            <div key={index} className={styles.gridCell}>
              {resource && (
                <DraggableResource
                  resource={resource}
                  resourceIndex={index}
                  azIndex={azIndex}
                  subnetIndex={subnetIndex}
                  removeResource={removeResource}
                />
              )}
            </div>
          ))
        ) : (
          <div className={styles.emptyGrid}>
            <span className={styles.emptyGridText}>Drag Resources Here</span>
          </div>
        )}
      </div>
    );
  };

  function Subnet({ name, routeTable, azIndex, subnetIndex }) {
    const _subnets = copyStructure.VPC.availabilityZones[azIndex].subnets;

    const [ipValue, setIpValue] = useState(environmentStructure.VPC.availabilityZones[azIndex].subnets[subnetIndex].IP);
    const [nameValue, setNameValue] = useState(environmentStructure.VPC.availabilityZones[azIndex].subnets[subnetIndex].name);

    const [editingName, setEditingName] = useState(false);
    const [editingIP, setEditingIP] = useState(false);
    
    const handleSubnetNameChange = (newValue, index) => {
      if (editingName) {
        _subnets[index].name = newValue;
      } else {
        try {
          const [enteredIPAddress, enteredSubnetMask] = newValue.split("/");
          _subnets[index].IP = newValue;
        } catch (error) {
          console.log("Subnets data likely empty");
        }
      }
      setEnvironmentStructure(JSON.parse(JSON.stringify(copyStructure)));
      setEditingName(false);
      setEditingIP(false);
    };

    const handleSubnetBlur = (index) => {
      console.log("blur method ran");

      const newValue = editingName
        ? nameValue
        : ipValue;
      handleSubnetNameChange(newValue, index);
    };

    const handleInputKeyDown = (e, index) => {
      if (e.key === "Enter") {
        handleSubnetBlur(index);
        console.log("index: " + index);
      }
    };


    
    return (
      <div className={styles.subnetContainer}>
        <div className={styles.subnet}>
          <div className={styles.subnetHeader}>
            <div className={styles.subnetName}>
              {editingName ? (
                <input
                  type='text'
                  placeholder='Subnet Name'
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  onBlur={(e) => {
                    e.preventDefault();
                    handleSubnetBlur(subnetIndex);
                  }}
                  onKeyDown={(e) => handleInputKeyDown(e, subnetIndex)}
                  autoFocus
                />
              ) : (
                <span
                  onClick={() => {
                    setEditingName(true);
                  }}
                >
                  {environmentStructure.VPC.availabilityZones[azIndex].subnets[
                    subnetIndex
                  ].name
                    ? `Name: ${environmentStructure.VPC.availabilityZones[azIndex].subnets[subnetIndex].name}`
                    : "Name: Click to Edit"}
                </span>
              )}
              <div className={styles.subnetButtons}>
                <button
                  onClick={(e) => {
                    e.preventDefault();

                    const data =
                      emptyStructure.VPC.availabilityZones[0].subnets[0];
                    copyStructure.VPC.availabilityZones[azIndex].subnets.push(
                      data
                    );
                    setEnvironmentStructure(copyStructure);
                  }}
                >
                  <div className={styles.changeButtons}> + </div>
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (
                      environmentStructure.VPC.availabilityZones[azIndex]
                        .subnets.length >= 2
                    ) {
                      copyStructure.VPC.availabilityZones[
                        azIndex
                      ].subnets.splice(subnetIndex, 1);
                      setEnvironmentStructure(copyStructure);
                    } else {
                      errorMessages.current.push(
                        "Cant delete only remaining subnet"
                      );
                      setShowError(true);
                    }
                  }}
                >
                  <div className={styles.changeButtons}> - </div>
                </button>
              </div>
            </div>

            <div className={styles.subnetIp}>
              {editingIP ? (
                <div className='flex items-center'>
                  <p>IP: </p>
                  <input
                    type='text'
                    placeholder='xxx.xxx.xxx.xxx/xx'
                    value={ipValue}
                    onChange={(e) => setIpValue(e.target.value)}
                    onBlur={(e) => {
                      e.preventDefault();
                      handleSubnetBlur(subnetIndex);
                    }}
                    onKeyDown={(e) => handleInputKeyDown(e, subnetIndex)}
                    autoFocus
                  />
                </div>
              ) : (
                <span
                  onClick={() => {
                    setEditingIP(true);
                    console.log("vlicked");
                  }}
                >
                  {environmentStructure.VPC.availabilityZones[azIndex].subnets[
                    subnetIndex
                  ].IP
                    ? `IP: ${environmentStructure.VPC.availabilityZones[azIndex].subnets[subnetIndex].IP}`
                    : "IP: Click to Edit"}
                </span>
              )}
            </div>
          </div>
          <div className={styles.subnetGrid}>
            <ResourceGrid
              resourceTemplates={resourceTemplates}
              azIndex={azIndex}
              subnetIndex={subnetIndex}
            />
          </div>

          {/*routeTable && <RouteTable {...routeTable} p_index={p_index} />*/}
          {environmentStructure.VPC.IGW == true && (
            <div className={styles.subnetFooter}>
              <button
                className={styles.IgwButton}
                onClick={(e) => {
                  e.preventDefault();

                  copyStructure.VPC.availabilityZones[azIndex].subnets[
                    subnetIndex
                  ].IGW =
                    !copyStructure.VPC.availabilityZones[azIndex].subnets[
                      subnetIndex
                    ].IGW;

                  setEnvironmentStructure(copyStructure);
                }}
              >
                {environmentStructure.VPC.availabilityZones[azIndex].subnets[
                  subnetIndex
                ].IGW == false ? (
                  <p>Attach Internet Gateway</p>
                ) : (
                  <p>Detach Internet Gateway</p>
                )}
              </button>
              <div className={styles.gatewayImgContainer}>
                {environmentStructure.VPC.availabilityZones[azIndex].subnets[
                  subnetIndex
                ].IGW ? (
                  <button
                    onClick={(e) => {
                      e.preventDefault();

                      copyStructure.VPC.availabilityZones[azIndex].subnets[
                        subnetIndex
                      ].IGW = false;
                      setEnvironmentStructure(copyStructure);
                    }}
                  >
                    <img src={gateway} />
                  </button>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const AvailabilityZones = ({ name, subnets }) => {
    const [selectedOption, setSelectedOption] = useState(name);
    const ref = copyStructure.VPC.availabilityZones;

    const handleOptionChange = (e, index) => {
      ref[index].name = e.target.value;
      setEnvironmentStructure(copyStructure);
    };

    return (
      <>
        {environmentStructure.VPC.availabilityZones.map((az, index) => (
          <div className={styles.AzContainer}>
            <div className={styles.AzName}>
              Availability Zone:
              {environmentStructure.name !== null ? (
                generatedOptions.length > 0 ? (
                  <select
                    value={ref[index].name}
                    onChange={(e) => handleOptionChange(e, index)}
                  >
                    {generatedOptions}
                  </select>
                ) : (
                  <p>No available zones for the selected region</p>
                )
              ) : (
                <p>Select a availability zone</p>
              )}
            </div>
            {environmentStructure.VPC.availabilityZones[index].subnets.map(
            (subnet, subnetIndex) => (
              <Subnet azIndex={index} subnetIndex={subnetIndex} />
            ))}
            
            <div className={styles.azButtonArea}>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  const data = emptyStructure.VPC.availabilityZones[0];
                  ref.push(data);
                  setEnvironmentStructure(copyStructure);
                }}
              >
                <div className={styles.changeButtons}> + </div>
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (environmentStructure.VPC.availabilityZones.length >= 2) {
                    ref.splice(index, 1);
                    setEnvironmentStructure(copyStructure);
                  } else {
                    errorMessages.current.push(
                      "Can't delete only remaining AZ."
                    );
                    setShowError(true);
                  }
                }}
              >
                <div className={styles.changeButtons}> - </div>
              </button>
            </div>
          </div>
        ))}
      </>
    );
  };

  const VPC = ({ name }) => {
    const [editingName, setEditingName] = useState(false);
    const [editingIP, setEditingIP] = useState(false);

    const [ipValue, setIpValue] = useState(
      environmentStructure.VPC.IP
    );

    const [nameValue, setNameValue] = useState(
      environmentStructure.VPC.name
    );

    const handleNameChange = (newValue, index) => {
      if (editingName) {
        copyStructure.VPC.name = newValue;
      } else {
        copyStructure.VPC.IP = newValue;
      }

      setEnvironmentStructure(JSON.parse(JSON.stringify(copyStructure)));
      setEditingName(false);
      setEditingIP(false);
    };

    const handleBlur = (index) => {
      console.log("blur method ran");

      const newValue = editingName ? nameValue : ipValue;
      handleNameChange(newValue, index);
    };

    const handleInputKeyDown = (e, index) => {
      if (e.key === "Enter") {
        handleBlur(index);
        console.log("index: " + index);
      }
    };

    return (
      <div className={styles.VpcContainer}>
        <div className={styles.VpcHeader}>
          <div className={styles.VpcName}>
            {editingName ? (
              <div className='flex'>
                <p>VPC Name: </p>
                <input
                  type='text'
                  placeholder='Enter Name'
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  onBlur={handleBlur}
                  onKeyDown={handleInputKeyDown}
                  autoFocus
                />
              </div>
            ) : (
              <span
                onClick={() => {
                  setEditingIP(false);
                  setEditingName(true);
                }}
              >
                {name ? `VPC: ${name}` : "VPC Name: Click to Edit"}
              </span>
            )}
          </div>

          <div className={styles.VpcIp}>
            {editingIP ? (
              <div className='flex items-center'>
                <p>IP: </p>
                <input
                  type='text'
                  placeholder='xxx.xxx.xxx.xxx/xx'
                  value={ipValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  onBlur={handleBlur}
                  onKeyDown={handleInputKeyDown}
                  autoFocus
                />
              </div>
            ) : (
              <span
                onClick={() => {
                  setEditingIP(true);
                  setEditingName(false);
                }}
              >
                {environmentStructure.VPC.IP
                  ? `IP: ${environmentStructure.VPC.IP}`
                  : "IP: Click to Edit"}
              </span>
            )}
          </div>
          <button
            className={styles.VPCIgwButton}
            onClick={(e) => {
              e.preventDefault();
              copyStructure.VPC.IGW = !copyStructure.VPC.IGW;
              setEnvironmentStructure(copyStructure);
            }}
          >
            {environmentStructure.VPC.IGW == false ? (
              <p>Attach Internet Gateway</p>
            ) : (
              <p>Detach Internet Gateway</p>
            )}
          </button>
          <div className={styles.gatewayVPCImgContainer}>
            {environmentStructure.VPC.IGW ? (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  copyStructure.VPC.IGW = false;
                  setEnvironmentStructure(copyStructure);
                }}
              >
                <img src={gateway} />
              </button>
            ) : null}
          </div>
        </div>
        <AvailabilityZones />
      </div>
    );
  };
  const [selectedOption, setSelectedOption] = useState(null);

  const handleOptionChange = (e) => {
    copyStructure.name = e.target.value;
    setEnvironmentStructure(copyStructure);
  };

  const validateEntries = () => {
    if (
      environmentStructure.VPC.IP == null ||
      environmentStructure.VPC.IP == "" ||
      environmentStructure.VPC.IP == "Click to Edit"
    ) {
      errorMessages.current.push("Empty VPC IP");
    }

    environmentStructure.VPC.availabilityZones.forEach((az) => {
      if (!az.name) {
        errorMessages.current.push("AZ not selected");
      }
    });

    environmentStructure.VPC.availabilityZones.forEach((az, index) => {
      az.subnets.forEach((subnet, index) => {
        if (!subnet.IP || subnet.IP === "") {
          errorMessages.current.push("Empty Subnet IP");
        }
        if (
          !subnet.name ||
          subnet.name === "" ||
          subnet.name == "Choose Name"
        ) {
          errorMessages.current.push("Empty Subnet name");
        }
      });
    });

    try {
      const [vpcIPAddress, vpcSubnetMask] =
        environmentStructure.VPC.IP.split("/");
      if (!vpcIPAddress || !vpcSubnetMask) {
        errorMessages.current.push("Invalid VPC CIDR format.");
      }

      const [vpcFirst, vpcSecond, vpcThird, vpcFourth] = vpcIPAddress
        .split(".")
        .map(Number);
      const vpcSubnetBits = parseInt(vpcSubnetMask, 10);

      if (
        isNaN(vpcFirst) ||
        isNaN(vpcSecond) ||
        isNaN(vpcThird) ||
        isNaN(vpcFourth) ||
        isNaN(vpcSubnetBits)
      ) {
        errorMessages.current.push("Invalid VPC CIDR format.");
      }

      if (
        vpcFirst < 0 ||
        vpcFirst > 255 ||
        vpcSecond < 0 ||
        vpcSecond > 255 ||
        vpcThird < 0 ||
        vpcThird > 255 ||
        vpcFourth < 0 ||
        vpcFourth > 255
      ) {
        errorMessages.current.push("Invalid VPC CIDR format.");
      }

      if (vpcSubnetBits < 16 || vpcSubnetBits > 28) {
        errorMessages.current.push("Invalid VPC CIDR format.");
      }
      let totalSubnetSize = 0;
      for (const az of environmentStructure.VPC.availabilityZones) {
        for (const subnet of az.subnets) {
          const [subnetIPAddress, subnetSubnetMask] = subnet.IP.split("/");
          const [subnetFirst, subnetSecond, subnetThird, subnetFourth] =
            subnetIPAddress.split(".").map(Number);
          const subnetSubnetBits = parseInt(subnetSubnetMask, 10);

          if (subnetIPAddress == vpcIPAddress) {
            errorMessages.current.push("Invalid VPC CIDR format.");
          }

          if (
            subnetFirst < vpcFirst ||
            subnetFirst > vpcFirst + Math.pow(2, 32 - vpcSubnetBits)
          ) {
            errorMessages.current.push("Invalid VPC CIDR format.");
          }

          if (
            subnetSecond < vpcSecond ||
            subnetSecond > vpcSecond + Math.pow(2, 32 - vpcSubnetBits)
          ) {
            errorMessages.current.push("Invalid VPC CIDR format.");
          }

          if (
            subnetThird < vpcThird ||
            subnetThird > vpcThird + Math.pow(2, 32 - vpcSubnetBits)
          ) {
            errorMessages.current.push("Invalid VPC CIDR format.");
          }

          if (
            subnetFourth < vpcFourth ||
            subnetFourth > vpcFourth + Math.pow(2, 32 - vpcSubnetBits)
          ) {
            errorMessages.current.push("Invalid VPC CIDR format.");
          }
          totalSubnetSize += Math.pow(2, 32 - subnetSubnetBits);
        }
      }
      if (totalSubnetSize > Math.pow(2, 32 - vpcSubnetBits))
        errorMessages.current.push("Invalid VPC CIDR format.");
      if (errorMessages.length > 1) {
        setShowError(true);
        return false;
      } else {
        return true;
      }
    } catch (error) {
      errorMessages.current.push("Program Failure: " + error.message);
      setShowError(true);
    }
  };
  const [showError, setShowError] = useState(false);
  const errorMessages = useRef([]);

  const ErrorPopup = () => {
    return (
      <div className={styles.errorPopup}>
        <div className={styles.popupContent}>
          {errorMessages.current.map((error, index) => (
            <p key={index}>{error}</p>
          ))}
          <button
            onClick={(e) => {
              e.preventDefault();
              errorMessages.current = [];
              setShowError(false);
            }}
          >
            OK
          </button>
        </div>
      </div>
    );
  };

  const handleTemplateSubmission = () => {
    if (!validateEntries()) {
    } else {
      axios
        .post("/api/makeEnvironmentTemplate", {
          template_name: selectedTemplate.template_name,
          environment_structure: environmentStructure,
        })
        .then((response) => {
          history.push("/app/templates");
          setSelectedTemplate(null);
        })
        .catch((error) => {
          errorMessages.current = [null];
          errorMessages.current.push(
            "Could not upload template. Check your input fields. You also may not have a subcription."
          );
          setShowError(true);
        });
    }
  };

  const nat_gateway = {
    template_name: "NAT Gateway",
    description: "empty NAT gateway",
    resource_type: "NAT",
    id: "masterNAT",
  };

  useEffect(() => {
    const addResourceType = (templates, type) => {
      return templates.map((template) => ({
        ...template,
        resource_type: type,
        id: template.id + type,
      }));
    };

    const fetchData = async () => {
      try {
        // Parallel requests
        const ec2Response = axios.get("/api/getEC2Templates");
        const rdsResponse = axios.get("/api/getRDSTemplates");

        // Wait for all requests to finish
        const [ec2Data, rdsData] = await Promise.all([
          ec2Response,
          rdsResponse,
        ]);

        // Process and combine data
        const ec2Templates = addResourceType(ec2Data.data, "EC2");
        const rdsTemplates = addResourceType(rdsData.data, "RDS");
        const combinedArray = [...ec2Templates, ...rdsTemplates, nat_gateway];

        // Update state
        setResourceTemplates(combinedArray);
      } catch (error) {}
    };

    // Call the async function
    fetchData();
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={styles.bigDaddy}>
        <div className='mr-5'>
          <ResourceNavBar resourceTemplates={resourceTemplates} />
        </div>
        {showError && <ErrorPopup />}
        <div className={styles.structureContainer}>
          <VPC {...environmentStructure.VPC} />
          <div className='ml-auto mr-auto mt-6'>
            <button
              className={styles.submitButton}
              onClick={handleTemplateSubmission}
            >
              save
            </button>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default GenDiagram;
