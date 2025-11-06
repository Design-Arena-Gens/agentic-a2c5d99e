"use client";
import { useState } from "react";

export default function Home() {
  const [sourceType, setSourceType] = useState<"text"|"link"|"audio">("text");
  const [text, setText] = useState("");
  const [link, setLink] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [publish, setPublish] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string|undefined>();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(undefined); setResult(null);
    const payload: any = { sourceType, publish };
    if (sourceType === "text") payload.text = text;
    if (sourceType === "link") payload.link = link;
    if (sourceType === "audio") payload.audioUrl = audioUrl;
    try {
      const res = await fetch("/api/process", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro");
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h1>Automa??o de Post para Blogger</h1>
      <p>Entre com <b>texto</b>, <b>link</b> ou <b>URL de ?udio</b> (Telegram via n8n) e gere um post financeiro.</p>
      <form onSubmit={handleSubmit}>
        <label>Tipo de Fonte</label>
        <select value={sourceType} onChange={e=>setSourceType(e.target.value as any)}>
          <option value="text">Texto</option>
          <option value="link">Link</option>
          <option value="audio">?udio (URL)</option>
        </select>

        {sourceType === "text" && (<>
          <label>Texto</label>
          <textarea rows={8} value={text} onChange={e=>setText(e.target.value)} placeholder="Cole o texto aqui" />
        </>)}

        {sourceType === "link" && (<>
          <label>URL</label>
          <input value={link} onChange={e=>setLink(e.target.value)} placeholder="https://..." />
        </>)}

        {sourceType === "audio" && (<>
          <label>URL do ?udio</label>
          <input value={audioUrl} onChange={e=>setAudioUrl(e.target.value)} placeholder="https://.../file.ogg" />
        </>)}

        <label style={{display:'flex', gap:8, alignItems:'center'}}>
          <input type="checkbox" checked={publish} onChange={e=>setPublish(e.target.checked)} style={{width:18, height:18}} />
          Publicar direto no Blogger
        </label>

        <button type="submit" disabled={loading}>{loading? "Processando...":"Gerar"}</button>
      </form>

      {error && <p style={{color:'#ff8b8b', marginTop:12}}>{error}</p>}
      {result && (
        <div style={{marginTop:16}}>
          <h2>Pr?via</h2>
          {result.imageUrl && <img src={result.imageUrl} alt="imagem" style={{maxWidth:'100%', borderRadius:12}} />}
          <h3>{result.title}</h3>
          <div dangerouslySetInnerHTML={{__html: result.html}} />
          {result.blogger && <pre style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(result.blogger, null, 2)}</pre>}
        </div>
      )}
    </div>
  );
}
