"use client";

import { Button } from "@kori/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@kori/ui/components/dialog";
import { Input } from "@kori/ui/components/input";
import { Label } from "@kori/ui/components/label";
import { Textarea } from "@kori/ui/components/textarea";
import { CheckCircle2, FileUp } from "lucide-react";
import { useId, useState, type FormEvent } from "react";

type CommonDemoLabels = {
  cancel: string;
  close: string;
  demoNotice: string;
  submit: string;
  success: string;
};

type DemoActionDialogProps = CommonDemoLabels & {
  fieldLabel: string;
  fieldPlaceholder?: string;
  title: string;
  trigger: string;
  variant?: "default" | "outline";
};

export function DemoActionDialog({
  cancel,
  demoNotice,
  fieldLabel,
  fieldPlaceholder,
  submit,
  success,
  title,
  trigger,
  variant = "default",
}: DemoActionDialogProps) {
  const fieldId = useId();
  const [value, setValue] = useState("");
  const [saved, setSaved] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!value.trim()) return;
    setSaved(true);
  }

  return (
    <Dialog>
      <DialogTrigger render={<Button type="button" variant={variant} />}>
        {trigger}
      </DialogTrigger>
      <DialogContent className="rounded-md border border-border bg-secondary p-6 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{title}</DialogTitle>
          <DialogDescription>{demoNotice}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor={fieldId}>{fieldLabel}</Label>
            <Input
              id={fieldId}
              value={value}
              placeholder={fieldPlaceholder}
              onChange={(event) => {
                setValue(event.currentTarget.value);
                setSaved(false);
              }}
              className="h-10 rounded-[2px]"
            />
          </div>
          {saved ? (
            <div
              role="status"
              className="flex items-start gap-2 border border-success/30 bg-success/10 p-3 text-sm text-success"
            >
              <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4" />
              <span>{success}</span>
            </div>
          ) : null}
          <DialogFooter className="mx-0 mb-0 rounded-none border-border bg-transparent px-0 pb-0">
            <DialogClose render={<Button type="button" variant="ghost" />}>
              {cancel}
            </DialogClose>
            <Button type="submit" disabled={!value.trim()}>
              {submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type InvestmentDialogProps = CommonDemoLabels & {
  agreement: string;
  amountLabel: string;
  closedLabel: string;
  dealName: string;
  open: boolean;
  trigger: string;
};

export function InvestmentDialog({
  agreement,
  amountLabel,
  cancel,
  closedLabel,
  dealName,
  demoNotice,
  open,
  submit,
  success,
  trigger,
}: InvestmentDialogProps) {
  const amountId = useId();
  const agreementId = useId();
  const [amount, setAmount] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!open) {
    return (
      <Button type="button" variant="secondary" disabled>
        {closedLabel}
      </Button>
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!amount.trim() || !agreed) return;
    setSaved(true);
  }

  return (
    <Dialog>
      <DialogTrigger render={<Button type="button" />}>{trigger}</DialogTrigger>
      <DialogContent className="rounded-md border border-border bg-secondary p-6 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{dealName}</DialogTitle>
          <DialogDescription>{demoNotice}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor={amountId}>{amountLabel}</Label>
            <Input
              id={amountId}
              inputMode="numeric"
              value={amount}
              onChange={(event) => {
                setAmount(event.currentTarget.value);
                setSaved(false);
              }}
              className="h-10 rounded-[2px]"
            />
          </div>
          <Label
            htmlFor={agreementId}
            className="items-start border border-border p-3 leading-relaxed"
          >
            <input
              id={agreementId}
              type="checkbox"
              checked={agreed}
              onChange={(event) => {
                setAgreed(event.currentTarget.checked);
                setSaved(false);
              }}
              className="mt-0.5 size-4 accent-primary"
            />
            <span>{agreement}</span>
          </Label>
          {saved ? (
            <p role="status" className="text-sm text-success">
              {success}
            </p>
          ) : null}
          <DialogFooter className="mx-0 mb-0 rounded-none border-border bg-transparent px-0 pb-0">
            <DialogClose render={<Button type="button" variant="ghost" />}>
              {cancel}
            </DialogClose>
            <Button type="submit" disabled={!amount.trim() || !agreed}>
              {submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type EvidenceDialogProps = CommonDemoLabels & {
  fileLabel: string;
  notesLabel: string;
  title: string;
  trigger: string;
};

export function EvidenceDialog({
  cancel,
  demoNotice,
  fileLabel,
  notesLabel,
  submit,
  success,
  title,
  trigger,
}: EvidenceDialogProps) {
  const fileId = useId();
  const notesId = useId();
  const [fileName, setFileName] = useState("");
  const [saved, setSaved] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!fileName) return;
    setSaved(true);
  }

  return (
    <Dialog>
      <DialogTrigger render={<Button type="button" />}>
        <FileUp aria-hidden="true" />
        {trigger}
      </DialogTrigger>
      <DialogContent className="rounded-md border border-border bg-secondary p-6 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{title}</DialogTitle>
          <DialogDescription>{demoNotice}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor={notesId}>{notesLabel}</Label>
            <Textarea id={notesId} className="rounded-[2px]" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={fileId}>{fileLabel}</Label>
            <Input
              id={fileId}
              type="file"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              onChange={(event) => {
                setFileName(event.currentTarget.files?.[0]?.name ?? "");
                setSaved(false);
              }}
              className="h-auto rounded-[2px] py-2"
            />
            {fileName ? (
              <p className="font-data text-xs text-success">{fileName}</p>
            ) : null}
          </div>
          {saved ? (
            <p role="status" className="text-sm text-success">
              {success}
            </p>
          ) : null}
          <DialogFooter className="mx-0 mb-0 rounded-none border-border bg-transparent px-0 pb-0">
            <DialogClose render={<Button type="button" variant="ghost" />}>
              {cancel}
            </DialogClose>
            <Button type="submit" disabled={!fileName}>
              {submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
