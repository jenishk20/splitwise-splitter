"use client";

import { useParams } from "next/navigation";
import { CompletedJobs } from "../completed-jobs";

export default function InvoicesPage() {
  const { id } = useParams();

  return <CompletedJobs groupId={Number(id)} />;
}
