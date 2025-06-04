"use client";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";

enum SyncedObjectType {
  FILE_STORAGE = "File Storage",
  DOCUMENTS = "Documents",
  CRM = "CRM"
}

export const DataTableView = ({ session }: { session: { user: any, paragonUserToken?: string } }) => {
  const [dropdown, setDropdown] = useState(false);
  const [objectType, setObjectType] = useState<SyncedObjectType>(SyncedObjectType.FILE_STORAGE);

  const toggleDropdown = () => {
    setDropdown(dropdown => !dropdown);
  };

  const closeDropdown = () => {
    setDropdown(false);
  };

  return (
    <div className="px-2">
      <div className="relative">
        <div onClick={toggleDropdown}
          className="mt-2 rounded-md w-48 bg-muted px-3 py-2 font-semibold flex items-center justify-center space-x-2 cursor-pointer hover:bg-muted/80 transition-colors">
          <ChevronDownIcon className={`absolute left-2 ${dropdown ? "rotate-180" : ""}`} size={20} />
          <div>{objectType}</div>
        </div>
        {dropdown && (
          <>
            <div className="fixed inset-0 z-10" onClick={closeDropdown} />
            <div className="absolute left-0 mt-2 w-48 bg-background border border-slate-300 dark:border-slate-700 rounded-md shadow-lg z-20">
              {Object.keys(SyncedObjectType).map((type) => {
                return (
                  //@ts-ignore
                  <div className="cursor-pointer hover:bg-muted px-2" onClick={() => setObjectType(SyncedObjectType[type])}>
                    {SyncedObjectType[type]}</div>
                );
              })
              }
            </div>
          </>
        )}
      </div>
    </div>
  );
}; 
