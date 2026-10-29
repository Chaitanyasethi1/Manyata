export default function TricolourStrip() {
  return (
    <div className="tricolour-strip w-full h-[4px] flex" aria-hidden="true">
      <div className="w-1/3 h-full bg-[#E07B00]" />
      <div className="w-1/3 h-full bg-[#FFFFFF]" />
      <div className="w-1/3 h-full bg-[#138808]" />
    </div>
  )
}
