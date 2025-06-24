"use client";

import Image from "next/image";
import Link from "next/link";

interface ButtonProps {
  children?: React.ReactNode;
  href?: string;
  highlighted?: boolean;
  disabled?: boolean;
  imageSrc?: string;
  imageAlt?: string;
  imageW?: number;
  imageH?: number;
  imagePrio?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export default function _Button({
  children,
  href,
  disabled = false,
  highlighted = false,
  imageSrc,
  imageAlt = "Button image",
  imageW = 24,
  imageH = 24,
  imagePrio = false,
  onClick,
}: ButtonProps) {
  const baseStyles =
    "w-auto px-8 py-2 hover:scale-105 transition-transform duration-100 ease-in-out flex items-center justify-center";

  const disabledStyles = disabled
    ? "opacity-50 cursor-not-allowed"
    : "";

  const highlightStyles = highlighted
    ? "bg-highlight text-background rounded-xl"
    : "";

  const content = imageSrc ? (
    <Image
      src={imageSrc}
      alt={imageAlt}
      width={imageW}
      height={imageH}
      priority={imagePrio}
    />
  ) : (
    <div className="font-semibold text-xl">{children}</div>
  );

  // If href is provided and starts with # (anchor), render <a> with smooth scroll
  if (href?.startsWith("#")) {
    const handleAnchorClick = (e: React.MouseEvent) => {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const yOffset = -150;
        const y = target.getBoundingClientRect().top + window.scrollY + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    };
    return (
      <a
        href={href}
        onClick={handleAnchorClick}
        className={`${baseStyles} ${highlightStyles} ${disabledStyles}`}
        style={disabled ? { pointerEvents: "none" } : {}}
      >
        {content}
      </a>
    );
  }

  // If href is provided but not an anchor, render Next.js Link
  if (href) {
    return (
      <Link
        href={href}
        className={`${baseStyles} ${highlightStyles} ${disabledStyles}`}
        style={disabled ? { pointerEvents: "none" } : {}}
      >
        {content}
      </Link>
    );
  }

  // Else render a real button for clicks
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseStyles} ${highlightStyles} ${disabledStyles}`}
      disabled={disabled}
    >
      {content}
    </button>
  );
}
