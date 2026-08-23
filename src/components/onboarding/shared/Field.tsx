import type{InputHTMLAttributes}from"react";
export function Field({label,multiline=false,...props}:{label:string;multiline?:boolean}&InputHTMLAttributes<HTMLInputElement>){return <label>{label}{multiline?<textarea name={props.name} defaultValue={String(props.defaultValue??"")} required={props.required} onChange={props.onChange as never}/>:<input {...props}/>}</label>}
