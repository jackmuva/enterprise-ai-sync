import { formatJson } from "@/lib/utils";
import { SyncedObject } from "@/db/schema"
import { ShieldCheck } from "lucide-react";
import { useState } from "react";
export const SyncedObjectDropdown = ({ syncedObject, session }: { syncedObject: SyncedObject, session: { user: any, paragonUserToken?: string } }) => {
  const [allowed, setAllowed] = useState<{ message?: string, users?: Array<any> }>({ message: "check users to list permitted users" });
  const checkPermissions = async () => {
    const req = await fetch(`${window.location.origin}/api/permissions`, {
      method: "POST",
      body: JSON.stringify({
        integration: syncedObject.source,
        id: syncedObject.id,
      }),
    });
    const res = await req.json();
    console.log(res);
    setAllowed(res);
  }

  return (
    <tr key={syncedObject.id + "data"} className="border-b border-slate-300 dark:border-slate-700">
      <td colSpan={3}>
        <div className="flex flex-col space-y-1">
          <div className="font-semibold">Data: </div>
          <pre className="border border-slate-300 dark:border-slate-700 rounded p-2 whitespace-pre-wrap break-all text-xs bg-muted border-b">
            {formatJson(syncedObject.data?.toString() ?? "no data")}
          </pre>
          <div className="flex space-x-2 mt-2">
            <h2 className="font-semibold">Permissions:</h2>
            <button
              className="w-fit text-sm cursor-pointer space-x-1 flex items-center"
              onClick={() => checkPermissions()}
            >
              <ShieldCheck size={15} />
              <p className="hover:underline">Check Users</p>
            </button>

          </div>
          <pre className="border border-slate-300 dark:border-slate-700 rounded p-2 whitespace-pre-wrap break-all text-xs bg-muted border-b">
            {formatJson(allowed)}
          </pre>
        </div>
      </td>
    </tr >
  );
}
