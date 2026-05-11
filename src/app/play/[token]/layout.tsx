import { GameBackground } from "./GameBackground";

export default function TokenPlayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative h-full w-full flex flex-col overflow-hidden">
      <GameBackground />
      <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
