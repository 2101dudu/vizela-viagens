export default function ContinentPage({
  params,
}: {
  params: { continent: string };
}) {
  return <h1>Showing countries in {params.continent}</h1>;
}
