"use client";

import useParagon from "@/lib/useParagon";
import { ArrowDownToLine, ChevronDownIcon, PauseOctagon, Play } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

type IntegrationTileProps = {
  integration: {
    icon: string;
    name: string;
    type: string;
  };
  integrationEnabled?: boolean;
  onConnect: () => void;
};

function IntegrationTile({
  integration,
  integrationEnabled,
  onConnect,
}: IntegrationTileProps) {
  const [expanded, setExpanded] = useState(false);
  const { mutate } = useSWRConfig();

  const handleClick = () => {
    if (integrationEnabled) {
      setExpanded((prev) => !prev);
    } else {
      onConnect();
    }
  };

  const triggerSync = async () => {
    const req = await fetch(`${window.location.origin}/api/sync/trigger`, {
      method: "POST",
      headers: { 'Content-Type': "application/json" },
      body: JSON.stringify({
        integration: integration.type,
        pipeline: "files",
        configuration: {
          folderId: "4cd6fbf3-ca22-5d1d-813c-e73156f9b012",
        },
        configurationName: "drive-config",
      }),
    });
    const res = await req.json();
    toast("Sync Triggered");
    mutate(`/api/activity/?objectType=${res.activity[0].objectType}`);
  }

  const pauseSync = async () => {
    const req = await fetch(`${window.location.origin}/api/sync/disable`, {
      method: "POST",
      headers: { 'Content-Type': "application/json" },
      body: JSON.stringify({
        integration: integration.type,
      }),
    });
    req.json().then(() => {
      toast("Sync Disabled");
    });
  }

  const resumeSync = async () => {
    const req = await fetch(`${window.location.origin}/api/sync/reenable`, {
      method: "POST",
      headers: { 'Content-Type': "application/json" },
      body: JSON.stringify({
        integration: integration.type,
      }),
    });
    req.json().then(() => {
      toast("Sync Re-enabled");
    });
  }

  return (
    <div className="w-full mb-2 mr-2 rounded-lg" key={integration.type}>
      <div className="border border-slate-300 dark:border-slate-700 rounded">
        <div className="p-4 flex items-center rounded rounded-br-none rounded-bl-none justify-between 
          hover:bg-gray-100 dark:hover:bg-secondary cursor-pointer"
          onClick={handleClick}>
          <div className="flex items-center">
            <img src={integration.icon} className="w-4 h-4 mr-2" />
            <p className="text-sm font-semibold">{integration.name}</p>
          </div>
          <div className="flex items-center">

            <div
              className={`rounded mr-2 p-1 px-2 inline-flex items-center ${integrationEnabled
                ? "bg-green-400/30 dark:bg-green-400/30"
                : "bg-slate-200/30 dark:bg-slate-400/30"
                }`}
            >
              <div
                className={`rounded-full h-2 w-2 ${integrationEnabled ? "bg-green-500" : "bg-slate-300"
                  } mr-1`}
              />
              <div className={`w-20 flex items-center justify-between text-center text-xs font-semibold ${integrationEnabled ? "text-green-500 dark:text-green-500"
                : "text-slate-500 dark:text-slate-500"
                }`}
              >
                {integrationEnabled ? "Connected" : "Unconnected"}
                {integrationEnabled ? (
                  <div className={expanded ? "text-muted-foreground justify-center items-center rotate-180" : "text-muted-foreground justify-center items-center"} onClick={handleClick}>
                    <ChevronDownIcon size={15} className="text-green-700" />
                  </div>
                ) : null}

              </div>
            </div>
          </div>
        </div>
        {expanded ? (
          <div className="border-slate-300 dark:border-slate-700 border-t p-4 pt-2">
            <div className="flex flex-col space-y-2 items-start">
              <button
                className="w-fit text-sm cursor-pointer space-x-1 flex items-center"
                onClick={() => triggerSync()}
              >
                <ArrowDownToLine size={15} />
                <p className="hover:underline">Trigger Sync</p>
              </button>
              <button
                className="w-fit text-sm cursor-pointer space-x-1 flex items-center"
                onClick={() => pauseSync()}
              >
                <PauseOctagon size={15} />
                <p className="hover:underline">Disable Sync</p>
              </button>
              <button
                className="w-fit text-sm cursor-pointer space-x-1 flex items-center"
                onClick={() => resumeSync()}
              >
                <Play size={15} />
                <p className="hover:underline">Re-enable Sync</p>
              </button>
              <button
                className="w-fit text-sm rounded-md px-2 py-1 border border-slate-300 dark:border-slate-700 cursor-pointer hover:bg-muted"
                onClick={() => onConnect()}
              >
                Configure
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div >
  );
}

export default function IntegrationsSidebar({ session }: { session: { paragonUserToken?: string } }) {
  const { user, paragon, } = useParagon(session.paragonUserToken ?? "");
  const integrations = paragon?.getIntegrationMetadata() ?? [];

  return (
    <div className="pt-3 w-96 ">
      <div className="flex items-center justify-between w-full">
        <h1 className="font-semibold text-sm mt-2 mb-2">Sources</h1>
      </div>
      <div className="flex flex-wrap">
        {user?.authenticated ? (
          integrations
            .sort((a, b) => {
              if (
                user.integrations?.[a.type]?.enabled &&
                !user?.integrations?.[b.type]?.enabled
              ) {
                return -1;
              }
              if (
                user.integrations?.[b.type]?.enabled &&
                !user?.integrations?.[a.type]?.enabled
              ) {
                return 1;
              }
              return a.type < b.type ? -1 : 1;
            })
            .map((integration) => (
              <IntegrationTile
                integration={integration}
                onConnect={() => paragon!.connect(integration.type, {})}
                integrationEnabled={
                  user?.authenticated &&
                  user?.integrations?.[integration.type]?.enabled
                }
                key={integration.type}
              />
            ))
        ) : (
          <LoadingSkeleton />
        )}
      </div>
    </div>
  );
}

export const LoadingSkeleton = () => {
  return Array(5)
    .fill(null)
    .map((_, i) => (
      <div
        className={`w-full mb-2 mr-2 rounded-lg cursor-pointer animate-pulse`}
        key={i}
      >
        <div className="border border-slate-300 dark:border-slate-700 rounded p-4">
          <div className="flex items-center mb-1">
            <div className="inline w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-500 mr-2" />
            <div className="inline rounded-full w-48 h-2 bg-slate-200 dark:bg-slate-500" />
          </div>
        </div>
      </div>
    ));
};

