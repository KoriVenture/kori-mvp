export function Choice({
  title,
  description,
  selected,
  onClick,
  badge,
  icon,
  disabled = false,
}: {
  title: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
  badge?: string;
  icon?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className={`ko-choice ${selected ? "is-selected" : ""}`}
      aria-pressed={selected}
      aria-disabled={disabled}
      onClick={() => { if (!disabled) onClick(); }}
    >
      {icon ? (
        <span className="ko-choice__icon"><img src={icon} alt="" /></span>
      ) : null}
      <span className="ko-choice__body">
        <span className="ko-choice__title-row">
          <strong>{title}</strong>
          {badge ? <em>{badge}</em> : null}
        </span>
        {description ? <small>{description}</small> : null}
      </span>
      <span className="ko-choice__radio" aria-hidden="true" />
    </button>
  );
}
