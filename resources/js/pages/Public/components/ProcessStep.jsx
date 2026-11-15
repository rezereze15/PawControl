// One step in the landing page "How it Works" row.
function ProcessStep({ n, icon, bg, label, desc }) {
    return (<div className="flex w-[190px] flex-col items-center gap-2.5 text-center max-[900px]:w-[150px]">
      <div className="relative flex size-28 items-center justify-center rounded-full shadow-[0_0_0_6px_#fff,0_10px_24px_-10px_rgb(25_4_63/0.25)] [&>img]:size-[62px] [&>img]:object-contain [&>svg]:size-[62px]" style={{ background: bg }}>{icon}</div>
      <div className="mt-1 flex size-[38px] items-center justify-center rounded-full bg-[#45199a] text-[20px] font-bold text-white">{n}</div>
      <strong className="text-[22px] leading-[1.3] font-bold text-[#111827]">{label}</strong>
      <p className="text-[16px] leading-normal text-[#222]">{desc}</p>
    </div>);
}
export default ProcessStep;
