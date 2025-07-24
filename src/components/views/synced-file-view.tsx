"use client";
import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/utils";
import { SyncedObject } from "@/db/schema";
import { ChevronDown, RefreshCw } from "lucide-react";
import { SyncedObjectDropdown } from "./synced-object-dropdown";
import Image from "next/image";
import { FILE_STORAGE_INTEGRATIONS, SyncedObjectType } from "@/lib/types";
import { toast } from "sonner";

export function SyncedFilesView({ session, selectedObjectType }: { session: { user: any, paragonUserToken?: string }, selectedObjectType: SyncedObjectType }) {
  const [expandedRow, setExpandedRows] = useState<Set<string>>(new Set());
  const { data: syncStatus } = useSWR(session ? `/api/sync/check-status?objectType=${selectedObjectType}` : null,
    fetcher, { fallbackData: [] });
  const { data: syncedObjects, isLoading, mutate } = useSWR<Array<SyncedObject>>(session ? `/api/synced-objects/?objectType=${selectedObjectType}` : null,
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

  const pullData = () => {
    toast("Pulling files from sync");
    for (const integration of FILE_STORAGE_INTEGRATIONS!) {
      fetch(`${window.location.origin}/api/sync/pull/files`, {
        method: "POST",
        body: JSON.stringify({
          event: "sync_pull",
          sync: integration,
          data: JSON.stringify(syncStatus.statuses[integration]),
          objectType: selectedObjectType,
        }),
      }).then(() => {
        mutate();
      });
    }
  }

  return (
    <div className="rounded-md border border-slate-300 dark:border-slate-700 p-3 h-80 max-w-[900px] overflow-y-scroll">
      <div className="flex justify-between items-center w-full">
        <h1 className="text-xl font-semibold mb-2">Objects Synced</h1>
        <RefreshCw size={25} className="border p-1 border-slate-300 dark:border-slate-700 rounded-md 
        cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-100" onClick={pullData} />
      </div>
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
        <table className="w-full text-sm table-fixed">
          <thead className="border-b bg-muted border-slate-300 dark:border-slate-700">
            <tr>
              <th className="p-2 w-44 rounded-tl-md text-left">source</th>
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
                          <Image height={22} width={22}
                            src={syncedObject.source === "googledrive" ? "/google-drive-logo.png" :
                              syncedObject.source === "box" ? "/box-logo.webp" : "/dropbox-logo.png"} alt="logo" />
                        </td>
                        <td className="text-sm p-2 overflow-hidden whitespace-nowrap text-ellipsis">{JSON.parse(syncedObject.data).name}</td>
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
