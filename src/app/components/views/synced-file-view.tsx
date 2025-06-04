"use client";
import React, { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/utils";
import { SyncedObject } from "@/db/schema";
import { ChevronDown } from "lucide-react";
import { SyncedObjectDropdown } from "./synced-object-dropdown";
import { SyncedObjectType } from "./data-table-view";
import Image from "next/image";

export function SyncedFilesView({ session, selectedObjectType }: { session: { user: any, paragonUserToken?: string }, selectedObjectType: SyncedObjectType }) {
  const [expandedRow, setExpandedRows] = useState<Set<string>>(new Set());
  const { data: syncedObjects, isLoading, } = useSWR<Array<SyncedObject>>(session ? `/api/synced-objects/?objectType=${selectedObjectType}` : null,
    fetcher, { fallbackData: [] });

  const toggleRow = (rowId: string) => {
    const newExpandedRows = new Set(expandedRow);
    if (newExpandedRows.has(rowId)) {
      newExpandedRows.delete(rowId);
    } else {
      newExpandedRows.add(rowId);
    }
    setExpandedRows(newExpandedRows);
  }


  return (
    <div className="py-3 h-80 overflow-y-scroll">
      <h1 className="text-xl font-semibold mb-2">Files Synced</h1>
      {isLoading ? (
        <div className="flex flex-col">
          {[44, 32, 28, 52].map((item) => (
            <div key={item} className="p-2 my-[2px]">
              <div
                className={`w-${item} h-[20px] rounded-md bg-zinc-200 dark:bg-zinc-600 animate-pulse`}
              />
            </div>
          ))}
        </div>
      ) : (
        <table className="w-full text-sm table-fixed border-b border-slate-300 dark:border-slate-700">
          <thead className="border-b bg-muted border-slate-300 dark:border-slate-700">
            <tr>
              <th className="p-2 w-36 rounded-tl-md text-left">source</th>
              <th className="p-2 text-left">filename</th>
              <th className="p-2 text-left rounded-tr-md">updated at</th>
            </tr>
          </thead>
          <tbody>
            {
              syncedObjects?.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center p-2 font-semibold text-lg">
                    no data yet
                  </td>
                </tr>
              ) : (
                syncedObjects?.map((syncedObject) => {
                  return (
                    <React.Fragment key={syncedObject.id}>
                      <tr className={expandedRow.has(syncedObject.id) ? "" : "border-b border-slate-300 dark:border-slate-700"} key={syncedObject.id}>
                        <td className="text-sm p-2 flex items-center flex-row space-x-1">
                          <ChevronDown size={18} className={expandedRow.has(syncedObject.id) ? "rotate-180" : ""} onClick={() => toggleRow(syncedObject.id)} />
                          <Image height={25} width={25}
                            src={syncedObject.source === "googledrive" ? "/google-drive-logo.png" :
                              syncedObject.source === "box" ? "/box-logo.webp" : "/dropbox-logo.png"} alt="logo" />
                          <div>
                            {syncedObject.source}
                          </div>
                        </td>
                        <td className="text-sm p-2 overflow-x-clip">{JSON.parse(syncedObject.data).name}</td>
                        <td className="text-sm p-2">{new Date(syncedObject.updatedAt.toString()).toString().split("GMT")[0]}</td>
                      </tr>
                      {expandedRow.has(syncedObject.id) &&
                        <SyncedObjectDropdown syncedObject={syncedObject} session={session} />
                      }
                    </React.Fragment>
                  )
                })
              )
            }
          </tbody>
        </table>
      )
      }
    </div >
  );
}
