import { Snackbar, Alert } from "@mui/material";
import { useToastStore } from "../stores/toastStore";

export const ToastProvider = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <>
      {toasts.map((toast) => (
        <Snackbar
          key={toast.id}
          open
          autoHideDuration={toast.duration ?? 3000}
          onClose={() => {
            toast.onClose?.();
            removeToast(toast.id);
          }}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={() => {
              toast.onClose?.();
              removeToast(toast.id);
            }}
            severity={toast.type ?? "info"}
            sx={{ width: "100%" }}
          >
            {toast.title && <strong>{toast.title}</strong>}
            <div>{toast.message}</div>
          </Alert>
        </Snackbar>
      ))}
    </>
  );
};
