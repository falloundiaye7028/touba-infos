import { describe, expect, it } from "vitest";
import { SENEGAL_PHONE, slugify } from "../touba-infos-ebooks";
describe("Touba Infos ebooks", () => {
 it("accepte les numéros sénégalais", () => { expect(SENEGAL_PHONE.test("771234567")).toBe(true); expect(SENEGAL_PHONE.test("+221771234567")).toBe(true); });
 it("refuse les numéros non sénégalais", () => { expect(SENEGAL_PHONE.test("0612345678")).toBe(false); });
 it("génère un slug sûr", () => { expect(slugify("L’Économie à Touba !")).toBe("l-economie-a-touba"); });
});
