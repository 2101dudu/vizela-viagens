export default function CountryPage({
  params,
}: {
  params: { continent: string; country: string };
}) {
  return (
    <h1>
      Showing cities in {params.country}, {params.continent}
    </h1>
  );
}
