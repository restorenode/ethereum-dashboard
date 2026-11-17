import type { ReactNode } from "react";
import styles from "./Panel.module.scss";

type Props = {
  index: string;
  title: string;
  unit?: string;
  right?: ReactNode;
  children: ReactNode;
};

export default function Panel({ index, title, unit, right, children }: Props) {
  return (
    <div className={styles.panel}>
      <div className={styles.head}>
        <div className={styles.titleRow}>
          <span className={styles.index}>{index}</span>
          <span className={styles.title}>{title}</span>
          {unit && <span className={styles.muted}>{unit}</span>}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}
