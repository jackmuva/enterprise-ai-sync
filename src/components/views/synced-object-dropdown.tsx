import { formatJson } from "@/lib/utils";
import { SyncedObject } from "@/db/schema"
import { ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";

export const SyncedObjectDropdown = ({ syncedObject, session }: { syncedObject: SyncedObject, session: { user: any, paragonUserToken?: string } }) => {
  const [allowed, setAllowed] = useState<{ message?: string, users?: Array<any> }>({ message: "check permissions to list allowed users" });
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const steps = [
    "checking file permissions",
    "traversing folder permissions",
    "checking user groups",
    "propogating all permissions"
  ];

  const checkPermissions = async () => {
    setIsAnimating(true);
    setCurrentStep(0);

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCurrentStep(i + 1);
    }

    const req = await fetch(`${window.location.origin}/api/permissions`, {
      method: "POST",
      body: JSON.stringify({
        integration: syncedObject.source,
        id: syncedObject.id,
      }),
    });
    const res = await req.json();
    setAllowed(res);
    setIsAnimating(false);
  }

  return (
    <tr key={syncedObject.id + "data"} className="border-b border-slate-300 dark:border-slate-700">
      <td colSpan={3}>
        <div className="flex flex-col space-y-1">
          <div className="font-semibold">Data: </div>
          <pre className="border border-slate-300 dark:border-slate-700 rounded p-2 whitespace-pre-wrap break-all text-xs bg-muted border-b">
            {formatJson(syncedObject.data?.toString() ?? "no data")}
          </pre>
          <button
            className="mt-2 font-semibold w-fit text-sm cursor-pointer space-x-1 flex items-center"
            onClick={() => checkPermissions()}
            disabled={isAnimating}
          >
            <ShieldCheck size={15} />
            <p className="hover:underline">Check Permissions</p>
          </button>

          <div className="mt-4 mb-2">
            <div className="flex justify-between max-w-48 relative">

              {steps.map((step, index) => (
                <div key={index} className="flex">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-4 h-4 rounded-full border-1 transition-all duration-500 ${currentStep > index
                        ? 'bg-green-500'
                        : currentStep === index && isAnimating
                          ? 'bg-indigo-600 animate-pulse'
                          : 'bg-gray-200 border-gray-100 dark:bg-gray-700 dark:border-gray-600'
                        }`}
                    />
                    <div className="mt-2 text-center w-24">
                      <p className="text-xs text-gray-600 dark:text-gray-400 max-w-24 leading-tight">
                        {step}
                      </p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-16 mt-2">
                      <div
                        className={`h-0.5 transition-all duration-500 bg-gray-300 dark:bg-gray-600`}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <pre className="mb-2 border border-slate-300 dark:border-slate-700 rounded p-2 whitespace-pre-wrap break-all text-xs bg-muted border-b">
            {formatJson(allowed)}
          </pre>
        </div>
      </td>
    </tr >
  );
}
