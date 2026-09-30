import Reveal from "./Reveal";

const isFa = (t: string) => /[\u0600-\u06FF]/.test(t);

export default function SectionHeader({
  eyebrow,
  title,
  desc,
  align = "center",
  className = "",
}: {
  eyebrow?: string;
  title: string;
  desc?: string;
  align?: "center" | "start";
  className?: string;
}) {
  return (
    <Reveal className={`${align === "center" ? "mx-auto text-center" : "text-start"} max-w-2xl ${className}`}>
      {eyebrow && <span className={`eyebrow ${isFa(eyebrow) ? "eyebrow-fa" : ""} ${align === "center" ? "justify-center" : ""}`}>{eyebrow}</span>}
      <h2 className="mt-4 text-3xl leading-tight text-cream sm:text-4xl lg:text-[2.6rem]">{title}</h2>
      {desc && <p className="mt-4 leading-8 text-muted">{desc}</p>}
    </Reveal>
  );
}
