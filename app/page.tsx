import {
  _Hero,
  _Groups,
  _BestSellers,
  _Reviews,
  _Newsletter,
  _Footer,
} from "@/app/pages";
<_Newsletter />;

export default function Home() {
  return (
    <>
      <_Hero />
      <_BestSellers />
      <_Reviews />
      <_Newsletter />
      <_Footer />
    </>
  );
}
