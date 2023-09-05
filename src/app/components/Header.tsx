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
    <div className="navbar bg-base-100">
                <div className="flex-1">
                    <a className="btn btn-ghost normal-case text-xl" href='/'>Eco Art</a>
                </div>

                <div className="flex gap-5 pr-2">
                    <div className="flex-none">
                        <ul className="menu menu-horizontal px-1">
                            <li className='ml-8'><Link href='/'>Upcoming Events</Link></li>
                            <li><Link href='/tickets'>My Events</Link></li>
                            {/* <li>
        <details>
          <summary>
            Parent
          </summary>
          <ul className="p-2 bg-base-100">
            <li><a>Link 1</a></li>
            <li><a>Link 2</a></li>
          </ul>
        </details>
      </li> */}
                        </ul>
                    </div>
                    <UserButton afterSignOutUrl="/" />
                </div>
            </div>
  )
}

export default Header