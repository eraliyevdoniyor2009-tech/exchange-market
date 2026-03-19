// src/components/shared/UserAvatar.tsx
import Image from "next/image";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name: string;
  image?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZE_MAP = {
  xs: { container: "w-6 h-6",  text: "text-[10px]", img: 24  },
  sm: { container: "w-8 h-8",  text: "text-xs",     img: 32  },
  md: { container: "w-10 h-10", text: "text-sm",    img: 40  },
  lg: { container: "w-14 h-14", text: "text-lg",    img: 56  },
  xl: { container: "w-20 h-20", text: "text-2xl",   img: 80  },
};

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

// Generate a stable pastel color from name
function getAvatarColor(name: string): string {
  const colors = [
    "bg-blue-100 text-blue-700",
    "bg-green-100 text-green-700",
    "bg-purple-100 text-purple-700",
    "bg-orange-100 text-orange-700",
    "bg-pink-100 text-pink-700",
    "bg-teal-100 text-teal-700",
    "bg-indigo-100 text-indigo-700",
    "bg-yellow-100 text-yellow-700",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function UserAvatar({ name, image, size = "md", className }: UserAvatarProps) {
  const { container, text, img } = SIZE_MAP[size];
  const initials = getInitials(name);
  const colorClass = getAvatarColor(name);

  return (
    <div
      className={cn(
        "rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 font-semibold ring-2 ring-white",
        container,
        !image && colorClass,
        className
      )}
    >
      {image ? (
        <Image
          src={image}
          alt={name}
          width={img}
          height={img}
          className="object-cover w-full h-full"
        />
      ) : (
        <span className={cn("select-none leading-none", text)}>{initials}</span>
      )}
    </div>
  );
}
