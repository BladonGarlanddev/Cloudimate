import {useState} from "react";
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
import styles from "./styling/Chart.module.css";

const Chart = ({ id, data, metric, title, deleteChart }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    //div changes styles based on the hovering property
    <div
      className={`chart-container ${isHovered ? styles.chartHovered : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.chartHeader}>
        <h2>Instance ID: {title}</h2>
        <button onClick={(e) => {
          e.preventDefault();
          deleteChart(id)
          }
          } className={styles.closeIcon}>X</button>
      </div>

      <ResponsiveContainer width='100%' height={250}>
        <LineChart data={data}>
          <Line
            type='linear'
            dataKey={metric}
            strokeWidth={2}
            stroke='#1E429F'
          />
          <XAxis dataKey='timestamp' />
          <YAxis />
          <CartesianGrid strokeDasharray='3 3' />
          <Tooltip />
          <Legend />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
