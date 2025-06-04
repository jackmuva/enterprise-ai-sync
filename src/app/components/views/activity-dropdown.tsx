import { Activity } from "@/db/schema"
import { formatJson } from "@/lib/utils";

export const ActivityDropdown = ({ activity }: { activity: Activity }) => {

  return (
    <tr key={activity.id + "data"} className="border-b border-slate-300 dark:border-slate-700">
      <td colSpan={3}>
        <div className="flex flex-col space-y-1">
          <div className="font-semibold">Data: </div>
          <pre className="border-2 border-slate-300 dark:border-slate-700 rounded p-2 whitespace-pre-wrap break-all text-xs bg-muted ">
            {formatJson(activity.data?.toString() ?? "no data")}
          </pre>
        </div>
      </td>
    </tr >
  );
}
