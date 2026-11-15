// One cell of the landing page features card. On tablet (2 columns) the left
// column gets a faint divider on its right.
function FeatureItem({ icon, bg, title, desc }) {
    return (<div className="flex flex-col items-start gap-2.5 px-[42px] py-2.5 max-[900px]:p-5 max-[900px]:odd:border-r max-[900px]:odd:border-r-[#f0f0f0] max-[640px]:items-center max-[640px]:text-center max-[640px]:odd:border-r-0">
      <div className="flex size-[98px] items-center justify-center rounded-[22px] [&>img]:size-[62px] [&>img]:object-contain [&>svg]:size-[62px]" style={{ background: bg }}>{icon}</div>
      <strong className="text-[25px] font-bold text-[#111827]">{title}</strong>
      <p className="max-w-[260px] text-[17px] leading-normal text-[#333]">{desc}</p>
    </div>);
}
export default FeatureItem;
