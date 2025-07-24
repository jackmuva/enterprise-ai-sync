import { formatJson } from "@/lib/utils";
import { SyncedObject } from "@/db/schema"
export const SyncedObjectDropdown = ({ syncedObject, session }: { syncedObject: SyncedObject, session: { user: any, paragonUserToken?: string } }) => {

  return (
    <tr key={syncedObject.id + "data"} className="border-b border-slate-300 dark:border-slate-700">
      <td colSpan={3}>
        <div className="flex flex-col space-y-1">
          <div className="font-semibold">Data: </div>
          <pre className="border border-slate-300 dark:border-slate-700 rounded p-2 whitespace-pre-wrap break-all text-xs bg-muted border-b">
            {formatJson(syncedObject.data?.toString() ?? "no data")}
          </pre>
        </div>
      </td>
    </tr >
  );
}
