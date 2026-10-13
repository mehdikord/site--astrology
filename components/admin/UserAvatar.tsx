export default function UserAvatar({ name, src, size = "h-9 w-9 text-sm" }: { name?: string | null; src?: string | null; size?: string }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className={`${size} shrink-0 rounded-full object-cover ring-1 ring-white/10`} />;
  }
  return (
    <span className={`${size} grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-night-600 to-night-700 font-bold text-gold-300 ring-1 ring-white/10`}>
      {name?.trim().charAt(0) || "؟"}
    </span>
  );
}
