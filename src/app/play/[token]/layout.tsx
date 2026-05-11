import { GameBackground } from "./GameBackground";

export default function TokenPlayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <GameBackground />
      {children}
    </>
  );
}
