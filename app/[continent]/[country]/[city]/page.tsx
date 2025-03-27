export default function CityPage({
  params,
}: {
  params: { continent: string; country: string; city: string };
}) {
  return (
    <h1>
      Details for {params.city} in {params.country}, {params.continent}
    </h1>
  );
}
