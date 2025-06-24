export default async function FetchMoreProducts(token: string, cursor: number, limit: number = 24) {
  const url = new URL("http://localhost:8080/api/search/product/page");
  url.searchParams.set("token", token);
  url.searchParams.set("cursor", cursor.toString());
  url.searchParams.set("limit", limit.toString());

  const res = await fetch(url.toString(), {
    method: "GET",
  });

  if (!res.ok) throw new Error("Failed to fetch more products");

  const data = await res.json();
  return data.products;
}
