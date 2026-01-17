"use client";

import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function GroupPage() {
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    // Redirect to home route by default
    router.replace(`/dashboard/group/${id}/home`);
  }, [id, router]);

  return null;
}