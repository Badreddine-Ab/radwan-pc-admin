import Image from "next/image";
import styles from "./page.module.css";
import StatisticsCard from "../components/admin/statistics-card/StatisticsCard";
import CardDataStats from "../components/admin/CardDataStats";
import ChartTwo from "../components/admin/charts/ChartTwo";
import ChartOne from "../components/admin/charts/ChartOne";
import DefaultLayout from "../components/admin/layout/DefaultLayout";
import { Session } from "inspector";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import Dashboard from "../components/admin/dashboard/Dashboard";

export default async function Page() {
  return (
    <>
      <Dashboard />
    </>
  );
}
