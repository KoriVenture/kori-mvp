import type {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  multiline?: false;
  hint?: string;
};

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  multiline: true;
  hint?: string;
};

export function Field(props: InputProps | TextareaProps) {
  const { label, hint, multiline, ...rest } = props;

  return (
    <label className="ko-field">
      <span>{label}</span>
      {multiline ? (
        <textarea {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)} />
      ) : (
        <input {...(rest as InputHTMLAttributes<HTMLInputElement>)} />
      )}
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}
