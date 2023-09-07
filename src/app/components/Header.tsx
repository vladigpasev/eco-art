"use client"
import React from 'react'
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

function Header() {
  const { isLoaded, userId, sessionId, getToken } = useAuth();
  if (!isLoaded || !userId) {
    return null;
  }
  return (
    <div className="navbar bg-base-100 flex items-center justify-between">
  <div className="flex-1">
    <a className="btn btn-ghost normal-case sm:text-sm md:text-xl lg:text-xl" href='/'>Eco Art</a>
  </div>

  <div className="flex gap-5">
    <div className="flex-none">
      <ul className="menu menu-horizontal px-1 ml-2 lg:ml-8">
        <li><Link href='/' className="text-xs sm:text-normal">Upcoming Events</Link></li>
        <li><Link href='/tickets' className="text-xs sm:text-normal">My Events</Link></li>
      </ul>
    </div>
    <UserButton afterSignOutUrl="/" />
  </div>
</div>

  )
}

export default Header
