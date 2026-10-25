import { describe, it, expect } from "vitest";
import source from "../../stories/template/story.json";
import { compileStory } from "./compiler";
import { testStory } from "./testStory";
import { dispatch, visible } from "../engine";
import { initialRuntime } from "../schema";
describe("secret romance exploratory story", () => {
  it("tests both reply paths without forcing an ending", () => {
    const { story, work } = compileStory(source);
    expect(testStory(story, work)).toEqual([]);
    const bad = structuredClone(story);
    bad.tests[0].expectUnlocked.push("bath-branch-2-0");
    expect(testStory(bad, work).length).toBeGreaterThan(0);
  });
  for (const branch of [1, 2])
    it(`keeps branch ${branch} exclusive and survives save roundtrip`, () => {
      const { work } = compileStory(source);
      let state = initialRuntime(work);
      const item = (id: string) =>
        Object.values(work.data)
          .flat()
          .find((i) => i.id === id)!;
      expect(visible(item("wvs-question"), state)).toBe(false);
      expect(visible(item("bath-threat"), state)).toBe(false);
      state = dispatch(work, state, "read", "bath-6");
      expect(visible(item("wvs-question"), state)).toBe(true);
      state = dispatch(work, state, "read", "wvs-cp-2");
      expect(state.notifications.at(-1)).toContain("小屎狗");
      state = dispatch(work, state, "read", `bath-choice-${branch}`);
      state = JSON.parse(JSON.stringify(state));
      expect(visible(item(`bath-branch-${branch}-0`), state)).toBe(true);
      expect(visible(item(`bath-branch-${3 - branch}-0`), state)).toBe(false);
      expect(visible(item("bath-choice-1"), state)).toBe(false);
      expect(visible(item("bath-choice-2"), state)).toBe(false);
      expect(state.endings).toEqual([]);
      state = dispatch(work, state, "read", `bath-choice-${3 - branch}`);
      expect(state.variables.bathBranch).toBe(branch);
    });
});
