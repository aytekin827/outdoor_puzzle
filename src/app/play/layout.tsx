export default function PlayLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-slate-900 min-h-[100dvh] flex items-center justify-center">
      <main className="mobile-app-container">
        {children}
      </main>
    </div>
  );
}
