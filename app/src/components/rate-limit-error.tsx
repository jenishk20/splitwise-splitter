import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

interface RateLimitErrorProps {
  message?: string;
}

export function RateLimitError({ message }: RateLimitErrorProps) {
  const queryClient = useQueryClient();

  const handleRetry = () => {
    // Invalidate all queries to trigger a refresh
    queryClient.invalidateQueries();
  };

  return (
    <Alert variant="destructive" className="animate-fade-in">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Rate Limit Exceeded</AlertTitle>
      <AlertDescription className="mt-2 flex flex-col gap-2">
        <p>
          {message ||
            "You've made too many requests. Please wait a moment before trying again."}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={handleRetry}
        >
          Try Again
        </Button>
      </AlertDescription>
    </Alert>
  );
}
