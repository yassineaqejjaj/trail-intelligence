import { describe, expect, it } from "vitest";
import { translate, type Dict } from "./translate";
import { dirOf } from "./config";

const dict: Dict = { fr: { "Hello {name}": "Bonjour {name}" }, ar: { "Hello {name}": "مرحبا {name}" } };
describe("translate", () => {
  it("uses English as the key and fallback", () => {
    expect(translate(dict, "en", "Hello {name}", { name: "A" })).toBe("Hello A");
    expect(translate(dict, "fr", "Hello {name}", { name: "A" })).toBe("Bonjour A");
    expect(translate(dict, "ar", "Hello {name}", { name: "A" })).toBe("مرحبا A");
    expect(translate(dict, "fr", "Missing")).toBe("Missing");
  });
  it("is RTL only for Arabic", () => { expect(dirOf("ar")).toBe("rtl"); expect(dirOf("fr")).toBe("ltr"); });
});
