import React from "react";
import styles from "./page.module.css";

export type button_type = "light" | "dark";

export type ButtonProps = {
  icon?: any;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const Button: React.FC<ButtonProps> = ({ icon, children, ...props }) => {
  return (
    <button className={styles.button} {...props}>
      <div className={styles.content}>{children}</div>
    </button>
  );
};

export default Button;
