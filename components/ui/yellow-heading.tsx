import type { ReactNode } from "react";

type YellowHeadingProps = {
  children: ReactNode;
  as?: "h1" | "h2";
  className?: string;
};

export function YellowHeading({
  children,
  as: Heading = "h1",
  className = "",
}: YellowHeadingProps) {
  return (
    <Heading
      data-yellow-heading
      className={`yellow-heading inline-block text-[#0d1117] ${className}`}
    >
      <span className="box-decoration-clone bg-[#f6c453] px-2 py-1">
        {children}
      </span>
    </Heading>
  );
}
