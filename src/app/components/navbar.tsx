import { userWithToken } from "@/app/actions/auth";
import { UserDropdown } from "@/app/components/user-dropdown";
import Image from "next/image";
import { TabBar } from "./tab-bar";

export const Navbar = async () => {
  const user = await userWithToken();

  return (
    <div className="bg-background absolute top-0 left-0 w-dvw p-3 z-30 flex flex-col space-y-2 items-center">
      <div className="flex justify-between items-center w-dvw px-3">
        <div className="flex items-center space-x-4 font-bold">
          <Image src="/icon.png"
            alt="Generic SaaS icon"
            width={30}
            height={30} />
          <div className="text-lg">
            Enterprise AI
          </div>
        </div>
        <UserDropdown user={user} />
      </div>
      <TabBar />
    </div>
  );
}
