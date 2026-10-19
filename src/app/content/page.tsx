"use client";

import * as React from "react";
import { useViewMode } from "@/components/context/ViewModeContext";
import { ContentCalendarView } from "@/components/content/ContentCalendarView";
import { ClientGalleryView } from "@/components/client/ClientGalleryView";

export default function ContentPage() {
  const { isClientView, selectedClient } = useViewMode();

  if (isClientView) {
    return <ClientGalleryView clientName={selectedClient} />;
  }

  return <ContentCalendarView />;
}
