import { describe, expect, it } from "vitest";
import { addId, parseWatchlist, removeId, serializeWatchlist } from "./storage";

describe("parseWatchlist", () => {
  it("treats a missing entry as an empty, healthy list", () => {
    expect(parseWatchlist(null)).toEqual({ ids: [], status: "ok" });
    expect(parseWatchlist("[]")).toEqual({ ids: [], status: "ok" });
  });

  it("restores a valid list in order", () => {
    expect(parseWatchlist('["b","a"]')).toEqual({ ids: ["b", "a"], status: "ok" });
  });

  it("removes duplicates and ignores non-string entries", () => {
    expect(parseWatchlist('["a","a",3,null,"b",""]')).toEqual({ ids: ["a", "b"], status: "ok" });
  });

  it.each(["not json", "{", '{"a":1}', "42", '"text"', "[1,2,3]"])(
    "marks %s as corrupted and returns an empty list",
    (raw) => {
      expect(parseWatchlist(raw)).toEqual({ ids: [], status: "corrupted" });
    },
  );
});

describe("addId / removeId", () => {
  it("prevents duplicates and keeps the same reference when nothing changes", () => {
    const ids = ["a"] as const;
    expect(addId(ids, "a")).toBe(ids);
    expect(addId(ids, "b")).toEqual(["a", "b"]);
    expect(removeId(ids, "zzz")).toBe(ids);
    expect(removeId(["a", "b"], "a")).toEqual(["b"]);
  });

  it("round-trips through serialize and parse", () => {
    const ids = ["x", "y"];
    expect(parseWatchlist(serializeWatchlist(ids)).ids).toEqual(ids);
  });
});
