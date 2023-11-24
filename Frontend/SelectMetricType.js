import axiosInstance from "./api/axiosConfig";
import { useEffect, useState } from "react";
import styles from "./styling/AddGraph.module.css";

const SelectMetricType = ({
  selectedResource,
  setSelectedResource,
  setStep,
  setSelectedMetric,
  getInstanceData,
  addNewChart,
  setBuildGraph

}) => {
  const [metricOptions, setMetricOptions] = useState([]);

  const axios = axiosInstance();
  useEffect(()=> {
    switch(selectedResource.instance) {
        case "EC2": 
            setMetricOptions([
              "CPU Utilization",
              "Disk Read/Writes",
              "Network In/Out",
              "Status Check Failed (Instance)",
              "Status Check Failed (System)",
              "Disk Read/Write Ops",
              "Network Packets In/Out",
              "Instance Store Read/Write Ops",
              "Instance Store Read/Write Bytes",
              "EBS Read/Write Ops",
              "EBS Read/Write Bytes",
              "BurstBalance",
              "CPU Credit Usage",
              "CPU Credit Balance",
              "GPU Utilization",
            ]);
            break;
        case "RDS":
            setMetricOptions([
              "CPU Utilization",
              "Database Connections",
              "Read IOPS",
              "Write IOPS",
              "Read Latency",
              "Write Latency",
              "Read Throughput",
              "Write Throughput",
              "Disk Queue Depth",
              "Freeable Memory",
              "Swap Usage",
              "Free Storage Space",
              "Replica Lag",
              "Network Receive Throughput",
              "Network Transmit Throughput",
              "Deadlocks",
              "Buffer Cache Hit Ratio",
              "Engine Uptime",
              "Row Lock Time",
              "Row Lock Waits",
            ]);
            break;
    }
  }, [selectedResource])
  console.log("Selected Resource Instance data: " + selectedResource);

  const handleCheck = (id) => {
    setMetricOptions(
      metricOptions.map((r) =>
        r.id === id ? { ...r, isChecked: !r.isChecked } : r
      )
    );
  };

  return (
    <div className='fixed top-0 left-0 w-screen h-screen bg-gray-500 bg-opacity-50 flex justify-center items-center'>
      <div className='container centered-container max-w-md'>
        <div className={styles.GraphBuildHeader}>
          <h1 className='google-text'>Resources</h1>
        </div>
        <div className={styles.GraphBuildBody}>
          <div className='container mx-auto flex flex-col w-full items-center mb-2 mt-2 overflow-hidden'>
            <label htmlFor='metric-select' className='mb-2'>
              Choose a Metric:
            </label>
            <select
              id='metric-select'
              className='block p-3 w-full border border-gray-300 rounded-md'
              onChange={(e) => setSelectedMetric(e.target.value)}
            >
              <option value=''>--Please choose an option--</option>
              {metricOptions &&
                metricOptions.map((metric, index) => (
                  <option key={index} value={metric}>
                    {metric}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className={styles.GraphBuildFooter}>
          <button
            className='rounded-md mr-2 bg-gray-300 p-4 w-full'
            onClick={() => setStep(1)}
          >
            Back
          </button>
          <button
            className='button p-4 w-full bg-custom-color'
            onClick={(e) => {
              e.preventDefault();
              addNewChart();
              setBuildGraph(false);
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectMetricType;
