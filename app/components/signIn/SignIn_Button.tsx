import { auth } from '@/auth'
import React from 'react'
import { SignIn, SignOut } from './auth_components'
import Button from '../button/Button'

async function SignIn_Button() {
    const session = await auth()
    if (!session?.user) return <SignIn provider='google' />
    return (
        <div className="">
            <span className="">
                {session.user.email}
            </span>
            <SignOut />

        </div>
    )
}

export default SignIn_Button