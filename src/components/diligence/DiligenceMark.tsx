export function DiligenceMark({ children }: { children: React.ReactNode }) {
  return (
    <span className={`dd-mark ${String(children).toLowerCase().replaceAll(" ", "-")}`}>
      {children}
    </span>
  );
}
