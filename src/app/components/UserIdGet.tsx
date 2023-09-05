"use client"
import React from 'react'
import { useAuth } from "@clerk/nextjs";

function UserIdGet() {

    const { isLoaded, userId, sessionId, getToken } = useAuth();

  return userId;
}

export default UserIdGet