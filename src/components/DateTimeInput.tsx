"use client";

import { PatternFormat } from "react-number-format";
import styles from "../app/page.module.css";

interface DateTimeInputProps {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}

export default function DateTimeInput({ label, value, placeholder, onChange }: DateTimeInputProps) {
  return (
    <div className={styles.inputGroup}>
      <label>{label}</label>
      <PatternFormat
        format="##/##/#### ##:##"
        mask="_"
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}