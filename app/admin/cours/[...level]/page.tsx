import Cours from "@/app/components/admin/cours/Cours";
import Dashboard from "@/app/components/admin/dashboard/Dashboard";
import DefaultLayout from "@/app/components/admin/layout/DefaultLayout";
import { auth } from "@/auth";
import { SessionProvider } from "next-auth/react";


export default async function Page() {

    return (
        <>
            <Cours />
        </>
    )
}



