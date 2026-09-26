import { createRoot } from "react-dom/client";
import { useState } from "react";
import { Select } from "@sonamu-kit/react-components/components";
// Kit styles make cmdk's highlighted item (data-selected) visible; behavior does not depend on them.
import "@sonamu-kit/react-components/styles";

const KEYS = ["a", "b", "c"] as const;
type Key = (typeof KEYS)[number];
const items = [
  { value: "a", label: "A 정렬" },
  { value: "b", label: "B 정렬" },
  { value: "c", label: "C 정렬" },
] satisfies { value: Key; label: string }[];

function App() {
  // ?searchable=1 renders the control case; otherwise the default (non-searchable) Select.
  const searchable = new URLSearchParams(location.search).get("searchable") === "1";
  const [value, setValue] = useState<Key>("a");
  return (
    <main>
      <button>before</button>
      <Select
        items={items}
        valueKey={(k: Key) => k}
        value={value}
        onValueChange={(k: Key | undefined) => k && setValue(k)}
        searchable={searchable}
      />
      <output data-testid="value">{value}</output>
    </main>
  );
}
createRoot(document.getElementById("root") as HTMLElement).render(<App />);
