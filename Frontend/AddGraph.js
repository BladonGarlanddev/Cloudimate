import axiosInstance from "./api/axiosConfig";
import { useEffect, useState } from "react";
import styles from "./styling/AddGraph.module.css";

const AddGraph = ({
  setBuildGraph,
  selectedResource,
  setSelectedResource,
  setStep,
}) => {
  const [resources, setResources] = useState([]);
  const axios = axiosInstance();

  const handleCheck = (id) => {
    setResources(
      resources.map((r) =>
        r.id === id ? { ...r, isChecked: !r.isChecked } : r
      )
    );
  };

  useEffect(() => {
    axios
      .get("/api/aws/getResourceData")
      .then((response) => {
        let data = response.data;
        let tempResources = []; // Temporary array to hold resource data

        // Extracting EC2 Instances information
        if (data.ec2Instances && data.ec2Instances.Reservations.length > 0) {
          console.log("EC2 Instances Info:");
          data.ec2Instances.Reservations.forEach((reservation) => {
            reservation.Instances.forEach((instance) => {
              tempResources.push({
                id: instance.InstanceId,
                instance: "EC2",
                type: instance.InstanceType,
                AZ: instance.Placement.AvailabilityZone,
              });
            });
          });
        } else {
          console.log("No EC2 Instances found.");
        }

        // Extracting RDS DB Instances information
        if (data.rdsInstances && data.rdsInstances.DBInstances.length > 0) {
          console.log("\nRDS DB Instances Info:");
          data.rdsInstances.DBInstances.forEach((dbInstance) => {
            tempResources.push({
              id: dbInstance.DBInstanceIdentifier,
              instance: "RDS",
              type: dbInstance.DBInstanceClass,
              AZ: null,
            });
          });
        } else {
          console.log("No RDS DB Instances found.");
        }

        setResources(tempResources); // Update the state once after processing
        console.log(resources);
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });
  }, []);

  return (
    <div className='fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center'>
      <div className='container centered-container max-w-md'>
        <div className={styles.GraphBuildHeader}>
          <h1 className='google-text'>Resources</h1>
        </div>
        <div className={styles.GraphBuildBody}>
          {resources.map((resource, index) => (
            <div
              key={index}
              className='container flex w-full items-center mb-2 mt-2'
              onClick={() => setSelectedResource(resource)}
            >
              <ul className='p-3 w-full'>
                <li>Instance: {resource.instance}</li>
                <li>ID: {resource.id}</li>
                <li>Type: {resource.type}</li>
                <li>Availability Zone: {resource.AZ || "N/A"}</li>
              </ul>

              <div
                className={`h-6 w-6 mb-4 rounded-full border-2 border-gray-400 flex items-center justify-center ${
                  selectedResource?.id === resource.id
                    ? "bg-blue-500 border-blue-500"
                    : ""
                }`}
                onClick={() => handleCheck(resource.id)}
              >
                {selectedResource == index && (
                  <span className='block h-3 w-3 bg-white rounded-full'></span>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className={styles.GraphBuildFooter}>
          <button
            className='rounded-md mr-2 bg-gray-300 p-4 w-full'
            onClick={() => setBuildGraph(false)}
          >
            Cancel
          </button>
          <button
            className='button p-4 w-full bg-custom-color'
            onClick={() => {
              if (selectedResource !== null) {
                setStep(2);
              }
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddGraph;
