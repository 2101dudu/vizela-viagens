import { _Button } from "@/app/components";

export default function NavBar() {
  return (
    <>
      <div className="bg-background w-full fixed h-30 z-100">
        <div className="flex items-center justify-between w-2/3 mx-auto h-full">
          <_Button
            href="/"
            imageSrc="/_review/placeholder.svg"
            imageAlt="Next.js logo"
            imageW={50}
            imageH={50}
            imagePrio={true}
          />
          <div className="w-auto flex justify-between items-center gap-5">
            <_Button href="#groups">Grupos</_Button>
            <_Button highlighted>Pedir Orçamento</_Button>
          </div>
        </div>
      </div>
      <div className="bg-highlight w-full fixed top-30 h-1 z-100"></div>
    </>
  );
}
