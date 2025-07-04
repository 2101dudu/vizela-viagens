export default async function SearchProductsWithTag(tag: string | null): Promise<any> {
  const res = await fetch("http://localhost:8080/api/search/product/tags/" + tag);

  if (!res.ok) {
    throw new Error("Erro ao procurar viagens");
  }

  return res.json();
}
