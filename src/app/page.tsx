import { MapPin, QrCode } from "lucide-react";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-1000">
      <div className="glass-panel p-10 w-full max-w-sm flex flex-col items-center border border-primary/20 shadow-[0_0_50px_rgba(59,130,246,0.15)]">
        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-8 rotate-12">
          <QrCode className="w-10 h-10 text-primary -rotate-12" />
        </div>
        
        <h2 className="text-primary font-bold tracking-[0.2em] text-xs mb-3 uppercase">Outdoor Intelligence</h2>
        <h1 className="text-4xl font-black text-white leading-tight mb-4 italic tracking-tighter">
          PROJECT<br/>ANTIGRAVITY
        </h1>
        
        <div className="w-12 h-1 bg-primary mb-8 rounded-full" />
        
        <p className="text-slate-400 text-sm leading-relaxed mb-10">
          야외 방탈출 미션 시스템에 오신 것을 환영합니다.<br/>
          게임을 시작하려면 배부된 <span className="text-white font-bold underline decoration-primary underline-offset-4">QR 코드</span>를 스캔해주세요.
        </p>
        
        <div className="flex items-center gap-2 text-slate-500 text-xs font-mono bg-black/20 px-4 py-2 rounded-full">
          <MapPin className="w-3 h-3" />
          <span>SCAN TO INITIALIZE SESSION</span>
        </div>
      </div>
      
      <div className="mt-12 text-slate-600 text-[10px] tracking-widest uppercase font-bold">
        Secure Operational Interface v1.0.4
      </div>
    </div>
  );
}
