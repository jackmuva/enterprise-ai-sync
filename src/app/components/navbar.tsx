import { userWithToken } from "@/app/actions/auth";
import { UserDropdown } from "@/app/components/user-dropdown";
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
      <UserDropdown user={user} />
    </div>
  );
}
