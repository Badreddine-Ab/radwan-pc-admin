// components/StatisticsCard.tsx
import React from 'react';
import styles from './page.module.css';
import { FaMoneyBillWave, FaShoppingCart, FaUserPlus, FaUsers } from 'react-icons/fa';

const iconMap = {
    money: FaMoneyBillWave,
    users: FaUsers,
    clients: FaUserPlus,
    sales: FaShoppingCart
  };
  
  interface StatisticsCardProps {
    title: string;
    value: string;
    change: string;
    changeType: 'positive' | 'negative';
    icon: 'money' | 'users' | 'clients' | 'sales';
  }
  
  const StatisticsCard: React.FC<StatisticsCardProps> = ({ title, value, change, changeType, icon }) => {
    const IconComponent = iconMap[icon];
  
    return (
      <div className={styles.card}>
        <div className={styles.content}>
          <div className={styles.header}>
            {title}
          </div>
          <div className={styles.value}>
            {value}
          </div>
          <div className={changeType === 'positive' ? styles.changePositive : styles.changeNegative}>
            {change} since yesterday
          </div>
        </div>
        <div className={styles.icon}>
          <IconComponent size={50} />
        </div>
      </div>
    );
  };
  
  export default StatisticsCard;
