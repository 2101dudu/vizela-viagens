import { API_BASE_URL } from "@/app/config";

export interface Data {
  tag: string;
}

export default async function FetchHighlightedTag() {
  const res = await fetch(`${API_BASE_URL}/page/highlighted/tag`);

  if (!res.ok) {
    throw new Error("Erro ao procurar viagens");
  }

  return res.json();
}
