import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Phone } from "../Phone";
import { db } from "../persistence";
import { validateWork, type Work } from "../schema";
import "../styles.css";
import "./player.css";
function StoryPlayer() {
  const [work, setWork] = useState<Work | null>(null),
    [error, setError] = useState("");
  const [choice, setChoice] = useState<"new" | "resume" | null>(null);
  const [hasSave, setHasSave] = useState(false);
  const [starting, setStarting] = useState(false);
  useEffect(() => {
    if (!work) return;
    let active = true;
    void db.saves.get(work.id).then((saved) => {
      if (active) setHasSave(!!saved);
    }).catch(() => { if (active) setHasSave(false); });
    return () => { active = false; };
  }, [work]);
  const startNew = async () => {
    if (!work || starting) return;
    setStarting(true);
    try { await db.saves.delete(work.id); } catch { /* Fresh mode also bypasses unavailable storage. */ }
    try { localStorage.removeItem(`foundphone-last-app-${work.id}`); } catch { /* Storage may be restricted. */ }
    setChoice("new");
    setStarting(false);
  };
  useEffect(() => {
    const abort = new AbortController();
    fetch(
      new URLSearchParams(location.search).get("preview") === "test"
        ? "./test-work.json"
        : new URLSearchParams(location.search).get("template") === "blank"
          ? "./blank-work.json"
          : "./work.json",
      { signal: abort.signal },
    )
      .then((r) => {
        if (!r.ok) throw Error("缺少作品文件，请运行 npm run story:build");
        return r.json();
      })
      .then((x) => {
        const w = validateWork(x);
        document.title =
          w.title === "捡手机" ? "捡手机" : w.title + " · 捡手机";
        setWork(w);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(String(e));
      });
    return () => abort.abort();
  }, []);
  return (
    <main className="story-runtime">
      {work ? (
        choice ? (
          <Phone key={`${work.id}-${choice}`} work={work} freshStart={choice === "new"} />
        ) : (
          <section aria-label="选择游玩方式" style={{width:"min(400px, calc(100% - 40px))",padding:28,borderRadius:22,background:"#fff",color:"#242424",textAlign:"center",boxSizing:"border-box"}}>
            <h1 style={{fontSize:22,margin:"0 0 12px"}}>{work.title}</h1>
            <p style={{color:"#666",lineHeight:1.6,marginBottom:24}}>从头探索这部手机，或接着上次的进度。</p>
            <button disabled={starting} style={{display:"block",width:"100%",padding:16,marginBottom:12,border:0,borderRadius:12,background:"#242424",color:"#fff",fontSize:16,cursor:"pointer"}} onClick={() => void startNew()}>{starting ? "正在开始…" : "开启新游戏"}</button>
            <button disabled={!hasSave || starting} style={{display:"block",width:"100%",padding:16,border:"1px solid #ddd",borderRadius:12,background:"#f6f6f6",fontSize:16,cursor:"pointer",opacity:hasSave ? 1 : 0.5}} onClick={() => setChoice("resume")}>返回上次的游玩界面{!hasSave ? "（暂无存档）" : ""}</button>
            <p style={{fontSize:12,color:"#777",margin:"18px 0 0"}}>新游戏会重置剧情进度，继续游戏会保留已触发的消息。</p>
          </section>
        )
      ) : (
        <p role="status">{error || "正在打开手机…"}</p>
      )}
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<StoryPlayer />);
