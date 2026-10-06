import { describe, expect, it } from "vitest";
import { STORY } from "./story";
import { lintStory, storyStrings as strings } from "@/design-system/demo/copy-lint";

const keys = (o: unknown): string[] => o && typeof o === "object" && !Array.isArray(o) ? Object.entries(o).filter(([k]) => k !== "before" && k !== "after").flatMap(([k, v]) => [k, ...keys(v).map(x => `${k}.${x}`)]) : [];

describe("Identidad 360 story copy", () => {
  it("has the same shape in English and Spanish", () => expect(keys(STORY.es)).toEqual(keys(STORY.en)));

  it("has no empty strings except the owner-supplied why note", () => {
    for (const locale of ["en", "es"] as const) {
      const { why, ...rest } = STORY[locale];
      expect(why.title.trim()).not.toBe("");
      for (const s of strings(rest)) expect(s.trim(), `${locale}: empty string`).not.toBe("");
    }
  });

  it("avoids AI-sounding patterns and brand names", () => {
    for (const locale of ["en", "es"] as const) {
      expect(lintStory(STORY[locale]), locale).toEqual([]);
      for (const [a, b] of [[{ mismatched: 0, waiting: 4 }, { mismatched: 6, waiting: 0 }], [{ mismatched: 0, waiting: 1 }, { mismatched: 1, waiting: 0 }], [{ mismatched: 0, waiting: 0 }, { mismatched: 0, waiting: 0 }]] as const) expect(lintStory({ s: STORY[locale].compare.sentence(a, b) })).toEqual([]);
    }
  });

  it("names the analyst count in the bet, singular and plural", () => {
    expect(STORY.es.tryIt.question(2)).toContain("con 2 analistas hoy");
    expect(STORY.es.tryIt.question(1)).toContain("con 1 analista hoy");
    expect(STORY.en.tryIt.question(1)).toContain("with 1 analyst today");
  });

  it("states the comparison truthfully", () => {
    expect(STORY.es.compare.sentence({ mismatched: 0, waiting: 4 }, { mismatched: 6, waiting: 0 })).toBe("Cruzando datos, 4 perfiles esperan a mañana. Sin cruzarlos todo parece listo hoy, y 6 perfiles quedaron armados con piezas que no cuadran.");
    expect(STORY.es.compare.sentence({ mismatched: 0, waiting: 0 }, { mismatched: 6, waiting: 0 })).toContain("nadie tuvo que esperar");
    expect(STORY.en.compare.sentence({ mismatched: 0, waiting: 0 }, { mismatched: 0, waiting: 0 })).toContain("same profiles");
  });

  it("sizes the puzzle label from the run", () => {
    expect(STORY.en.scene.puzzle.summary(3, 2, 1, 7)).toMatch(/^Puzzle of 7 profiles/);
    expect(STORY.es.scene.puzzle.summary(3, 2, 1, 7)).toMatch(/^Rompecabezas de 7 perfiles/);
  });
});
