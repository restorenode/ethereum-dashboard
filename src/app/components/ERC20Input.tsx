import React from "react";
import styles from "./ERC20Input.module.scss";

const ERC20Input = ({ value, onChange }) => {
  return (
    <input
      type="text"
      className={styles.inputBox}
      value={value}
      onChange={onChange}
      placeholder="Enter ERC20 Token Address"
    />
  );
};

export default ERC20Input;
