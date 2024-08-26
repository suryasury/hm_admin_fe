// useErrorHandler.ts
import { toast } from "sonner";

const useErrorHandler = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleError = (error: any, customMessage?: string) => {
    console.error(customMessage, error);

    if (error.response && error.response.status !== 401) {
      const message =
        error.response.status === 500
          ? "Our servers are facing technical issues. Please try again later."
          : error.response.data.message;
      toast.error(customMessage, {
        description: message || "Something went wrong. Please try again later.",
      });
    } else{
      toast.error("Something went wrong. Please try again later.");
    }
  };

  return handleError;
};

export default useErrorHandler;
