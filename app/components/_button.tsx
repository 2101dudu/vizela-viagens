export default function _Button({ children }: string) {
  return (
    <div className="w-auto px-8 py-2 cursor-pointer hover:scale-110 transition-transform duration-100 ease-in-out">
      <div className="font-bold">{children}</div>
    </div>
  );
}
