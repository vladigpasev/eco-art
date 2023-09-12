import { SignUp } from "@clerk/nextjs";
 
export default function Page() {
  return (
    <div className="h-screen w-full flex items-center justify-center p-4 md:p-0">
      <SignUp />
    </div>
  );
}