import { describe, expect, it } from "vitest";

import { safeJsonLd } from "../json-ld";

describe("safeJsonLd", () => {
  it("empêche de fermer la balise script", () => {
    const out = safeJsonLd({ headline: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("</script>");
    expect(out).not.toContain("<");
  });

  it("reste un JSON équivalent", () => {
    const data = { a: "<b>&</b>", b: "ligne suite", c: [1, "x>y"] };
    expect(JSON.parse(safeJsonLd(data))).toEqual(data);
  });
});
