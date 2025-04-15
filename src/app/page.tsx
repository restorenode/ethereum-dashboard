"use client";

import { useEffect, useState } from "react";
import alchemy from "@/lib/alchemy";
import PageTitle from "@/app/components/PageTitle";
import RecentBlocks from "@/app/components/RecentBlocks";
import Chart from "@/app/components/Chart";
import ERC20Input from "@/app/components/ERC20Input";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from "chart.js";
import { isAddress, id } from "ethers";
import styles from "./Dashboard.module.scss";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function Home() {
  const [blocks, setBlocks] = useState([]);
  const [baseFeeData, setBaseFeeData] = useState({ labels: [], datasets: [] });
  const [gasUsageData, setGasUsageData] = useState({ labels: [], datasets: [] });
  const [erc20Data, setErc20Data] = useState({ labels: [], datasets: [] });
  const [tokenAddress, setTokenAddress] = useState("");

  useEffect(() => {
    const fetchBlocks = async () => {
      const latestBlock = await alchemy.core.getBlockNumber();
      const blockPromises = [];
      for (let i = 0; i < 10; i++) {
        blockPromises.push(alchemy.core.getBlock(latestBlock - i));
      }
      const blockData = await Promise.all(blockPromises);
      setBlocks(blockData);
      updateBaseFeeChart(blockData);
      updateGasUsageChart(blockData);
      if (isAddress(tokenAddress)) updateERC20Chart(blockData, tokenAddress);
    };

    fetchBlocks();

    alchemy.ws.on("block", async (blockNumber) => {
      const newBlock = await alchemy.core.getBlock(blockNumber);

      setBlocks((prevBlocks) => {
        if (prevBlocks.find((block) => block?.number === newBlock?.number)) {
          return prevBlocks;
        }

        const updatedBlocks = [newBlock, ...prevBlocks.slice(0, 9)];

        updateBaseFeeChart(updatedBlocks);
        updateGasUsageChart(updatedBlocks);
        if (isAddress(tokenAddress)) updateERC20Chart(updatedBlocks, tokenAddress);

        return updatedBlocks;
      });
    });

    return () => {
      alchemy.ws.removeAllListeners();
    };
  }, [tokenAddress]);

  const updateBaseFeeChart = (blockData) => {
    const labels = blockData.map((block) => block.number).reverse();
    const data = blockData.map((block) => Number(block.baseFeePerGas) / 1e9).reverse();
    setBaseFeeData({
      labels,
      datasets: [{ label: "Base Fee (Gwei)", data, borderColor: "rgba(75,192,192,1)", borderWidth: 2 }],
    });
  };

  const updateGasUsageChart = (blockData) => {
    const labels = blockData.map((block) => block.number).reverse();
    const data = blockData.map((block) => (block.gasUsed / block.gasLimit) * 100).reverse();
    setGasUsageData({
      labels,
      datasets: [{ label: "Gas Usage (%)", data, borderColor: "rgba(255,99,132,1)", borderWidth: 2 }],
    });
  };

  const updateERC20Chart = async (blockData, token) => {
    if (!token || typeof token !== "string" || !isAddress(token.trim())) return;

    const labels = blockData.map((block) => block.number).reverse();
    const dataPromises = blockData.map((block) =>
      alchemy.core.getLogs({
        fromBlock: block.number,
        toBlock: block.number,
        address: token.trim(),
        topics: [id("Transfer(address,address,uint256)")],
      })
    );
    const logsArray = await Promise.all(dataPromises);
    const data = logsArray.map((logs) =>
      logs.reduce((sum, log) => sum + parseInt(log.data, 16), 0) / 1e18
    ).reverse();

    setErc20Data({
      labels,
      datasets: [
        {
          label: `Transfer Volume (${token.slice(0, 6)}...)`,
          data,
          borderColor: "rgba(54,162,235,1)",
          borderWidth: 2,
        },
      ],
    });
  };

  return (
    <div>
      <PageTitle />
      <div className={styles.container}>
        <RecentBlocks blocks={blocks} />
        <Chart title="Base Fee per Block" data={baseFeeData} />
        <Chart title="Gas Usage Ratio" data={gasUsageData} />
        <Chart title="ERC20 Transfer Volume" data={erc20Data}>
          <ERC20Input value={tokenAddress} onChange={(e) => setTokenAddress(e.target.value)} />
        </Chart>
      </div>
    </div>
  );
}
