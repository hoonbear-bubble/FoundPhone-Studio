import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { WeverseCommentNotice } from "./WeverseCommentNotice";
import source from "../stories/template/story.json";
import { compileStory } from "./story-engine/compiler";
import { initialRuntime } from "./schema";
import { dispatch } from "./engine";
describe("Weverse comment popup", () => {
  it("fires once after the cat emoji, and does not restore a like notification", () => {
    const { work } = compileStory(source);
    let state = initialRuntime(work);
    expect(state.notifications).toHaveLength(0);
    state = dispatch(work, state, "read", "bath-5");
    expect(state.notifications).toHaveLength(0);
    state = dispatch(work, state, "read", "bath-6");
    expect(state.notifications).toHaveLength(1);
    expect(state.notifications[0]).toContain(
      "韩志薰在 。： 的帖子下发表了评论：有个哥占着浴室",
    );
    state = dispatch(work, JSON.parse(JSON.stringify(state)), "read", "bath-6");
    expect(state.notifications).toHaveLength(1);
    expect(work.data.weverse.some((i) => i.id === "wvs-like")).toBe(false);
  });
  it("renders the supplied avatar, certification, comment and date", () => {
    const { work } = compileStory(source);
    const html = renderToString(
      createElement(WeverseCommentNotice, {
        comment: work.data.weverse.find((i) => i.id === "wvs-jihoon")!,
        post: work.data.weverse.find((i) => i.id === "wvs-question")!,
        date: "2026-10-25",
        time: "23:28",
      }),
    );
    for (const text of [
      "韩志薰的头像",
      "艺人认证",
      "。：",
      "有个哥占着浴室",
      "TWS · 2026. 10. 25. 23:28",
    ])
      expect(html.replace(/<!--.*?-->/g, "")).toContain(text);
  });
});
