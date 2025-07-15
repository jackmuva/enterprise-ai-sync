"use client";
import { ChevronDownIcon, File, Newspaper, Users } from "lucide-react";
import { useState } from "react";
import { SyncedFilesView } from "./views/synced-file-view";
import { ActivityView } from "./views/activity-view";
import { SyncedObjectType } from "@/lib/types";


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
    <div className="px-2 flex flex-col space-y-2">
      <div className="relative">
        <div onClick={toggleDropdown}
          className="mt-2 rounded-md w-48 bg-muted px-3 py-1 font-semibold flex items-center justify-center space-x-2 cursor-pointer hover:bg-muted/80 transition-colors">
          <ChevronDownIcon className={`absolute left-2 ${dropdown ? "rotate-180" : ""}`} size={20} />
          {objectType === SyncedObjectType.FILE_STORAGE ? <File size={16} /> :
            objectType === SyncedObjectType.DOCUMENTS ? <Newspaper size={16} /> :
              <Users size={16} />}
          <div>{objectType}</div>
        </div>
        {dropdown && (
          <>
            <div className="fixed inset-0 z-10" onClick={closeDropdown} />
            <div className="absolute left-0 mt-2 w-48 bg-background border border-slate-300 dark:border-slate-700 rounded-md shadow-lg z-20">
              {Object.keys(SyncedObjectType).map((type: string) => {
                console.log(type);
                return (
                  //@ts-ignore
                  <div key={type} className="flex space-x-1 items-center cursor-pointer hover:bg-blue-500 px-2" onClick={() => setObjectType(SyncedObjectType[type])}>
                    {SyncedObjectType[type] === SyncedObjectType.FILE_STORAGE ? <File size={16} /> :
                      SyncedObjectType[type] === SyncedObjectType.DOCUMENTS ? <Newspaper size={16} /> :
                        <Users size={16} />}
                    <div> {SyncedObjectType[type]} </div>
                  </div>
                );
              })
              }
            </div>
          </>
        )}
      </div>
      <SyncedFilesView session={session} selectedObjectType={objectType} />
      <ActivityView session={session} selectedObjectType={objectType} />
    </div>
  );
}; 
