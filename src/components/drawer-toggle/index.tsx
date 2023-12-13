"use client";
import styles from "./drawer-toggle.module.scss";

interface DrawerToggleProps {
  isOpen: boolean;
  toggle: () => void;
}

export default function DrawerToggle({ toggle, isOpen }: DrawerToggleProps) {
  return (
    <div className={[styles.toggle, isOpen ? styles.open : ""].join(" ")} onClick={toggle}>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
}
