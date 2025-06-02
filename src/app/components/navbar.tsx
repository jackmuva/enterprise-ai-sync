import { userWithToken } from "@/lib/utils";
import { UserRoundCheck } from "lucide-react";
import Image from "next/image";

export const Navbar = async () => {
  const user = await userWithToken();

  return (
    <div className="bg-background absolute top-0 left-0 w-dvw p-3 z-30 border-b flex justify-between items-center">
      <div className="flex items-center space-x-6 font-bold">
        <Image src="/icon.png"
          alt="Generic SaaS icon"
          width={50}
          height={50} />
        <div className="text-2xl">
          Enterprise AI
        </div>
      </div>
      <div className="flex items-center px-3">
        <div className="rounded-md bg-muted px-3 py-2 font-semibold flex space-x-2 cursor-pointer">
          <UserRoundCheck size={20} />
          <div>{user.user ? user.user.firstName : "ERROR"}</div>
        </div>
      </div>
    </div>
  );
}
