import { useEffect, useState } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from "recharts";
import Detail from "./Detail";
import Header from "./Header";
import Loading from "./Loading";
import Chart from "./Chart";
import AddGraph from "./AddGraph";
import SelectMetricType from "./SelectMetricType";
import axiosInstance from "./api/axiosConfig";
import styles from "./styling/Dashboard.module.css";

const Dashboard = ({ selectedAccount }) => {
  const axios = axiosInstance();
  // Sets the state for the EC2 instance metric data
  const [instanceData, setInstanceData] = useState(null);
  const [instances, setInstances] = useState(null);

  // Sets the state for the App Stream 2.0 instance metric data
  const [fleetData, setFleetData] = useState(null);
  const [fleets, setFleets] = useState(null);

  const [buildGraph, setBuildGraph] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedResource, setSelectedResource] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState("");
  const [retrievedMetrics, setRetrievedMetrics] = useState([]);
  const [EC2Metrics, setEC2Metrics] = useState([]);

  const metricNameMapping = {
    EC2: {
      "CPU Utilization": "CPUUtilization",
      "Disk Read/Writes": "DiskReadBytes", // This might require more specific handling if you want both reads and writes
      "Network In/Out": "NetworkIn", // Similar to Disk Read/Writes, might need to be split or handled specifically
      "Status Check Failed (Instance)": "StatusCheckFailed_Instance",
      "Status Check Failed (System)": "StatusCheckFailed_System",
      "Disk Read/Write Ops": "DiskWriteOps", // Assuming you'll split this into two different metrics
      "Network Packets In/Out": "NetworkPacketsIn", // Needs to be handled if you want both in and out
      "Instance Store Read/Write Ops": "EBSIOBalance%", // Placeholder, actual value needs verification
      "Instance Store Read/Write Bytes": "EBSByteBalance%", // Placeholder, actual value needs verification
      "EBS Read/Write Ops": "VolumeReadOps", // You may need to handle this separately for read and write
      "EBS Read/Write Bytes": "VolumeReadBytes", // Similarly, might need to be split
      BurstBalance: "BurstBalance",
      "CPU Credit Usage": "CPUCreditUsage",
      "CPU Credit Balance": "CPUCreditBalance",
      "GPU Utilization": "GPUUtilization",
      // ... add any other necessary EC2 metrics
    },
    RDS: {
      "CPU Utilization": "CPUUtilization",
      "Database Connections": "DatabaseConnections",
      "Read IOPS": "ReadIOPS",
      "Write IOPS": "WriteIOPS",
      "Read Latency": "ReadLatency",
      "Write Latency": "WriteLatency",
      "Read Throughput": "ReadThroughput",
      "Write Throughput": "WriteThroughput",
      "Disk Queue Depth": "DiskQueueDepth",
      "Freeable Memory": "FreeableMemory",
      "Swap Usage": "SwapUsage",
      "Free Storage Space": "FreeStorageSpace",
      "Replica Lag": "ReplicaLag",
      "Network Receive Throughput": "NetworkReceiveThroughput",
      "Network Transmit Throughput": "NetworkTransmitThroughput",
      Deadlocks: "Deadlocks",
      "Buffer Cache Hit Ratio": "BufferCacheHitRatio",
      "Engine Uptime": "EngineUptime",
      "Row Lock Time": "RowLockTime",
      "Row Lock Waits": "RowLockWaits",
    },
  };

  function getAWSMetricName(resourceType, friendlyName) {
    return metricNameMapping[resourceType][friendlyName] || friendlyName;
  }

  const transformDataForChart = (metricData, metric) => {
    const { Timestamps, Values } = metricData;
    return Timestamps.map((timestamp, index) => ({
      timestamp,
      [metric]: Values[index],
    }));
  };

  const getInstanceData = (chart) => {
    return axios
      .post("/api/aws/getResourceMetrics", {
        resourceType: chart.resource_type,
        metric: getAWSMetricName(chart.resource_type, chart.metric),
        resourceId: String(chart.resource_id),
      })
      .then((response) => {
        const formattedData = transformDataForChart(
          response.data.data[0],
          chart.metric
        );
        //console.log(response.data.data[0]);
        return {
          data: formattedData,
          resourceType: chart.resource_type,
          metric: chart.metric,
          resourceId: chart.resource_id,
          id: chart.id
        };
      })
      .catch((error) => {
        console.log("error: " + error);
      });
  };

  const getCharts = () => {
    const retrievedGraphMetrics = [];
    axios
      .get("/api/aws/getCharts")
      .then(async (response) => {
        for (const chart of response.data) {
          try {
            const data = await getInstanceData(chart); // Wait for the promise to resolve
            console.log("Data received:", data);
            retrievedGraphMetrics.push(data);
          } catch (error) {
            console.error("Error getting instance data:", error);
          }
        }
        console.log("retrieved metrics: " + retrievedGraphMetrics);
        setRetrievedMetrics((prevData) => [
          ...prevData,
          ...retrievedGraphMetrics,
        ]);
      })
      .catch((error) => {
        console.log(error);
      });
  } 

  const addNewChart = () => {
    axios
      .post("/api/aws/addNewChart", {
        resourceType: selectedResource.instance,
        metric: getAWSMetricName(selectedResource.instance, selectedMetric),
        resourceId: selectedResource.id,
      })
      .then((response) => {
        getCharts();
      })
      .catch((error) => {
        console.log("error: " + error);
      });
  };

  const deleteChart = (chartId) => {
    console.log("id: " + chartId + "\n" + "type: " + typeof(chartId));
    axios
      .post("/api/aws/deleteChart", {
        chartId: chartId,
      })
      .then((response) => {
        console.log("success");
        setRetrievedMetrics((prevData) =>
          prevData.filter((item) => item.id !== chartId)
        );
      })
      .catch((error) => {
        console.log("error: " + error);
      });
  };

  const renderStep = () => {
    if (buildGraph && step === 1) {
      return (
        <AddGraph
          setBuildGraph={setBuildGraph}
          setSelectedResource={setSelectedResource}
          selectedResource={selectedResource}
          setStep={setStep}
        />
      );
    } else if (step === 2) {
      return (
        <SelectMetricType
          setSelectedResource={setSelectedResource}
          selectedResource={selectedResource}
          setStep={setStep}
          setSelectedMetric={setSelectedMetric}
          getInstanceData={getInstanceData}
          addNewChart={addNewChart}
          setBuildGraph={setBuildGraph}
        />
      );
    }
    return null;
  };
  // Function gets the instance data
  /*
    setInstanceData(data);
    setInstances(data["InstanceIds"]);
    const getInstanceData = () => {
    // Shows an error
    setInstanceData(data.body);
    // Shows an error
    setInstanceData(String(error));
    
    setFleetData(data);
    setFleets(data.FleetNames);
    setFleetData(data.body);
    // Shows any errors
    setFleetData(String(error));
    
    
    
  useEffect(() => {
    setInstanceData(null);
    setInstances(null);
    getInstanceData();
    setFleetData(null);
    setFleets(null);
    getAppStreamData();
  }, [selectedAccount]);

  const getInstanceData = () => {
    axios
      .get("/api/aws/getInstanceData?instanceId=i-00bcaaf42504ad3fc")
      .then((response) => {
        setInstanceData(response.data);
        setInstances(response.data["InstanceIds"]);
      })
      .catch((error) => {
        setInstanceData(String(error));
      });
  };

  const getAppStreamData = () => {
    axios
      .get("/api/aws/getAppStreamData")
      .then((response) => {
        setFleetData(response.data);
        setFleets(response.data.FleetNames);
      })
      .catch((error) => {
        setInstanceData(String(error));
      });
  };
  */
  const organizeMetricsByType = (metrics) => {
    return metrics.reduce((acc, metric) => {
      if (metric && typeof metric === "object") {
        const { resourceType } = metric;
        if (resourceType) {
          if (!acc[resourceType]) {
            acc[resourceType] = [];
          }
          acc[resourceType].push(metric);
        } else {
          console.error("Metric does not have a resourceType", metric);
        }
      } else {
        console.error("Invalid metric encountered", metric);
      }
      return acc;
    }, {});
  };

  useEffect(() => {
    getCharts();
  }, []);

  return (
    <div className='page'>
      {retrievedMetrics !== null ? (
        Object.entries(organizeMetricsByType(retrievedMetrics)).map(
          ([resourceType, metrics]) => (
            <div key={resourceType} className='container'>
              <Header title={`${resourceType} Instances`} />
              <div className='grid md:grid-cols-2 grid-cols-1 gap-5 w-full p-4 rounded-b-sm'>
                {metrics.map((metricData, index) => (
                  <Chart
                    id={metricData.id}
                    data={metricData.data}
                    metric={metricData.metric}
                    title={metricData.resourceId}
                    deleteChart={deleteChart}
                  />
                ))}
              </div>
            </div>
          )
        )
      ) : (
        <Loading />
      )}

      <div>{buildGraph && renderStep()}</div>
      <div>
        <button
          className='button text-4 bg-custom-color'
          onClick={() => {
            setBuildGraph(true);
          }}
        >
          Add New Graph
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
