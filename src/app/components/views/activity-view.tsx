import { Activity } from "@/db/schema";
import { fetcher } from "@/lib/utils";
import React, { useState } from "react";
import useSWR from "swr";
import { ChevronDown } from "lucide-react";
import { ActivityDropdown } from "./activity-dropdown";
import { SyncedObjectType } from "@/lib/types";
import Image from "next/image";

export const ActivityView = ({ session, selectedObjectType }: { session: { user: any, paragonUserToken?: string }, selectedObjectType: SyncedObjectType }) => {
  const [expandedRow, setExpandedRows] = useState<Set<string>>(new Set());
  const { data: activities, isLoading, } = useSWR<Array<Activity>>(session ? `/api/activity/?objectType=${selectedObjectType}` : null,
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
    <div className="p-3 h-80 max-w-[900px] overflow-y-scroll border border-slate-300 dark:border-slate-700 rounded-md">
      <h1 className="text-xl font-semibold mb-2">Sync Events</h1>
      <table className="w-full text-sm table-fixed">
        <thead className="border-b bg-muted border-slate-300 dark:border-slate-700">
          <tr>
            <th className="text-left w-44 p-2 rounded-tl-md">source</th>
            <th className="p-2 text-left">event</th>
            <th className="p-2 text-left rounded-tr-md">received at</th>
          </tr>
        </thead>
        <tbody>
          {
            activities?.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center p-2 font-semibold text-lg">
                  no data yet
                </td>
              </tr>
            ) :
              (
                activities?.map((activity) => {
                  return (
                    <React.Fragment key={activity.id}>
                      <tr className={expandedRow.has(activity.id) ? "" : "border-b border-slate-300 dark:border-slate-700"} key={activity.id}>
                        <td className="text-sm p-2 items-center flex flex-row space-x-1">
                          <ChevronDown size={18} className={expandedRow.has(activity.id) ? "rotate-180" : ""} onClick={() => toggleRow(activity.id)} />
                          <Image height={22} width={22}
                            src={activity.source === "googledrive" ? "/google-drive-logo.png" :
                              activity.source === "box" ? "/box-logo.webp" : "/dropbox-logo.png"} alt="logo" />
                        </td>
                        <td className="text-sm p-2 items-center">
                          <div className={`font-semibold rounded-xs px-2 w-fit ${activity.event === "sync_triggered" ? 'bg-indigo-700/30 text-indigo-500' :
                            activity.event !== 'sync_errored' ? 'bg-green-500/30 text-green-500' :
                              'bg-red-500/30 text-red-500'}`}>
                            {activity.event}
                          </div>
                        </td>
                        <td className="text-sm p-2 ">{new Date(activity.receivedAt.toString()).toString().split("GMT")[0]}</td>
                      </tr>
                      {expandedRow.has(activity.id) &&
                        <ActivityDropdown activity={activity} />
                      }
                    </React.Fragment>
                  )
                })
              )
          }
        </tbody>
      </table>

    </div>
  );
}
