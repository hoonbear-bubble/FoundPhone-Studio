/* React/data adapters for dudwo5/Mymy UI templates: kt/ktn/KHD/bub,
 * igHome/igProfile/igDM/igSheet, xHome. See NOTICE.txt for permission.
 * Author content, DOM globals, timers and media dependencies are excluded. */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Search,
  Plus,
  Settings,
  Users,
  MessageCircle,
  MoreHorizontal,
  Heart,
  Home,
  Grid,
  Send,
  Bookmark,
  Repeat2,
  BarChart2,
  Share,
  User,
  Bell,
  X,
  Smile,
  Menu,
  Compass,
} from "lucide-react";
import type { SkinProps } from "../../AppSkins";
import { Avatar, Media } from "../../skins/shared";
import { displayedKakaoItems, clearKakaoThread } from "./kakaoState";
import { useSkinState } from "../../skinState";
import { makeItem, type Item } from "../../schema";
import "./ui.css";
import "./adapter.css";
function grouped(items: Item[]) {
  return [...new Set(items.map((i) => i.title))].map((title) => ({
    title,
    items: items.filter((i) => i.title === title),
  }));
}
export function messageRun(items: Item[], index: number) {
  const m = items[index],
    previous = items[index - 1],
    next = items[index + 1];
  return {
    first:
      !previous ||
      previous.outgoing !== m.outgoing ||
      previous.sender !== m.sender,
    last: !next || next.outgoing !== m.outgoing || next.sender !== m.sender,
  };
}
const read = (p: SkinProps, i: Item) =>
  p.creator || i.password ? p.onItem(i) : p.onRead(i.id);
function Blank() {
  return <p className="mymy-empty">暂无内容</p>;
}
function Back({ onClick }: { onClick: () => void }) {
  return (
    <button aria-label="返回" onClick={onClick}>
      <ArrowLeft size={22} />
    </button>
  );
}
export function MymyKakao(p: SkinProps) {
  const [tab, setTab] = useSkinState<string>(p, "mymyTab", "聊天"),
    [sent, setSent] = useSkinState<string[]>(p, "mymyKktSent", []),
    [draft, setDraft] = useState(""),
    [query, setQuery] = useState(""),
    [menu, setMenu] = useState(false);
  const [tapStep, setTapStep] = useSkinState<number>(p, "bathTapStepV4", 0);
  const [deleted, setDeleted] = useSkinState<string[]>(
    p,
    "kktDeletedMessages",
    [],
  );
  const [historyPrompt,setHistoryPrompt]=useState(false);
  const [historyOpen,setHistoryOpen]=useState(false);
  const [rpsChoice,setRpsChoice]=useState("");
  const [historyStep,setHistoryStep]=useState(0);
  const [historyEnd,setHistoryEnd]=useState(false);
  const [rpsResult,setRpsResult]=useState<"win"|"lose">("lose");
  const [savedOct24,setSavedOct24]=useSkinState<{choice:string;result:"win"|"lose"}|null>(p,"completedOct24KakaoV1",null);
  const touchStart=useRef<number|null>(null);
  const [manage, setManage] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const localMessages = useMemo(
    () =>
      sent.flatMap((raw, index) => {
        try {
          const entry: unknown = JSON.parse(raw);
          if (
            !Array.isArray(entry) ||
            entry.length !== 3 ||
            !entry.every((v) => typeof v === "string")
          )
            return [];
          return [
            makeItem({
              id: "local-kkt-" + index,
              title: entry[0],
              body: entry[1],
              time: entry[2],
              sender: p.owner || "机主",
              outgoing: true,
              meta: { local: "true" },
            }),
          ];
        } catch {
          return [];
        }
      }),
    [sent, p.owner],
  );
  const allItems = useMemo(
    () => [...p.items, ...localMessages],
    [p.items, localMessages],
  );
  const revealed = useMemo(
    () => displayedKakaoItems(allItems, tapStep, deleted),
    [allItems, tapStep, deleted],
  );
  const sourceList = grouped(allItems);
  const list = sourceList
    .filter(
      (g) =>
        tab === "好友" ||
        g.items.some((i) => !deleted.includes(i.id) && !i.meta.replyChoice),
    )
    .sort(
      (a, b) =>
        Number(b.items.some((i) => i.meta.pinned === "true")) -
        Number(a.items.some((i) => i.meta.pinned === "true")),
    );
  const messages = revealed.filter((i) => i.title === p.thread && !i.id.startsWith("oct24-"));
  const oldIntro=[["韩志薰","今天我要先洗澡"],["金道勋","不行不行我们猜拳"],["韩志薰","啊猜拳每次都是哥赢"],["韩志薰","我不要"],["金道勋","三局两胜吧 哥让你一局"],["韩志薰","不要🙅就一次"],["金道勋","剪刀石头布"]].map(([sender,body],i)=>({id:"oct24-new-"+i,sender,body,outgoing:sender==="韩志薰"}));
  const branch=rpsChoice?rpsResult:"";
  const winReplies = [
    ["金道勋","10分钟一定要洗好"],
    ["金道勋","一定要在10分钟内"],
    ["韩志薰","赢家才有话语权！"],
    ["韩志薰","我要泡半个小时"],
    ["韩志薰","哥好好等着吧！"],
    ["金道勋","啊韩志薰！"],
  ];
  const loseReplies = [
    ["金道勋","我又赢了✌️～"],
    ["韩志薰","哥要快点 不要像上次一样煮身体"],
    ["金道勋","我才没有煮身体！"],
    ["韩志薰","白菜焯水"],
    ["金道勋","什么？"],
    ["韩志薰","我说哥洗澡像白菜焯水…"],
    ["韩志薰","啊不要问了快点去洗吧 ！"],
    ["金道勋","知道了知道了"],
  ];
  const oldBranch = (branch === "win" ? winReplies : loseReplies).map(([sender,body],i)=>({
    id:"oct24-reply-"+i,sender,body,outgoing:sender==="韩志薰"
  }));
  const isBath = p.items.some(
    (i) =>
      i.title === p.thread &&
      i.meta.tapSequence === "bath" &&
      !deleted.includes(i.id),
  );
  const scroll = useRef<HTMLDivElement>(null);
  useEffect(()=>{if(p.ui?.oct24Start===true){p.onThread("小屎狗💗");setHistoryOpen(true);setHistoryPrompt(false);setHistoryStep(0);setRpsChoice("");setHistoryEnd(false);p.onUi?.("oct24Start",false);}},[p.ui?.oct24Start]);
  useEffect(()=>{if(historyEnd && rpsChoice)setSavedOct24({choice:rpsChoice,result:rpsResult});},[historyEnd,rpsChoice,rpsResult,setSavedOct24]);
  useEffect(() => {
    const node = scroll.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [p.thread, messages.length]);
  return (
    <div className="mymy-ui mymy-kakao" data-mymy="kakao">
      {p.thread ? (
        <>
          <header className="kzth">
            <Back
              onClick={() => {
                setManage(false);
                setConfirmClear(false);
                setMenu(false);
                p.onThread("");
              }}
            />
            <span className="kzname">{p.thread}</span>
            <span className="kzpill">
              <button aria-label="聊天菜单" onClick={() => setMenu(!menu)}>
                <Menu size={21} />
              </button>
            </span>
          </header>
          <div
            className="msgs kk"
            ref={scroll}
            onTouchStart={e=>{touchStart.current=e.touches[0]?.clientY??null;}}
            onTouchEnd={e=>{const start=touchStart.current;touchStart.current=null;if(start!==null && (e.changedTouches[0]?.clientY??0)-start>65 && (scroll.current?.scrollTop??0)<45 && p.thread==="小屎狗💗" && !historyOpen)setHistoryPrompt(true);}}
            onWheel={e=>{if(e.deltaY< -15 && (scroll.current?.scrollTop??0)<30 && p.thread==="小屎狗💗" && !historyOpen)setHistoryPrompt(true);}}
            onClick={() => {
              if (historyOpen && !historyEnd) { if (!rpsChoice && historyStep >= oldIntro.length) return; const max=rpsChoice?oldIntro.length+2+oldBranch.length:oldIntro.length; setHistoryStep(v=>Math.min(v+1,max)); if(rpsChoice && historyStep>=max-1)setHistoryEnd(true); return; }
              if (isBath && tapStep < 7 && !manage) {
                setTapStep(tapStep + 1);
                if (tapStep === 6) p.onRead("bath-6");
              }
            }}
          >
            {historyPrompt && <div role="dialog" aria-label="访问上一天聊天记录" style={{padding:20,background:"white",borderRadius:16,textAlign:"center",boxShadow:"0 4px 20px #0003"}}><strong>是否访问上一天聊天记录？</strong><p>10月24日</p><button className="kkt-reply-choice" onClick={e=>{e.stopPropagation();setHistoryPrompt(false);setHistoryOpen(true);}}>是</button><button className="kkt-reply-choice" onClick={e=>{e.stopPropagation();setHistoryPrompt(false);}}>否</button></div>}
            {historyOpen && <section style={{padding:12,background:"#b2c7d9",minHeight:"100%"}}>
              <p style={{textAlign:"center",fontSize:12}}>10月24日 · 20:25</p>
              {oldIntro.slice(0,historyStep).map(m=><p key={m.id} style={{textAlign:m.outgoing?"right":"left",margin:"14px 0"}}><span style={{background:m.outgoing?"#fee500":"white",borderRadius:12,padding:10,display:"inline-block"}}>{m.body}</span></p>)}
              {historyStep>=oldIntro.length && !rpsChoice && <div style={{padding:16,background:"white",borderRadius:14,textAlign:"center"}}><strong>选择出拳</strong><div style={{display:"flex",gap:14,justifyContent:"space-between",marginTop:16}}>{["剪刀","石头","布"].map((c,i)=><button key={c} className="kkt-reply-choice" style={{flex:1,minWidth:0,padding:"12px 2px"}} onClick={e=>{e.stopPropagation();setRpsChoice(c);setRpsResult(Math.random()<0.5?"win":"lose");}}>{["A","B","C"][i]} · {c}</button>)}</div></div>}
              {rpsChoice && <>{[{body:rpsChoice,outgoing:true},{body:rpsResult==="win"?(rpsChoice==="剪刀"?"布":rpsChoice==="石头"?"剪刀":"石头"):(rpsChoice==="剪刀"?"石头":rpsChoice==="石头"?"布":"剪刀"),outgoing:false},...oldBranch].slice(0,Math.max(0,historyStep-oldIntro.length)).map((m,i)=><p key={i} style={{textAlign:m.outgoing?"right":"left",margin:"14px 0"}}><span style={{background:m.outgoing?"#fee500":"white",borderRadius:12,padding:10,display:"inline-block"}}>{m.body}</span></p>)}</>}
              {historyEnd && <div style={{padding:16,background:"white",borderRadius:14,textAlign:"center"}}><strong>剧情结束，接下来想去哪里？</strong><div style={{display:"flex",flexDirection:"column",gap:14,marginTop:14}}><button className="kkt-reply-choice" onClick={e=>{e.stopPropagation();setHistoryOpen(false);p.onUi?.("returnOct24Notes",true);}}>返回备忘录</button><button className="kkt-reply-choice" onClick={e=>{e.stopPropagation();setHistoryOpen(false);p.onThread("");}}>自由探索手机</button></div></div>}
              {!historyEnd && <p style={{textAlign:"center",fontSize:12,marginTop:20}}>轻点空白处显示下一条消息</p>}
            </section>}
            {!historyOpen && p.thread==="小屎狗💗" && savedOct24 && <section aria-label="10月24日已完成聊天记录" style={{padding:"8px 12px 16px",background:"#b2c7d9"}}>
              <p style={{textAlign:"center",fontSize:12,margin:"8px 0 16px"}}>10月24日 · 20:25</p>
              {[
                ...oldIntro,
                {body:savedOct24.choice,outgoing:true},
                {body:savedOct24.result==="win"?(savedOct24.choice==="剪刀"?"布":savedOct24.choice==="石头"?"剪刀":"石头"):(savedOct24.choice==="剪刀"?"石头":savedOct24.choice==="石头"?"布":"剪刀"),outgoing:false},
                ...(savedOct24.result==="win"?winReplies:loseReplies).map(([sender,body])=>({body,outgoing:sender==="韩志薰"}))
              ].map((m,i)=><p key={"saved-oct24-"+i} style={{textAlign:m.outgoing?"right":"left",margin:"14px 0"}}><span style={{background:m.outgoing?"#fee500":"white",borderRadius:12,padding:10,display:"inline-block"}}>{m.body}</span></p>)}
              <p style={{textAlign:"center",fontSize:12,marginTop:18}}>10月25日</p>
            </section>}
            {!historyOpen && messages.map((m, i) => {
              const run = messageRun(messages, i);
              return (
                <div
                  key={m.id}
                  className={
                    "kzm " +
                    (m.outgoing ? "kzmy" : "kzot") +
                    (run.first ? " first" : "")
                  }
                >
                  {!m.outgoing && run.first && (
                    <>
                      <div className="kzmav">
                        <Avatar name={m.sender} src={m.avatar} />
                      </div>
                      <div className="kzmn">{m.sender}</div>
                    </>
                  )}
                  {m.outgoing && run.last && (
                    <span className="kzt">
                      {m.meta.unread || ""}
                      <br />
                      {m.time.slice(-5)}
                    </span>
                  )}
                  <button
                    className={"kzbub" + (m.media ? " kzimg" : "")}
                    onClick={() =>
                      !manage && m.meta.local !== "true" && read(p, m)
                    }
                  >
                    {m.media ? <Media item={m} /> : m.body}
                  </button>
                  {manage && (
                    <button
                      className="kkt-delete-message"
                      aria-label={"删除消息：" + m.body}
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleted([...deleted, m.id]);
                      }}
                    >
                      删除
                    </button>
                  )}
                  {!m.outgoing && run.last && (
                    <span className="kzt">{m.time.slice(-5)}</span>
                  )}
                </div>
              );
            })}

            {!historyOpen && isBath && tapStep < 7 && !manage && (
              <p
                style={{ textAlign: "center", fontSize: 11, color: "#626262" }}
              >
                轻触聊天区域，继续对话
              </p>
            )}
            {!historyOpen && p.items
              .filter(
                (i) =>
                  !deleted.includes(i.id) &&
                  i.title === p.thread &&
                  i.meta.replyChoice && !i.id.startsWith("oct24-"),
              )
              .map((i) => (
                <button
                  key={i.id}
                  className="kkt-reply-choice"
                  onClick={(e) => {
                    e.stopPropagation();
                    p.onRead(i.id);
                  }}
                >
                  {i.body}
                </button>
              ))}
            {!historyOpen && !messages.length && !isBath && (
              <p className="mymy-empty">暂无聊天记录</p>
            )}
          </div>
          <form
            className="kzinp"
            style={{display:historyOpen?"none":undefined}}
            onSubmit={(e) => {
              e.preventDefault();
              if (draft.trim()) {
                setSent([
                  ...sent,
                  JSON.stringify([
                    p.thread,
                    draft.trim(),
                    p.virtualTime || "09:41",
                  ]),
                ]);
                setDraft("");
              }
            }}
          >
            <button
              type="button"
              aria-label="添加聊天内容"
              onClick={() => (p.creator ? p.onAdd() : setMenu(!menu))}
            >
              <Plus size={21} />
            </button>
            <input
              aria-label="KKT消息"
              placeholder="输入消息"
              value={draft}
              maxLength={2000}
              onChange={(e) => setDraft(e.target.value)}
            />
            <Smile size={22} />
            <button
              className={draft.trim() ? "go" : ""}
              aria-label="发送KKT消息"
              disabled={!draft.trim()}
            >
              ↑
            </button>
          </form>
          {menu && (
            <div className="mymy-local-menu">
              <strong>{p.thread}</strong>
              <p>
                群成员：{[...new Set(messages.map((m) => m.sender))].join("、")}
              </p>
              <button
                onClick={() => {
                  setManage(!manage);
                  setMenu(false);
                  setConfirmClear(false);
                }}
              >
                {manage ? "结束管理" : "管理消息（可逐条删除）"}
              </button>
              <button
                onClick={() => {
                  if (!confirmClear) {
                    setConfirmClear(true);
                    return;
                  }
                  setDeleted(clearKakaoThread(allItems, p.thread, deleted));
                  setManage(false);
                  setConfirmClear(false);
                  setMenu(false);
                  p.onThread("");
                }}
              >
                {confirmClear ? "确认清空这段聊天" : "清空聊天记录"}
              </button>
              <button
                onClick={() => {
                  setConfirmClear(false);
                  setMenu(false);
                }}
              >
                完成
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="kzkk">
          <div className="kzhd">
            <header className="kzkh">
              <b className="kzti">
                {tab === "好友" ? p.owner || "好友" : "聊天"}
              </b>
              <span className="kzic">
                <button
                  aria-label="搜索聊天"
                  onClick={() => setQuery(query ? "" : " ")}
                >
                  <Search size={21} />
                </button>
                {p.creator && (
                  <button aria-label="新增内容" onClick={p.onAdd}>
                    <Plus />
                  </button>
                )}
                <button aria-label="KKT设置" onClick={() => setMenu(!menu)}>
                  <Settings size={21} />
                </button>
              </span>
            </header>
            <div className="kzkc2">
              {["好友", "聊天"].map((t) => (
                <button
                  key={t}
                  className={
                    "kzkpl " +
                    (t === tab || (t === "为你推荐" && tab === "推荐")
                      ? "on"
                      : "")
                  }
                  onClick={() => setTab(t)}
                >
                  {t}
                </button>
              ))}
            </div>
            {query !== "" && (
              <input
                className="mymy-search"
                aria-label="搜索KKT"
                value={query.trimStart()}
                onChange={(e) => setQuery(e.target.value || " ")}
                placeholder="搜索"
              />
            )}
          </div>
          <div className="kzkb">
            {tab === "好友" && (
              <div className="kzkr">
                <Avatar
                  name={p.owner || "我"}
                  src={p.items.find((i) => i.outgoing && i.avatar)?.avatar}
                />
                <b>{p.owner}</b>
              </div>
            )}
            <div className="kzksec">
              {tab === "好友" ? "好友" : "全部聊天"} {list.length}
            </div>
            {list
              .filter((g) => g.title.includes(query.trim()))
              .map((g) => {
                const last = revealed.filter((i) => i.title === g.title).at(-1);
                const peer = g.items.find(
                  (i) =>
                    !i.outgoing && !i.meta.groupAvatar && !i.meta.replyChoice,
                );
                return (
                  <button
                    className="kzkr kzkcr"
                    key={g.title}
                    onClick={() => p.onThread(g.title)}
                  >
                    <Avatar
                      name={g.title}
                      src={
                        g.items.find((i) => i.meta.groupAvatar === "true")
                          ?.avatar ||
                        g.items.find((i) => !i.outgoing)?.avatar ||
                        peer?.avatar
                      }
                    />
                    <span className="kzkn">
                      <b>
                        {g.title}
                        {g.items.some((i) => i.meta.pinned === "true")
                          ? " 📌"
                          : ""}
                      </b>
                      <small>
                        {tab === "好友" ? "" : last?.body || "暂无聊天记录"}
                      </small>
                    </span>
                    <span className="kzkmt">
                      {last?.time.slice(-5)}
                      {last?.meta.unread && (
                        <i className="kzkbd">{last.meta.unread}</i>
                      )}
                    </span>
                  </button>
                );
              })}
            {!list.length && <Blank />}
          </div>
          <nav className="kzknv">
            {[Users, MessageCircle, Compass, Grid, MoreHorizontal].map(
              (Icon, i) => (
                <button
                  key={i}
                  aria-label={["好友", "聊天", "发现", "更多功能", "设置"][i]}
                  className={(tab === "好友" ? 0 : 1) === i ? "on" : ""}
                  onClick={() =>
                    i < 2 ? setTab(["好友", "聊天"][i]) : setMenu(true)
                  }
                >
                  <Icon />
                </button>
              ),
            )}
          </nav>
          {menu && (
            <div className="mymy-local-menu">
              <strong>KakaoTalk</strong>
              <p>作品内聊天</p>
              <button onClick={() => setMenu(false)}>完成</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
export function MymyInstagram(p: SkinProps) {
  const [tab, setTab] = useSkinState<string>(p, "mymyTab", "主页"),
    [liked, setLiked] = useSkinState<string[]>(p, "mymyLiked", []),
    [saved, setSaved] = useSkinState<string[]>(p, "mymySaved", []),
    [replies, setReplies] = useSkinState<string[]>(p, "mymyReplies", []),
    [seen, setSeen] = useSkinState<string[]>(p, "mymySeen", []);
  const [sheet, setSheet] = useState<Item | null>(null),
    [selected, setSelected] = useState<Item | null>(null),
    [story, setStory] = useState(0),
    [draft, setDraft] = useState(""),
    [pop, setPop] = useState("");
  const posts = p.items.filter(
      (i) => i.folder !== "私信" && i.meta.story !== "true",
    ),
    stories = p.items.filter((i) => i.meta.story === "true"),
    dms = p.items.filter((i) => i.folder === "私信"),
    active = stories[story - 1];
  const toggle = (id: string, values: string[], set: (v: string[]) => void) =>
    set(values.includes(id) ? values.filter((v) => v !== id) : [...values, id]);
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(
      () => setStory((n) => (n < stories.length ? n + 1 : 0)),
      5000,
    );
    return () => clearTimeout(t);
  }, [active, stories.length]);
  const openStory = (i: number) => {
    const m = stories[i];
    setSeen([...new Set([...seen, m.id])]);
    read(p, m);
    setStory(i + 1);
  };
  const openPost = (i: Item) => {
    if (p.creator || i.password) p.onItem(i);
    else {
      read(p, i);
      setSelected(i);
    }
  };
  const post = (i: Item) => (
    <article className="igp" key={i.id}>
      <header className="igph">
        <Avatar name={i.sender} src={i.avatar} />
        <div className="igpn">
          <button onClick={() => setTab("个人主页")}>
            <b>{i.sender}</b>
          </button>
          <small>{i.meta.location || i.time}</small>
        </div>
        <button aria-label="帖子详情" onClick={() => openPost(i)}>
          <MoreHorizontal />
        </button>
      </header>
      <div
        className="carw"
        onDoubleClick={() => {
          if (!liked.includes(i.id)) setLiked([...liked, i.id]);
          setPop(i.id);
        }}
      >
        <Media item={i} />
        {pop === i.id && (
          <Heart
            className="mymy-heart-pop"
            fill="white"
            onAnimationEnd={() => setPop("")}
          />
        )}
      </div>
      <div className="iga">
        <button
          aria-label={"点赞" + i.title}
          aria-pressed={liked.includes(i.id)}
          onClick={() => toggle(i.id, liked, setLiked)}
        >
          <Heart
            fill={liked.includes(i.id) ? "#ff3040" : "none"}
            color={liked.includes(i.id) ? "#ff3040" : "currentColor"}
          />
        </button>
        <button
          aria-label={"评论" + i.title}
          onClick={() => {
            read(p, i);
            setSheet(i);
          }}
        >
          <MessageCircle />
        </button>
        <button aria-label="分享帖子" onClick={() => setTab("私信")}>
          <Send />
        </button>
        <button
          className="mymy-save"
          aria-label={"收藏" + i.title}
          aria-pressed={saved.includes(i.id)}
          onClick={() => toggle(i.id, saved, setSaved)}
        >
          <Bookmark fill={saved.includes(i.id) ? "currentColor" : "none"} />
        </button>
      </div>
      <p className="lk2">{i.likes + (liked.includes(i.id) ? 1 : 0)} 次赞</p>
      <button
        className="igc"
        onClick={() => {
          openPost(i);
        }}
      >
        <b>{i.sender}</b> {i.body}
      </button>
      <button className="cmall" onClick={() => setSheet(i)}>
        查看评论{" "}
        {i.comments.length +
          replies.filter((r) => r.startsWith(i.id + "\t")).length}
      </button>
      <p className="igt">{i.time}</p>
    </article>
  );
  return (
    <div className="mymy-ui mymy-instagram" data-mymy="instagram">
      <div className="ig">
        <header className="igh">
          <button
            aria-label={selected ? "返回Instagram动态" : "关闭当前App"}
            onClick={() => (selected ? setSelected(null) : p.onBack())}
          >
            <ArrowLeft />
          </button>
          <span className="igl2">
            {selected ? "帖子" : tab === "主页" ? "Instagram" : tab}
          </span>
          <button aria-label="打开私信" onClick={() => setTab("私信")}>
            <Send />
          </button>
        </header>
        <div className="igb">
          {selected && post(selected)}
          {!selected && tab === "主页" && (
            <>
              <div className="sts">
                {stories.map((s, n) => (
                  <button
                    className="st"
                    key={s.id}
                    onClick={() => openStory(n)}
                  >
                    <span
                      className={"sr on " + (seen.includes(s.id) ? "seen" : "")}
                    >
                      <Avatar name={s.sender} src={s.avatar} />
                    </span>
                    <small>{s.sender}</small>
                  </button>
                ))}
              </div>
              {posts.map(post)}
              {!posts.length && <Blank />}
            </>
          )}
          {!selected && tab === "个人主页" && (
            <>
              <div className="pf">
                <Avatar name={p.owner || "机主"} />
                <div className="ps">
                  <div>
                    <b>{posts.length}</b>
                    <small>帖子</small>
                  </div>
                  <div>
                    <b>—</b>
                    <small>粉丝</small>
                  </div>
                  <div>
                    <b>—</b>
                    <small>关注</small>
                  </div>
                </div>
              </div>
              <p className="pn">{p.owner}</p>
              <div className="ptab">
                <div className="on">
                  <Grid />
                </div>
              </div>
              <div className="pg2">
                {posts.map((i) => (
                  <button key={i.id} onClick={() => openPost(i)}>
                    <Media item={i} />
                  </button>
                ))}
              </div>
            </>
          )}
          {!selected && tab === "私信" && (
            <>
              {dms.map((i) => (
                <button className="kzkr" key={i.id} onClick={() => openPost(i)}>
                  <Avatar name={i.sender} src={i.avatar} />
                  <span className="kzkn">
                    <b>{i.title}</b>
                    <small>{i.body}</small>
                  </span>
                </button>
              ))}
              {!dms.length && <Blank />}
            </>
          )}
          {!selected && tab === "搜索" && (
            <>
              <input
                className="mymy-search"
                aria-label="搜索Instagram"
                placeholder="搜索"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              {posts
                .filter((i) => (i.title + i.body + i.sender).includes(draft))
                .map(post)}
            </>
          )}
        </div>
        <nav className="mymy-ig-nav">
          {[Home, Search, Send, User].map((Icon, n) => (
            <button
              key={n}
              aria-label={["主页", "搜索", "私信", "个人主页"][n]}
              aria-pressed={
                !selected && tab === ["主页", "搜索", "私信", "个人主页"][n]
              }
              onClick={() => {
                setSelected(null);
                setTab(["主页", "搜索", "私信", "个人主页"][n]);
              }}
            >
              <Icon />
            </button>
          ))}
        </nav>
      </div>
      {sheet && (
        <div className="kzcs">
          <button
            className="kzbk"
            aria-label="关闭评论"
            onClick={() => setSheet(null)}
          />
          <section className="kzsh" role="dialog" aria-label="Instagram评论">
            <div className="mymy-sheet-handle" />
            <header>
              <b>评论</b>
              <button aria-label="关闭评论面板" onClick={() => setSheet(null)}>
                <X />
              </button>
            </header>
            <div className="mymy-comments">
              {[
                ...sheet.comments,
                ...replies
                  .filter((r) => r.startsWith(sheet.id + "\t"))
                  .map((r) => r.split("\t").slice(1).join("\t")),
              ].map((c, n) => (
                <p key={n}>
                  <Avatar name={c.split(":")[0]} />
                  {c}
                </p>
              ))}
            </div>
            <form
              className="cmb2"
              onSubmit={(e) => {
                e.preventDefault();
                if (draft.trim()) {
                  setReplies([...replies, sheet.id + "\t" + draft.trim()]);
                  setDraft("");
                }
              }}
            >
              <input
                aria-label="添加评论"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="添加评论"
                maxLength={500}
              />
              <button>发布</button>
            </form>
          </section>
        </div>
      )}
      {active && (
        <div
          className="mymy-story"
          onPointerDown={(e) => {
            const box = e.currentTarget.getBoundingClientRect();
            const next =
              e.clientX - box.left < box.width * 0.3 ? story - 1 : story + 1;
            setStory(next > stories.length ? 0 : Math.max(0, next));
          }}
        >
          <div className="mymy-story-bars">
            {stories.map((s, n) => (
              <i key={s.id} className={n < story ? "seen" : ""} />
            ))}
          </div>
          <header>
            <Avatar name={active.sender} src={active.avatar} />
            <b>{active.sender}</b>
            <button
              aria-label="关闭快拍"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setStory(0)}
            >
              <X />
            </button>
          </header>
          <Media item={active} />
          <p>{active.body}</p>
        </div>
      )}
    </div>
  );
}
export function MymyX(p: SkinProps) {
  const [dark, setDark] = useSkinState<boolean>(p, "x-dark", true);
  const [tab, setTab] = useSkinState<string>(p, "mymyTab", "推荐"),
    [likes, setLikes] = useSkinState<string[]>(p, "mymyXLikes", []),
    [reposts, setReposts] = useSkinState<string[]>(p, "mymyXReposts", []),
    [marks, setMarks] = useSkinState<string[]>(p, "mymyXMarks", []),
    [query, setQuery] = useState("");
  const isLiked = (id: string) =>
    typeof p.ui?.["liked-" + id] === "boolean"
      ? Boolean(p.ui["liked-" + id])
      : likes.includes(id);
  const isSaved = (id: string) =>
    typeof p.ui?.["saved-" + id] === "boolean"
      ? Boolean(p.ui["saved-" + id])
      : marks.includes(id);
  const toggle = (id: string, v: string[], set: (x: string[]) => void) =>
    set(v.includes(id) ? v.filter((x) => x !== id) : [...v, id]);
  return (
    <div
      className={"mymy-ui mymy-x " + (dark ? "x-reference-dark" : "")}
      data-mymy="twitter"
    >
      <div className="kzxw">
        <header className="kzxh">
          <button aria-label="关闭当前App" onClick={p.onBack}>
            <ArrowLeft />
          </button>
          <div className="kzxlg">𝕏</div>
          <button aria-label="切换X外观" onClick={() => setDark(!dark)}>
            <User />
          </button>
        </header>
        <div className="kzxtb">
          {["为你推荐", "正在关注", "添加 +", "时间"].map((t) => (
            <button
              className={t === tab ? "on" : ""}
              key={t}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
        {tab === "搜索" && (
          <input
            className="mymy-search"
            aria-label="搜索X"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索"
          />
        )}
        <div className="kzxfd">
          {p.items
            .filter((i) => (i.title + i.body).includes(query))
            .map((i) => (
              <article className="kzxt" key={i.id}>
                <Avatar name={i.sender} src={i.avatar} />
                <div className="kzxb">
                  <div className="kzxn">
                    <b>{i.sender}</b>
                    <small>
                      @{i.meta.handle || "user"} · {i.time.slice(-5)}
                    </small>
                    <em>
                      <MoreHorizontal size={18} />
                    </em>
                  </div>
                  <button
                    className="kzxx"
                    onClick={() => {
                      read(p, i);
                      p.onItem(i);
                    }}
                  >
                    {i.body}
                  </button>
                  {i.media && (
                    <button
                      className="kzxv"
                      aria-label="打开媒体"
                      onClick={() => p.onItem(i)}
                    >
                      <Media item={i} />
                    </button>
                  )}
                  <div className="kzxac">
                    <button
                      aria-label={"评论" + i.title}
                      onClick={() => p.onItem(i)}
                    >
                      <MessageCircle />
                      {i.comments.length}
                    </button>
                    <button
                      aria-label={"转发" + i.title}
                      aria-pressed={reposts.includes(i.id)}
                      onClick={() => toggle(i.id, reposts, setReposts)}
                    >
                      <Repeat2 />
                      {reposts.includes(i.id) ? 1 : 0}
                    </button>
                    <button
                      aria-label={"点赞" + i.title}
                      aria-pressed={isLiked(i.id)}
                      onClick={() => {
                        toggle(i.id, likes, setLikes);
                        p.onUi?.("liked-" + i.id, !isLiked(i.id));
                      }}
                    >
                      <Heart fill={isLiked(i.id) ? "#f91880" : "none"} />
                      {i.likes + (isLiked(i.id) ? 1 : 0)}
                    </button>
                    <span>
                      <BarChart2 />
                      {i.meta.views || "—"}
                    </span>
                    <button
                      aria-label={"收藏" + i.title}
                      aria-pressed={isSaved(i.id)}
                      onClick={() => {
                        toggle(i.id, marks, setMarks);
                        p.onUi?.("saved-" + i.id, !isSaved(i.id));
                      }}
                    >
                      <Bookmark />
                    </button>
                    <button aria-label="分享" onClick={() => p.onItem(i)}>
                      <Share />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          {!p.items.length && <Blank />}
        </div>
        <nav className="kzxnav">
          {[Home, Search, Bell, MessageCircle].map((Icon, n) => (
            <button
              key={n}
              aria-label={["时间线", "搜索", "通知", "私信"][n]}
              onClick={() => n < 2 && setTab(n ? "搜索" : "推荐")}
              disabled={n > 1}
            >
              <Icon />
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
