import Image from "next/image";
import Link from "next/link";

interface EditorialRowProps {
  eyebrow: string;
  headline: string;
  body: string;
  cta: string;
  href: string;
  imageUrl: string;
  imageLeft: boolean;
  bgColor: string;
}

export default function EditorialRow({
  eyebrow,
  headline,
  body,
  cta,
  href,
  imageUrl,
  imageLeft,
  bgColor,
}: EditorialRowProps) {
  const image = (
    <div className="relative w-full md:w-1/2 aspect-[4/5] sm:aspect-[3/4] md:aspect-auto md:min-h-[480px] overflow-hidden">
      <Image
        src={imageUrl}
        alt={headline}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </div>
  );

  const text = (
    <div className="w-full md:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-12 md:py-0">
      <p className="text-[10px] tracking-[0.25em] uppercase text-nordstrom-gray-500 mb-3">{eyebrow}</p>
      <h2 className="text-2xl sm:text-3xl font-light leading-tight text-nordstrom-black mb-4 whitespace-pre-line">
        {headline}
      </h2>
      <p className="text-sm text-nordstrom-gray-700 leading-relaxed mb-6 max-w-xs">{body}</p>
      <Link
        href={href}
        className="self-start text-[11px] tracking-widest uppercase border-b border-nordstrom-black pb-0.5 hover:text-nordstrom-gray-500 hover:border-nordstrom-gray-500 transition-colors"
      >
        {cta}
      </Link>
    </div>
  );

  return (
    <section style={{ backgroundColor: bgColor }}>
      <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row">
        {imageLeft ? (
          <>{image}{text}</>
        ) : (
          <>{text}{image}</>
        )}
      </div>
    </section>
  );
}
