"use client";

import { useState } from "react";
import { X, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InfrastructureBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-blue-600 text-white px-4 py-3 relative">
      <div className="flex items-center justify-center gap-3 text-sm font-medium">
        <Wrench className="h-4 w-4 flex-shrink-0" />
        <span className="text-center">
          🔧 We're making infrastructure improvements to enhance your experience. Please bear with us during this time!
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(false)}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-white hover:bg-blue-700"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close banner</span>
        </Button>
      </div>
    </div>
  );
}
