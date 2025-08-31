
"use client";

import { TourExecutionClient } from "@/components/tours/TourExecutionClient";

export default function TourExecutionPage({ params }: { params: { id: string } }) {
  return (
    <div className="h-[calc(100vh-3.5rem)]">
      <TourExecutionClient tourId={params.id} />
    </div>
  );
}
