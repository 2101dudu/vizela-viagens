import { _BestSellerCards, _FadeIn } from "@/app/components";
import FetchHighlightedTag from "@/app/hooks/_fetch_highlighted_tag";

export default async function BestSellers() {
  const res = await FetchHighlightedTag(); // on the backend, this value is dynamic
  const tag = res.tag;

  return (
    <div id="groups" className="h-screen flex justify-center my-36">
      <div className="w-4/5 h-full flex flex-col gap-10">
        <_FadeIn>
          <h1 className="font-semibold text-4xl">Best Sellers de {tag.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}</h1>
        </_FadeIn>
        <_BestSellerCards tag={tag.toLowerCase().replace(/\s+/g, '_')} />
      </div>
    </div>
  );
}
