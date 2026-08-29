export function Chips({
  options,
  selected,
  onChange,
  tone = "teal",
  showStateIcon = true,
}: {
  options: string[];
  selected: string[];
  onChange: (value: string[]) => void;
  tone?: "teal" | "coral";
  showStateIcon?: boolean;
}) {
  function toggle(option: string) {
    onChange(
      selected.includes(option)
        ? selected.filter((item) => item !== option)
        : [...selected, option],
    );
  }

  return (
    <div className={`ko-chips ko-chips--${tone}`}>
      {options.map((option) => {
        const active = selected.includes(option);
        return (
          <button
            type="button"
            key={option}
            className={active ? "is-selected" : ""}
            aria-pressed={active}
            onClick={() => toggle(option)}
          >
            <span>{option}</span>
            {showStateIcon ? (
              <img
                aria-hidden="true"
                alt=""
                src={
                  active
                    ? "/assets/onboarding/shared/x-white.svg"
                    : "/assets/onboarding/shared/plus.svg"
                }
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
