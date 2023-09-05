import { authMiddleware } from "@clerk/nextjs";
import { NextMiddleware } from "next/server";
 
// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware
//export default authMiddleware({});
 
const p:NextMiddleware=(params,event)=>{
   console.log(params.url);
   if(!params.url.endsWith('/api/webhooks/clerk')){
   return authMiddleware({})(params,event);
   }
    //if(params.url){}
}

export default p;
export const config = {
    matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
 