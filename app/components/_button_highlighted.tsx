import Link from "next/link";

interface ButtonHighlightedProps {
  children: React.ReactNode;
  href?: string; // optional
}

export default function _ButtonHighlighted({
  children,
  href,
}: ButtonHighlightedProps) {
  const ButtonContent = (
    <div className="bg-highlight w-auto px-8 py-2 rounded-xl cursor-pointer hover:scale-110 transition-transform duration-100 ease-in-out">
      <div className="font-bold text-background">{children}</div>
    </div>
  );

  return href ? <Link href={href}>{ButtonContent}</Link> : ButtonContent;
}
