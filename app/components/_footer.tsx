import Link from "next/dist/client/link";

export default function Footer() {
  return (
    <div className="bg-foreground w-full bottom-0 h-auto z-50 py-10">
      <div className="text-background flex items-start justify-between w-4/5 mx-auto h-full">
        <div className="flex-1 h-full">
          <h1 className="text-xl pb-2 font-bold">Contactos</h1>
          <h1 className="text-sm"><b>E-mail:</b> geral@vizelaviagens.com</h1>
          <h1 className="text-sm"><b>Telefone Móvel:</b> +351918739685 (Chamada rede móvel Nacional)</h1>
          <h1 className="text-sm"><b>Telefone Fixo:</b> +351253581008 (Chamada rede fixa Nacional)</h1>
          <h1 className="text-sm"><b>Morada:</b> Av. Manuel da Costa Campelos, 348, 4815-378 Vizela - Portugal</h1>
        </div>
        <div className="flex-1 h-full">
          <h1 className="text-xl pb-2 font-bold">Horário</h1>
          <h1 className="text-sm"><b>Segunda a Sexta:</b> das 09h30 às 13h00 e das 15h00m às 19h00</h1>
          <h1 className="text-sm"><b>Sábados:</b> das 09h00 às 13h00</h1>
          <h1 className="text-sm"><b>Domingos:</b> Encerrados</h1>
        </div>
        <div className="flex flex-col">
          <Link href="/about" className="hover:underline hover:cursor-pointer">Quem Somos</Link>
          <Link href="/terms" className="hover:underline hover:cursor-pointer">Condições Gerais</Link>
          <Link href="/cookies" className="hover:underline hover:cursor-pointer">Política de Cookies</Link>
          <Link href="/privacy" className="hover:underline hover:cursor-pointer">Política de Privacidade</Link>
        </div>
      </div>
    </div>
  );
}
