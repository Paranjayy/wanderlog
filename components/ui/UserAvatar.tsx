import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

interface UserAvatarProps {
  user: {
    displayName: string;
    avatar: string;
  };
  size?: "sm" | "md" | "lg";
}

export function UserAvatar({ user, size = "md" }: UserAvatarProps) {
  const sizeClasses = {
    sm: "h-6 w-6 text-xs",
    md: "h-8 w-8 text-sm",
    lg: "h-12 w-12 text-lg",
  };

  const initials = user.displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Avatar className={`${sizeClasses[size]} rounded-full`}>
      <AvatarImage src={user.avatar} alt={user.displayName} />
      <AvatarFallback className="bg-emerald-100 text-emerald-700">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
