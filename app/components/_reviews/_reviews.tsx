import { _ReviewCards, _FadeIn } from "@/app/components";

export default function Reviews() {
  return (
    <div className="bg-gradient-to-bl from-highlight to-softhighlight h-screen flex justify-center py-20">
      <div className="w-4/5 h-full flex flex-col gap-10">
        <_FadeIn>
          <h1 className="font-semibold text-4xl text-background">
            Comentários dos nossos clientes
          </h1>
        </_FadeIn>
        <_ReviewCards />
      </div>
    </div>
  );
}
