"use client";

import React from "react";
import Breadcrumb from "@/app/components/admin/breadcrumbs/Breadcrumb";
import Cours from "@/app/components/admin/cours/Cours";

export default function CoursPage() {
  return (
    <>
      <Breadcrumb pageName="Tous les cours" />
      <Cours />
    </>
  );
}