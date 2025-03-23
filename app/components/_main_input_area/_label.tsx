interface LabelProps {
  children: string;
  selected?: boolean;
  onClick: () => void;
}

export default function _Label({ children, selected, onClick }: LabelProps) {
  return (
    <div
      onClick={onClick}
      className={`w-auto p-2 cursor-pointer transition-color duration-150 ease-in-out rounded-t-sm ${
        selected
          ? "bg-highlight text-background"
          : "bg-background hover:bg-soft-highlight text-highlight"
      }`}
    >
      <div className="text-sm select-none font-semibold">{children}</div>
    </div>
  );
}
