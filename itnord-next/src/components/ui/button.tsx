import Link from "next/link";
import type { ComponentProps } from "react";

type ButtonVariant = "primary" | "ghost";

type ButtonProps = {
  variant?: ButtonVariant;
  size?: "sm" | "md";
} & ComponentProps<"button">;

type LinkButtonProps = {
  variant?: ButtonVariant;
  size?: "sm" | "md";
  href: string;
} & Omit<ComponentProps<typeof Link>, "href">;

function getClassName(variant: ButtonVariant, size: "sm" | "md") {
  return [
    "btn",
    `btn-${variant}`,
    size === "sm" ? "btn-sm" : "btn-md",
  ].join(" ");
}

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return <button {...props} className={[getClassName(variant, size), className].filter(Boolean).join(" ")} />;
}

export function LinkButton({
  variant = "primary",
  size = "md",
  className,
  href,
  ...props
}: LinkButtonProps) {
  return (
    <Link href={href} {...props} className={[getClassName(variant, size), className].filter(Boolean).join(" ")}>
      {props.children}
    </Link>
  );
}

