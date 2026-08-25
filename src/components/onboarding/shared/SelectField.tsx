export function SelectField({ label, name, options, value = "", onChange }: {
  label: string;
  name: string;
  options: string[];
  value?: string;
  onChange?: (value: string) => void;
}) {
  return <label>{label}<span className="select-wrap"><select name={name} required value={value} onChange={(event) => onChange?.(event.target.value)}><option value="" disabled>Select</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select><img src="/assets/onboarding/shared/chevron-down.svg" alt="" /></span></label>;
}
