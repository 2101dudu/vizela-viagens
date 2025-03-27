import _Group, { Group } from "./_group";
import { _FadeIn } from "@/app/components/";

export default function _GroupCards() {
  const groups: Group[] = [
    {
      destination: "Noruega",
      photo: "/_group/norway.jpg",
      departures: [
        {
          when: "Saída em abril",
          desc1: "Cruzeiro XPTO | 2 pessoas",
          desc2: "Partidas de Lisboa",
          price: 999,
          href: "",
        },
        {
          when: "Saída em maio",
          desc1: "Cruzeiro ZYX | 1 pessoa",
          desc2: "Partidas do Porto",
          price: 1499,
          href: "",
        },
      ],
    },
    {
      destination: "Índia",
      photo: "/_group/india.jpg",
      departures: [
        {
          when: "Saída em abril",
          desc1: "Cruzeiro XPTO | 2 pessoas",
          desc2: "Partidas de Lisboa",
          price: 999,
          href: "",
        },
        {
          when: "Saída em maio",
          desc1: "Cruzeiro ZYX | 1 pessoa",
          desc2: "Partidas do Porto",
          price: 1499,
          href: "",
        },
        {
          when: "Saída em junho",
          desc1: "Cruzeiro ZYX | 2 pessoa",
          desc2: "Partidas do Porto",
          price: 1199,
          href: "",
        },
      ],
    },
    {
      destination: "Capadócia",
      photo: "/_group/cappadocia.jpg",
      departures: [
        {
          when: "Saída em abril",
          desc1: "Cruzeiro XPTO | 2 pessoas",
          desc2: "Partidas de Lisboa",
          price: 999,
          href: "",
        },
      ],
    },
  ];

  return (
    <div className="flex justify-between gap-7">
      {groups.map((element, index) => (
        <_FadeIn delay={index * 100} key={index} className="flex-1">
          <_Group group={element} key={index} />
        </_FadeIn>
      ))}
    </div>
  );
}
