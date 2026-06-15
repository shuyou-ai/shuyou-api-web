'use client';

import { cn } from '../../lib/utils';
import Image from 'next/image';
import { useEffect, useState } from 'react';

function getInitial(name?: string | null): string {
  const n = (name || 'U').trim();
  return n.charAt(0).toUpperCase() || 'U';
}

type UserAvatarProps = {
  src?: string | null;
  name?: string | null;
  size?: number;
  className?: string;
};

export default function UserAvatar({
  src,
  name,
  size = 32,
  className,
}: UserAvatarProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const showImage = Boolean(src) && !failed;
  const initial = getInitial(name);

  if (showImage && src) {
    return (
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        className={cn('rounded-full object-cover', className)}
        style={{ width: size, height: size }}
        onError={() => setFailed(true)}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-[#475CFF] font-semibold text-white',
        className
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
      aria-hidden
    >
      {initial}
    </span>
  );
}
