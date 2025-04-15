import React from "react";
import styles from "./RecentBlocks.module.scss";

const RecentBlocks = ({ blocks }) => {
  return (
    <div className={styles.recentBlocks}>
      <h2>Recent Blocks</h2>
      <br />
      <ul>
        {blocks.map((block, index) => (
          <li key={`${block.number}-${index}`}>
            Block #{block.number} - {block.transactions.length} transactions
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentBlocks;
