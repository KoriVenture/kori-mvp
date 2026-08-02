type CountryFlagProps = {
  flag: string;
  label: string;
};

export function CountryFlag({ flag, label }: CountryFlagProps) {
  return (
    <span role="img" aria-label={label} className="text-2xl">
      {flag}
    </span>
  );
}
