import { useToastStore } from "../stores/toastStore";

export const useToast = () => {
  const addToast = useToastStore((state) => state.addToast);

  return {
    showToast: (options: {
      message: string;
      title?: string;
      type?: "success" | "error" | "info" | "warning";
      duration?: number;
      onClose?: () => void;
    }) => addToast(options),
  };
};
