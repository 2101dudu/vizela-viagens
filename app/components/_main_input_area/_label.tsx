interface LabelProps {
  children: string;
  selected?: boolean;
  onClick: () => void;
}

export default function _Label({ children, selected, onClick }: LabelProps) {
  return (
    <div
      onClick={onClick}
      className={`w-auto p-4 cursor-pointer opacity-95 transition-color duration-150 ease-in-out rounded-t-sm ${
        selected
          ? "bg-highlight text-background"
          : "bg-background hover:bg-softBackground text-highlight"
      }`}
    >
      <div className="text-xl select-none">{children}</div>
    </div>
  );
}
