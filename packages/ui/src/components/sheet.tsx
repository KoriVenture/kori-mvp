"use client";

import type { ComponentProps } from "react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@kori/ui/components/dialog";
import { cn } from "@kori/ui/lib/utils";

const Sheet = Dialog;
const SheetTrigger = DialogTrigger;
const SheetClose = DialogClose;
const SheetHeader = DialogHeader;
const SheetTitle = DialogTitle;
const SheetDescription = DialogDescription;

type SheetContentProps = ComponentProps<typeof DialogContent> & {
  side?: "left" | "right";
};

function SheetContent({
  className,
  side = "right",
  ...props
}: SheetContentProps) {
  return (
    <DialogContent
      className={cn(
        "top-0 h-dvh max-w-[19rem] translate-y-0 rounded-none border-y-0 p-0 sm:max-w-[19rem]",
        side === "left"
          ? "left-0 translate-x-0 border-l-0"
          : "right-0 left-auto translate-x-0 border-r-0",
        className,
      )}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
};
