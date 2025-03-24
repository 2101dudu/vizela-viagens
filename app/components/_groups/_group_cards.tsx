import _Group, { Group } from "./_group";

export default function _GroupCards() {
  const groups: Group[] = [
    {
      destination: "Noruega",
      when: "Saída em abril",
      desc1: "Cruzeiro XPTO | 2 pessoas",
      desc2: "Partidas de Lisboa",
      price: 999,
      href: "",
    },
    {
      destination: "Noruega",
      when: "Saída em abril",
      desc1: "Cruzeiro XPTO | 2 pessoas",
      desc2: "Partidas de Lisboa",
      price: 999,
      href: "",
    },
    {
      destination: "Noruega",
      when: "Saída em abril",
      desc1: "Cruzeiro XPTO | 2 pessoas",
      desc2: "Partidas de Lisboa",
      price: 999,
      href: "",
    },
  ];

  return (
    <div className="flex justify-between gap-7">
      {groups.map((element, index) => (
        <_Group entry={element} key={index} />
      ))}
    </div>
  );
}
