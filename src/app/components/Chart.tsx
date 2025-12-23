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
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: { 
              labels: { 
                usePointStyle: true, 
                pointStyle: "line",
                color: "#00ffff",
                font: {
                  family: "'Courier New', monospace",
                  size: 16,
                  weight: "bold"
                },
                padding: 20,
                boxWidth: 20,
                boxHeight: 12
              } 
            },
            tooltip: {
              backgroundColor: "rgba(10, 10, 10, 0.95)",
              titleColor: "#00ffff",
              bodyColor: "#ffffff",
              borderColor: "#00ffff",
              borderWidth: 2,
              padding: 12,
              titleFont: {
                family: "'Courier New', monospace",
                size: 14,
                weight: "bold"
              },
              bodyFont: {
                family: "'Courier New', monospace",
                size: 12
              },
              boxPadding: 6,
              displayColors: true,
              callbacks: {
                label: function(context) {
                  return `${context.dataset.label}: ${context.parsed.y.toFixed(4)}`;
                }
              }
            }
          },
          scales: {
            x: { 
              title: { 
                display: true, 
                text: "Block Number",
                color: "#00ffff",
                font: {
                  family: "'Courier New', monospace",
                  size: 14,
                  weight: "bold"
                }
              }, 
              grid: { 
                color: "rgba(0, 255, 255, 0.2)",
                lineWidth: 1
              },
              ticks: {
                color: "#00ffff",
                font: {
                  family: "'Courier New', monospace",
                  size: 11
                }
              }
            },
            y: { 
              title: { 
                display: true, 
                text: title,
                color: "#00ffff",
                font: {
                  family: "'Courier New', monospace",
                  size: 14,
                  weight: "bold"
                }
              }, 
              grid: { 
                color: "rgba(0, 255, 255, 0.2)",
                lineWidth: 1
              },
              ticks: {
                color: "#00ffff",
                font: {
                  family: "'Courier New', monospace",
                  size: 11
                }
              }
            },
          },
        }}
      />
    </div>
  );
};

export default Chart;
