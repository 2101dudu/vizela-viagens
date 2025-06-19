export interface SearchProducts {
  countryCode?: string;
  locationCode?: string;
  fromDate: string; // required
}

export default async function SearchProducts(payload: SearchProducts) {
  const res = await fetch("http://localhost:8080/api/search/product", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Erro ao procurar viagens");
  }

  return res.json(); // whatever structure the API returns
}
