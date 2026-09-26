# Sonamu kit `Select` keyboard PoC

This repository reproduces a keyboard defect in `Select` from `@sonamu-kit/react-components@0.4.8`.

With default props (no `searchable`), you cannot change the value with the keyboard only.
The popup opens, but ArrowDown and Enter do not reach the option list.
If you add `searchable`, the same keys work.

## Result

Run on 2026-09-26: macOS 27.0 arm64, Node 24.18.0, Playwright 1.63.0 (bundled headless browsers).

| Browser | `select` (default) | `select-searchable` (control) |
|---|---|---|
| Chromium | Fail: `Expected: "b"`, `Received: "a"` | Pass |
| Firefox | Fail: `Expected: "b"`, `Received: "a"` | Pass |
| WebKit | Fail: `Expected: "b"`, `Received: "a"` | Pass |

The focus log is the same in all three browsers:

```text
[select] Tab        -> BUTTON role=combobox slot=popover-trigger | insideCmdkRoot=false | highlighted=-
[select] Enter      -> DIV role=dialog slot=popover-content | insideCmdkRoot=false | highlighted=A 정렬
[select] ArrowDown  -> DIV role=dialog slot=popover-content | insideCmdkRoot=false | highlighted=A 정렬
[select] Enter      -> DIV role=dialog slot=popover-content | insideCmdkRoot=false | highlighted=A 정렬
[select-searchable] Tab        -> BUTTON role=combobox slot=popover-trigger | insideCmdkRoot=false | highlighted=-
[select-searchable] Enter      -> INPUT[cmdk-input] role=combobox slot=null | insideCmdkRoot=true | highlighted=A 정렬
[select-searchable] ArrowDown  -> INPUT[cmdk-input] role=combobox slot=null | insideCmdkRoot=true | highlighted=B 정렬
[select-searchable] Enter      -> BUTTON role=combobox slot=popover-trigger | insideCmdkRoot=false | highlighted=-
```

The only difference between the two tests is the `searchable` prop.

## Run it

Port 5199 must be free. Playwright starts its own Vite server on that port.

```bash
npm ci
npx playwright install chromium firefox webkit
npm run typecheck
npx playwright test --browser=chromium --reporter=list --workers=1
npx playwright test --browser=firefox --reporter=list --workers=1
npx playwright test --browser=webkit --reporter=list --workers=1
```

To look at it in a browser, run `npx vite` and open these pages:

- `http://localhost:5199/` shows the default `Select` (defect).
- `http://localhost:5199/?searchable=1` shows `Select` with `searchable` (control).

## Files

- `main.tsx`: the page. It renders one `Select` with three items. The query `?searchable=1` switches to the control case.
- `poc.spec.ts`: presses `Tab`, `Enter`, `ArrowDown`, `Enter`. After each key it logs the DOM focus and the cmdk highlighted item. Then it expects the value `b`.

## How to read the log

cmdk does not move DOM focus to an option. It marks the highlighted option with `[cmdk-item][data-selected="true"]`.
For this reason, the test logs DOM focus and the highlighted item separately.
If you check only `document.activeElement`, the working `searchable` case also looks like a failure.

## Cause

Source: `cartanova-ai/sonamu` at commit `853f3b0` (`modules/react-components`, version 0.4.8).

1. `select.tsx:529` sets `isSearchable = props.searchable ?? isAsync`. A sync `Select` has no search input by default.
2. `select.tsx:722-735` renders `PopoverContent` > `Command` (cmdk) > `CommandInput` (only if `isSearchable`) + `CommandList`.
3. `popover.tsx` passes props to the Radix `Content`. It does not set `onOpenAutoFocus`.
4. Without a search input, Radix moves focus to the popup frame (`role=dialog`). This frame is the parent of `[cmdk-root]`.
5. cmdk handles keys only on its root or inside it. So ArrowDown and Enter do not reach cmdk.

Inference, not tested: moving focus to `[cmdk-root]` when the popup opens can fix the defect.

`EnumSelect` in single mode renders `Select` without `searchable` (`enum-select.tsx:52-68`). Inference: it has the same defect. This PoC does not test it.

## Not verified

- Only Playwright bundled headless browsers were used. Installed Chrome, Firefox, and Safari apps were not tested.
- In macOS Safari, Tab does not move to buttons by default. The `Tab` step can differ there.
- Mobile browsers and on-screen keyboards were not tested.
- `multiple` and `async` modes were not tested.
- A fix in the kit code was not tested.
