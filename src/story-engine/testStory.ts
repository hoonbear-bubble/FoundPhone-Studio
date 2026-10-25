import { initialRuntime, type Work } from "../schema";
import { dispatch, advance, choose, visible } from "../engine";
import type { Story } from "./compiler";
export function testStory(story: Story, work: Work) {
  const errors: string[] = [];
  if (work.nodes.some((n) => n.type !== "comment") && !story.tests.length)
    errors.push("tests: 至少提供一个通关路径");
  const reached = new Set<string>();
  for (const t of story.tests) {
    let state = dispatch(work, initialRuntime(work), "start");
    const unlocked = new Set<string>();
    for (const [i, step] of t.steps.entries()) {
      const at = `tests.${story.tests.indexOf(t)}.steps.${i}`;
      if (step.password !== undefined) {
        const item = Object.values(work.data)
          .flat()
          .find((x) => x.id === step.target);
        if (!item || item.password !== step.password) {
          errors.push(at + ": 密码不正确");
          continue;
        }
        unlocked.add(item.id);
      }
      if (step.event === "read") {
        const item = Object.values(work.data)
          .flat()
          .find((x) => x.id === step.target);
        if (
          !item ||
          !visible(item, state) ||
          (item.password && !unlocked.has(item.id))
        ) {
          errors.push(at + ": 内容不可读或未解密");
          continue;
        }
      }
      if (step.choose) {
        if (!state.choices.some((c) => c.target === step.choose))
          errors.push(at + ": 选项不可达");
        state = choose(work, state, step.choose);
      }
      if (step.advanceMs !== undefined)
        state = advance(work, state, step.advanceMs);
      if (step.event) state = dispatch(work, state, step.event, step.target);
    }
    if (t.ending && !state.endings.includes(t.ending))
      errors.push(t.name + ": 未到达结局 " + t.ending);
    else reached.add(t.ending);
    for (const id of t.expectUnlocked)
      if (!state.unlocked.includes(id)) errors.push(t.name + ": 未解锁 " + id);
  }
  for (const n of work.nodes.filter((n) => n.type === "ending")) {
    const ending = String(
      n.actions.find((a) => a.type === "ending")?.value || n.label,
    );
    if (!reached.has(ending))
      errors.push(
        "events." +
          work.nodes.indexOf(n) +
          ": 结局没有可通过的测试路径: " +
          ending,
      );
  }
  return errors;
}
