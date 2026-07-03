"use client";
// A submit button that asks for confirmation before the form (a delete server
// action) runs — prevents accidental one-click deletes.
export function ConfirmButton({
  children, message, disabled, title, style,
}: {
  children: React.ReactNode;
  message: string;
  disabled?: boolean;
  title?: string;
  style?: React.CSSProperties;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      title={title}
      onClick={(e) => { if (!window.confirm(message)) e.preventDefault(); }}
      style={style}
    >
      {children}
    </button>
  );
}
