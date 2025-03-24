import { _ReviewCards } from "@/app/components";

export default function Reviews() {
  return (
    <div className="bg-highlight h-screen flex justify-center py-20">
      <div className="w-2/3 h-full flex flex-col gap-10">
        <h1 className="font-semibold text-2xl text-background">
          Comentários dos nossos clientes
        </h1>
        <_ReviewCards />
      </div>
    </div>
  );
}
