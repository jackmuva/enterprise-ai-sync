"use client";

import { UserRoundCheck, LogOut, } from "lucide-react";
import { useState } from "react";
import { handleSignOut } from "@/app/actions/auth";

interface UserDropdownProps {
  user: {
    user: any,
    paragonUserToken?: string | undefined
  },
}

export const UserDropdown = ({ user }: UserDropdownProps) => {
  const [dropdown, setDropdown] = useState(false);

  const toggleDropdown = () => {
    setDropdown(dropdown => !dropdown);
  };

  const closeDropdown = () => {
    setDropdown(false);
  };

  return (
    <div className="relative">
      <div onClick={toggleDropdown}
        className="rounded-md bg-muted px-3 py-2 font-semibold flex space-x-2 cursor-pointer hover:bg-muted/80 transition-colors">
        <UserRoundCheck size={20} />
        <div>{user.user ? user.user.firstName : "ERROR"}</div>
      </div>

      {dropdown && (
        <>
          <div className="fixed inset-0 z-10" onClick={closeDropdown} />
          <div className="absolute right-0 mt-2 w-48 bg-background border border-slate-300 dark:border-slate-700 rounded-md shadow-lg z-20">
            <div className="py-1">
              <div className="px-4 py-2">
                <div className="text-sm font-medium">
                  {user.user ? `${user.user.firstName}` : "User"}
                </div>
                {user.user?.email && (
                  <div className="text-sm">
                    {user.user.email}
                  </div>
                )}
              </div>
              <form action={handleSignOut}>
                <button type="submit"
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-muted cursor-pointer transition-colors">
                  <LogOut size={16} className="mr-2" />
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}; 
