"use client";

import { useState } from "react";
import { UploadCloud, Copy, Check, Loader2 } from "lucide-react";

export default function R2UploadTool() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [resultUrl, setResultUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setResultUrl("");
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.url) {
        setResultUrl(data.url);
      }
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = () => {
    if (resultUrl) {
      navigator.clipboard.writeText(resultUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-500">
      <div className="flex flex-col items-center justify-center py-8">
        <UploadCloud className="w-16 h-16 text-primary mb-4" />
        <h1 className="text-3xl font-bold text-white text-center">R2 Asset Uploader</h1>
        <p className="text-slate-400 mt-2 text-center max-w-md text-sm">
          Upload prologue videos or images. You will get a URL back to copy into the game setups.
        </p>
      </div>

      <form onSubmit={handleUpload} className="space-y-6">
        <div className="flex flex-col gap-2">
          <input 
            type="file" 
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 active:outline-none focus:outline-none transition-colors"
          />
        </div>
        
        <button 
          type="submit" 
          disabled={!file || uploading}
          className="w-full bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-400 transition-colors"
        >
          {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Upload to Cloudflare R2"}
        </button>
      </form>

      {resultUrl && (
        <div className="mt-8 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center space-y-4 flex flex-col items-center animate-in slide-in-from-bottom-4">
          <p className="text-emerald-400 text-sm font-semibold max-w-full truncate px-4">{resultUrl}</p>
          <button 
            onClick={copyToClipboard}
            className="flex items-center gap-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-white font-medium py-2 px-6 rounded-full transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy Asset URL"}
          </button>
        </div>
      )}
    </div>
  );
}
