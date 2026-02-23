import {
  _Hero,
  _Groups,
  _BestSellers,
  _Reviews,
  _Newsletter,
  _Footer,
} from "@/app/components";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <_Hero />
      <_Groups />
      <_BestSellers />
      <_Reviews />
      <_Newsletter />
    </>
  );
}
