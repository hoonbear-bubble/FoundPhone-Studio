import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Phone } from "./Phone";
import { db } from "./persistence";
import { validateWork, type Work } from "./schema";
import "./styles.css";
function Player() {
  const [work, setWork] = useState<Work | null>(null);
  const [error, setError] = useState("");
  const [choice, setChoice] = useState<"new" | "resume" | null>(null);
  const [hasSave, setHasSave] = useState(false);
  useEffect(() => {
    if (!work) return;
    void db.saves.get(work.id).then((save) => setHasSave(!!save)).catch(() => setHasSave(false));
  }, [work]);
  const startNew = async () => {
    if (!work) return;
    try { await db.saves.delete(work.id); } catch { /* Browser may block storage. */ }
    try { localStorage.removeItem(`foundphone-last-app-${work.id}`); } catch { /* Ignore storage restrictions. */ }
    setChoice("new");
  };
  useEffect(() => {
    fetch("./work.json")
      .then((r) => {
        if (!r.ok) throw Error("缺少 work.json");
        return r.json();
      })
      .then((x) => {
        const w = validateWork(x);
        document.title = w.title;
        setWork(w);
      })
      .catch((e) => setError(String(e)));
  }, []);
  return (
    <main className="standalone-player">
      {work ? (
        <>
          <div className="player-title">
            <h1>{work.title}</h1>
          </div>
          {choice ? <Phone key={`${work.id}-${choice}`} work={work} /> : (
            <div style={{maxWidth:400,margin:"32px auto",padding:28,borderRadius:22,background:"#fff",boxShadow:"0 12px 45px #00000018",textAlign:"center"}}>
              <h2 style={{marginBottom:12}}>欢迎来到这部手机</h2>
              <p style={{color:"#666",marginBottom:24}}>请选择游玩方式</p>
              <button style={{display:"block",width:"100%",padding:16,marginBottom:12,border:0,borderRadius:12,background:"#242424",color:"#fff",fontSize:16,cursor:"pointer"}} onClick={() => void startNew()}>开启新游戏</button>
              <button style={{display:"block",width:"100%",padding:16,border:"1px solid #ddd",borderRadius:12,background:"#f6f6f6",fontSize:16,cursor:"pointer"}} onClick={() => setChoice("resume")} disabled={!hasSave}>返回上次的游玩界面{!hasSave ? "（暂无存档）" : ""}</button>
            </div>
          )}
          <p className="player-footnote">
            {work.description}
            <br />
            进度保存在此浏览器 · FoundPhone Studio
          </p>
        </>
      ) : (
        <p>{error || "正在打开故事…"}</p>
      )}
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<Player />);
