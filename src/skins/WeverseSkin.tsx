import { useEffect, useRef } from "react";
import type { SkinProps } from "../AppSkins";
import { useSkinState } from "../skinState";
import { Avatar, Header } from "./shared";
import "./weverse.css";
export function WeverseSkin(p: SkinProps) {
  const [step, setStep] = useSkinState<number>(p, "communityStep", 0);
  const post = p.items.find((i) => i.meta.role === "post");
  const replies = p.items.filter((i) => i.meta.role === "reply");
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest" });
  }, [step]);
  return (
    <div className="catalog-skin wvs-story">
      <Header p={p} />
      <div className="wvs-brand">
        weverse <small>TWS · 虚构同人社区</small>
      </div>
      <div className="catalog-scroll">
        {!post ? (
          <p className="wvs-empty">
            社区暂时没有新互动。可以先探索手机，或继续 KakaoTalk 对话。
          </p>
        ) : (
          <>
            <article className="wvs-post">
              <strong>{post.sender}</strong>
              <p>{post.body}</p>
              <small>粉丝社区 · 今天</small>
            </article>
            {replies.slice(0, step).map((i) => (
              <article className="wvs-reply" key={i.id}>
                <Avatar name={i.sender} src={i.avatar} />
                <div>
                  <strong>
                    {i.sender} {i.meta.artist === "true" && <em>ARTIST</em>}
                  </strong>
                  <p>{i.body}</p>
                  <small>{i.meta.likes ? `♡ ${i.meta.likes}` : "刚刚"}</small>
                </div>
              </article>
            ))}
            {step < replies.length && (
              <button
                className="wvs-next"
                onClick={() => {
                  const next = replies[step];
                  setStep(step + 1);
                  p.onRead(next.id);
                }}
              >
                {step === 0 ? "查看志薰的回复" : "查看下一条互动"}
              </button>
            )}
            {step >= replies.length && (
              <p className="wvs-empty">已查看全部互动，可以继续探索手机。</p>
            )}
          </>
        )}
        <div ref={end} />
      </div>
    </div>
  );
}
