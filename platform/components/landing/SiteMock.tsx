/** Pure-CSS miniature website used for showcase cards and the animated demo. */
export function SiteMock({
  colors,
  variant = 0,
  reveal = 99,
  title = "",
}: {
  colors: [string, string];
  variant?: number;
  reveal?: number; // number of blocks visible (for build-up animation)
  title?: string;
}) {
  const [a, b] = colors;
  const show = (i: number) => ({
    opacity: reveal > i ? 1 : 0,
    transform: reveal > i ? "none" : "translateY(8px)",
    transition: "all .5s cubic-bezier(.2,.7,.2,1)",
  });
  const bar = "rounded-full bg-white/80";
  return (
    <div className="h-full w-full overflow-hidden rounded-[inherit] bg-[#fbfaf8] text-left">
      <div style={show(0)} className="flex items-center justify-between px-[6%] py-[4%]">
        <div className="flex items-center gap-[6px]">
          <span className="h-[10px] w-[10px] rounded-[3px]" style={{ background: a }} />
          <span className="text-[9px] font-semibold text-neutral-800 truncate max-w-[90px]">{title}</span>
        </div>
        <div className="flex gap-[6px]">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-[4px] w-[16px] rounded-full bg-neutral-300" />
          ))}
          <span className="h-[8px] w-[22px] rounded-full" style={{ background: a }} />
        </div>
      </div>
      <div
        style={{ ...show(1), background: `linear-gradient(135deg, ${a}, ${b})` }}
        className={`mx-[6%] rounded-[10px] p-[6%] ${variant % 2 ? "grid grid-cols-2 gap-[6%] items-center" : "text-center"}`}
      >
        <div className={variant % 2 ? "" : "flex flex-col items-center"}>
          <span className={`${bar} block h-[7px] w-[70%] mb-[6px]`} />
          <span className={`${bar} block h-[7px] w-[50%] mb-[10px] opacity-80`} />
          <span className="block h-[4px] w-[60%] rounded-full bg-white/50 mb-[4px]" />
          <span className="block h-[4px] w-[45%] rounded-full bg-white/50 mb-[10px]" />
          <span className="inline-block h-[10px] w-[38px] rounded-full bg-white" />
        </div>
        {variant % 2 === 1 && <div className="aspect-[4/3] rounded-[8px] bg-white/25 border border-white/40" />}
      </div>
      <div style={show(2)} className="grid grid-cols-3 gap-[4%] px-[6%] py-[5%]">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-[8px] bg-white p-[10%] shadow-[0_2px_8px_rgba(0,0,0,.06)]">
            <span className="mb-[8px] block h-[12px] w-[12px] rounded-[4px]" style={{ background: i === 1 ? b : a, opacity: 0.85 }} />
            <span className="mb-[4px] block h-[4px] w-[80%] rounded-full bg-neutral-300" />
            <span className="block h-[4px] w-[55%] rounded-full bg-neutral-200" />
          </div>
        ))}
      </div>
      <div style={show(3)} className="mx-[6%] flex items-center gap-[4%] rounded-[8px] bg-neutral-900 p-[4%]">
        <span className="h-[18px] w-[18px] rounded-full" style={{ background: b }} />
        <div className="flex-1">
          <span className="mb-[4px] block h-[4px] w-[60%] rounded-full bg-white/60" />
          <span className="block h-[4px] w-[40%] rounded-full bg-white/30" />
        </div>
        <span className="h-[10px] w-[34px] rounded-full" style={{ background: a }} />
      </div>
    </div>
  );
}
