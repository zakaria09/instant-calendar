export default function Spinner({ size = 'w-12 h-12 ' }: { size?: string }) {
  return (
    <div className={`${size} border-6 border-[#6B4C3B]/20 border-t-[#6B4C3B] rounded-full animate-spin`} />
  );
}