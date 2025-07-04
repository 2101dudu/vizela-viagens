export interface Data {
  tag: string;
}

export default async function FetchHighlightedTag() {
  const res = await fetch("http://localhost:8080/api/page/highlighted/tag");

  if (!res.ok) {
    throw new Error("Erro ao procurar viagens");
  }

  return res.json();
}
