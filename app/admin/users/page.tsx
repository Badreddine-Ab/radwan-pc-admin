import Breadcrumb from '@/app/components/admin/breadcrumbs/Breadcrumb'
import DefaultLayout from '@/app/components/admin/layout/DefaultLayout'
import UsersTable from '@/app/components/admin/tables/UsersTable'
import { auth } from '@/auth'
import { SessionProvider } from 'next-auth/react'
import React from 'react'

export default async function page() {
  return (
    <div>
      <Breadcrumb pageName="Etudiants" />
      <UsersTable />

    </div>
  )
}
