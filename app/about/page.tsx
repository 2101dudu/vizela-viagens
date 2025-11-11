import Image from "next/image";

export default function About() {
  return (
    <div className="relative w-full min-h-screen">
      <Image
        src="/fallback.png" // Replace with your image path
        alt="Foto de fundo"
        fill
        className="object-cover z-0"
        priority
      />
      <div className="relative z-10 flex flex-col items-center justify-center text-white bg-black/60 min-h-screen">
        <div className="w-4/5 flex flex-col items-left justify-center">      
            <h1 className="w-2/5 pt-10 text-2xl font-semibold">Quem Somos</h1>
            <div className="w-2/5 py-10 text-lg flex flex-col gap-4 text-justify">
                <p>
                Inaugurada em Julho de 2010, e depois de 3 anos ligados a uma Marca Internacional de Agências de Viagens, onde crescemos em termos profissionais, em 2013 resolvemos apostar num projeto independente. Dessa decisão nasceu a Vizela Viagens.
                </p>
                <p>
                Alicerçada numa experiência acumulada ao longo de mais de 20 anos no turismo, a equipa da Vizela Viagens mantem os elevados padrões de qualidade no atendimento, acompanhamento e serviço pós-venda, que habituou os seus clientes. Somos acima de tudo Consultores de Viagens e trabalhamos todos os dias para proporcionar ao nosso cliente as melhores ofertas, sem descurar a qualidade.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}
