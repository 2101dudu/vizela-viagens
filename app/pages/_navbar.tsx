import Image from "next/image";
import { _Button, _ButtonHighlighted } from "@/app/components";

export default function NavBar() {
  return (
    <div className="bg-background w-full fixed h-20 z-100">
      <div className="flex items-center justify-between w-2/3 mx-auto h-full">
        <Image
          src="/next.svg"
          className="bg-foreground"
          alt="Next.js logo"
          width={50}
          height={50}
          priority
        />
        <div className="w-auto flex justify-between items-center gap-5">
          <_Button>Button</_Button>
          <_ButtonHighlighted>Button</_ButtonHighlighted>
        </div>
      </div>
    </div>
  );
}
