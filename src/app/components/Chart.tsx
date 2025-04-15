import React from "react";
import { Line } from "react-chartjs-2";
import styles from "./Chart.module.scss";

const Chart = ({ title, data, children }) => {
  return (
    <div className={styles.chart}>
      <div className={styles.chartHeader}>
        <h2>{title}</h2>
        {children}
      </div>
      <Line
        data={data}
        options={{
          plugins: {
            legend: { labels: { usePointStyle: true, pointStyle: "line" } },
          },
          scales: {
            x: { title: { display: true, text: "Block Number" }, grid: { color: "#fff", lineWidth: 0.5 } },
            y: { title: { display: true, text: title }, grid: { color: "#fff", lineWidth: 0.5 } },
          },
        }}
      />
    </div>
  );
};

export default Chart;
