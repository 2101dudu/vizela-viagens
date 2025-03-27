"use client";

import Image from "next/image";
import Link from "next/link";

interface ButtonProps {
  children?: React.ReactNode;
  href?: string;
  highlighted?: boolean;
  imageSrc?: string;
  imageAlt?: string;
  imageW?: string;
  imageH?: string;
  imagePrio?: boolean;
}

export default function _Button({
  children,
  href,
  highlighted = false,
  imageSrc,
  imageAlt = "Button image",
  imageW = 24,
  imageH = 24,
  imagePrio = false,
}: ButtonProps) {
  const baseStyles =
    "w-auto px-8 py-2 cursor-pointer hover:scale-105 transition-transform duration-100 ease-in-out flex items-center justify-center";

  const highlightStyles = highlighted
    ? "bg-highlight text-background rounded-xl"
    : "";

  const handleClick = (e: React.MouseEvent) => {
    if (href?.startsWith("#")) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const yOffset = -150;
        const y = target.getBoundingClientRect().top + window.scrollY + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }
  };

  const content = (
    <div className={`${baseStyles} ${highlightStyles}`} onClick={handleClick}>
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt={imageAlt}
          width={imageH}
          height={imageW}
          priority={imagePrio}
        />
      ) : (
        <div className="font-bold text-xl">{children}</div>
      )}
    </div>
  );

  return href?.startsWith("#") ? (
    <a href={href} onClick={handleClick}>
      {content}
    </a>
  ) : (
    <Link href={href ?? "#"}>{content}</Link>
  );
}
