import { userWithToken } from "@/app/actions/auth";
import { UserDropdown } from "@/app/components/navbar/user-dropdown";
import Image from "next/image";
import { TabBar } from "../navbar/tab-bar";

export const Navbar = async () => {
  const user = await userWithToken();

  return (
    <div className="bg-background absolute top-0 left-0 w-dvw p-3 z-30 flex flex-col space-y-4 items-center">
      <div className="flex justify-between items-center w-dvw px-3">
        <div className="flex items-center space-x-1 font-bold">
          <Image src={"/ai-icon.png"}
            alt="Generic SaaS icon"
            width={40}
            height={40} />
          <div className="text-lg">
            YourApp.ai
          </div>
        </div>
        <UserDropdown user={user} />
      </div>
      <TabBar />
    </div>
  );
}
