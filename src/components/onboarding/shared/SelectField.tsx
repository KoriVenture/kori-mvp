type Props = {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  required?: boolean;
};

export function SelectField({
  label,
  value,
  options,
  onChange,
  required,
}: Props) {
  return (
    <label className="ko-field">
      <span>{label}</span>
      <span className="ko-select-wrap">
        <select
          value={value}
          required={required}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">Select</option>
          {options.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <img src="/assets/onboarding/shared/chevron-down.svg" alt="" />
      </span>
    </label>
  );
}
