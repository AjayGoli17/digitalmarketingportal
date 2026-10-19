"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { SAMPLE_CLIENTS } from "@/lib/data/clients";
import { ClientWorkspaceView } from "@/components/workspace/ClientWorkspaceView";

export default function WorkspaceDefaultPage() {
  const router = useRouter();
  const [selectedSlug, setSelectedSlug] = React.useState("kanso-botanicals");

  const currentClient =
    SAMPLE_CLIENTS.find((c) => c.slug === selectedSlug) || SAMPLE_CLIENTS[0];

  const handleClientChange = (newSlug: string) => {
    setSelectedSlug(newSlug);
    router.push(`/clients/${newSlug}`);
  };

  return (
    <ClientWorkspaceView
      client={currentClient}
      allClients={SAMPLE_CLIENTS}
      onClientChange={handleClientChange}
    />
  );
}
