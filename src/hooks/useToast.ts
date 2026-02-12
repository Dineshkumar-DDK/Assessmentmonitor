import * as React from "react";
import { toast as sonnerToast } from "sonner";

export type ToastVariant =
  | "default"
  | "destructive"
  | "success"
  | "warning"
  | "info";

export interface ToastOptions {
  title: React.ReactNode;
  description?: React.ReactNode;
  duration?: number;
  variant?: ToastVariant;
}

interface ToastReturn {
  id: string | number;
  dismiss: () => void;
  update: (options: Partial<ToastOptions>) => void;
}


function getSonnerToastByVariant(variant?: ToastVariant) {
  switch (variant) {
    case "destructive":
      return sonnerToast.error;
    case "success":
      return sonnerToast.success;
    case "warning":
      return sonnerToast.warning;
    case "info":
      return sonnerToast.info;
    default:
      return sonnerToast;
  }
}

export function toast(options: ToastOptions): ToastReturn {
  const {
    title,
    description,
    duration = 4000,
    variant = "default",
  } = options;

  const toastFn = getSonnerToastByVariant(variant);

  const id = toastFn(title, {
    description,
    duration,
  });

  return {
    id,

    dismiss: () => {
      sonnerToast.dismiss(id);
    },

    update: (updated) => {
      const nextVariant = updated.variant ?? variant;
      const nextToastFn = getSonnerToastByVariant(nextVariant);

      nextToastFn(updated.title ?? title, {
        id, // 👈 reuse ID = update
        description: updated.description ?? description,
        duration: updated.duration ?? duration,
      });
    },
  };
}

export function useToast() {
  return {
    toast,
    dismiss: (toastId?: string | number) =>
      toastId ? sonnerToast.dismiss(toastId) : sonnerToast.dismiss(),
  };
}
