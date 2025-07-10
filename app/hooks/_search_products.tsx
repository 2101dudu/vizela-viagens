export interface SearchProducts {
  DepDate: string | null;
  Country: string | null;
  Location: string | null;
}

export default async function SearchProducts(payload: SearchProducts) {
  const res = await fetch("http://192.168.1.120:8080/api/search/product", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Erro ao procurar viagens");
  }

  return res.json();
}
