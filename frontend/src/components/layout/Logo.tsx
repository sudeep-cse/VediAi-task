import Image from 'next/image';
import { cn } from '@/lib/utils';

export function Logo({
  className,
  withWordmark = true,
}: {
  className?: string;
  withWordmark?: boolean;
}) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Logo Icon */}
      <div className="relative h-10 w-10">
        {/* Background */}
        <Image
          src="/Vector.svg"
          alt=""
          fill
          className="object-contain"
          priority
        />

        {/* V Logo */}
        <Image
  src="/Group.svg"
  alt="VedaAI"
  width={50}
  height={50}
  className="absolute left-1/2 top-[60%] -translate-x-1/2 -translate-y-1/2"
  priority
/>
      </div>

      {/* Text */}
      {withWordmark && (
        <span className="text-[28px] font-extrabold tracking-tight text-[#2D2D2D]">
          VedaAI
        </span>
      )}
    </div>
  );
}