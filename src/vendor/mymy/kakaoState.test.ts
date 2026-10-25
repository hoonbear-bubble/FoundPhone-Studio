import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { MymyKakao } from "./Apps";
import { displayedKakaoItems, clearKakaoThread } from "./kakaoState";
import { compileStory } from "../../story-engine/compiler";
import { initialRuntime } from "../../schema";
import { visible } from "../../engine";
import source from "../../../stories/template/story.json";
const { work } = compileStory(source);
const items = work.data.kakao.filter((i) => visible(i, initialRuntime(work)));
const title = "小屎狗💗";
const props = {
  owner: "韩志薰",
  name: "KakaoTalk",
  thread: "",
  creator: false,
  items,
  onUi() {},
  onRead() {},
  onItem() {},
  onAdd() {},
  onBack() {},
  onThread() {},
};
describe("Kakao player message visibility and deletion", () => {
  it("does not reveal scripted messages in the list or conversation before tapping", () => {
    const list = renderToString(createElement(MymyKakao, props));
    const chat = renderToString(
      createElement(MymyKakao, { ...props, thread: title }),
    );
    for (const text of [
      "哥在洗手间睡着了吗？",
      "再催我我就住在里面",
      "哥说什么呢快点出来",
      "我出去绝对饶不了你",
    ]) {
      expect(list).not.toContain(text);
      expect(chat).not.toContain(text);
    }
    expect(chat).toContain('placeholder="输入消息"');
  });
  it("shows only revealed messages after the nickname changes", () => {
    const chat = renderToString(
      createElement(MymyKakao, {
        ...props,
        thread: title,
        ui: { bathTapStepV4: 3 },
      }),
    );
    expect(chat).toContain("哥在洗手间睡着了吗？");
    expect(chat).not.toContain("你已读了就不要装死");
    expect(chat).toContain("轻触聊天区域");
  });
  it("keeps individual deletions after save reload and does not alter other chats", () => {
    const deleted = JSON.parse(JSON.stringify(["bath-0"]));
    const shown = displayedKakaoItems(items, 7, deleted);
    expect(shown.some((i) => i.id === "bath-0")).toBe(false);
    expect(shown.some((i) => i.id === "bath-1")).toBe(true);
    expect(shown.some((i) => i.title === "妈妈")).toBe(true);
  });
  it("clears a whole thread including unrevealed authored messages", () => {
    const deleted = clearKakaoThread(items, title, []);
    expect(
      displayedKakaoItems(items, 7, deleted).some((i) => i.title === title),
    ).toBe(false);
    expect(
      displayedKakaoItems(items, 7, deleted).some((i) => i.title === "姐姐"),
    ).toBe(true);
    expect(clearKakaoThread(items, title, deleted)).toEqual(deleted);
  });
  it("contains only the supplied opening dialogue and retains named contacts", () => {
    expect(
      source.chats
        .find((c) => c.id === "secret-chat")!
        .messages.some((m) => m.id.startsWith("secret-chat-")),
    ).toBe(false);
    for (const name of [
      "申申申申惟哥🍓",
      "小屎狗💗",
      "英宰哥🐶",
      "韩振xi🐰",
      "我们可爱的忙内🐹",
    ])
      expect(source.contacts.some((c) => c.name === name)).toBe(true);
  });
});
