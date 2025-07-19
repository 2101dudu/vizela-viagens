"use client";

import { _Button } from "@/app/components";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleOptionClick = (option: string) => {
    setIsOpen(false);
    const formattedOption = option.toLowerCase().replace(/\s+/g, '_');
    router.push(`/products?tag=${formattedOption}`);
  };

  return (
    <>
      <div className="bg-background w-full fixed h-20 z-50">
        <div className="flex items-center justify-between w-4/5 mx-auto h-full">
          <div className="flex justify-between items-center gap-5">
            <_Button
              href="/"
              imageSrc="/logo_square.svg"
              imageAlt="VizelaViagens logo"
              imageW={50}
              imageH={50}
              imagePrio={true}
            />
            {/* Dropdown Button */}
            <div className="relative" ref={dropdownRef}
              onMouseEnter={() => setIsOpen(true)}
              onMouseLeave={() => setIsOpen(false)}
            >
              <div
                className="font-semibold text-xl px-8 py-2 hover:scale-105 transition-transform duration-100 flex items-center"
              >
                Destinos
                <svg
                  className={`ml-2 w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>

              {/* Dropdown Menu */}
              {isOpen && (
                <div className="absolute right-0 pt-2 w-48 bg-background rounded-md shadow-lg z-50">
                  <div className="py-1">
                    {['Fim de Ano', 'Charter', 'Praia', 'City Break'].map((option) => (
                      <button
                        key={option}
                        onClick={() => handleOptionClick(option)}
                        className="block w-full text-left px-4 py-2 text-foreground hover:bg-gray-100"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              </div>
            </div>
            <div className="w-auto flex justify-between items-center gap-5">
              <_Button href="#groups">Grupos</_Button>
              <_Button highlighted>Pedir Orçamento</_Button>
            </div>
          </div>
        </div>
      <div className="bg-highlight w-full fixed top-20 h-1 z-40"></div>
    </>
  );
}
