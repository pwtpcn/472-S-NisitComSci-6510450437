export default function Header({ data }: { data: string }) {
  return (
    <div className="bg-white p-4 mb-4 rounded-2xl text-center w-full">
      <h1 className="text-[#0f1d2a] font-bold text-2xl">{data}</h1>
    </div>
  );
}
