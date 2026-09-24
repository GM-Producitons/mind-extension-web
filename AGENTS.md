## Memory rule (mandatory)

If the user tells you anything and says to remember it, or states a rule, convention, architecture decision, domain fact, or product flow that should persist across chats, **add it here immediately**. Do not keep it only in conversation. Keep this file current as we go.

When adding:

- Put the fact in the matching section below. Create a new section if none fits.
- Write it as a durable rule, not as chat recap.
- Do not delete earlier rules unless the user explicitly replaces them.
- Keep wording short and operational so a future agent can follow it without the original chat.

## Architecture (mandatory)

- **Dumb UI.** Components in `components/` render and handle UI-only behavior (open, close, layout, local input). Loading, mutations, validation flow, and business rules live in a custom hook. A component may call a hook; it does not own that logic.
- **Simple models.** New features get a small model that is easy to read. Add a field only when the feature reads or writes it. Shape or index a field when that is what keeps the query fast. Do not add soft-delete, audit, or extra status fields unless the feature needs them.
- **Repository → service → server action.** Match features that already do this (timeline):
  - `lib/*.repository.ts` — data access only.
  - `services/*.service.ts` — business rules. The action calls the service, not the repository.
  - `actions` or `apis` — `"use server"` boundary. Validate input, call the service, return a plain serializable `{ success, error, data }` result.
  - `hooks/` — client logic. Hooks call the server actions.
- Feature code stays in `src/features/<feature>/`. Shared mongoose models live in `src/features/shared/models`.

## UI density

- Copy is direct. Short labels and button text. Do not add helper paragraphs, step walkthroughs, or empty-state essays unless the user asks for guidance.
- Layouts stay compact: small controls, tight padding, short row heights. A surface takes the minimum space needed to show its data.
- Tables and lists show the relevant fields. Prefer many compact rows over a few large cards.
- Do not nest cards. A group header is a muted bar, not a card wrapping a card.
- One title per page, via `PageHeader` (`src/features/shared/template/page-header`). Do not render a second title block.

## Color, type, and icons

- Brand colors are defined only as tokens in `src/app/globals.css` (`:root` and `.dark`). Components use semantic classes: `bg-primary`, `text-primary-foreground`, `bg-background`, `bg-card`, `text-muted-foreground`, `border-border`.
- Do not hardcode hex, rgb, or one-off Tailwind colors (`bg-[#…]`, `text-white/70`, `bg-cyan-300`) on components.
- Buttons use the shared `Button` variants in `src/components/ui/button.tsx` only. Destructive actions use the `destructive` variant, which reads `--destructive`.
- Icons come from **lucide-react**, **@hugeicons/react** (`@hugeicons/core-free-icons`), or **react-icons**.
- Decorative icons are bare: semantic color and size, no rounded box, circle, or padded icon container. An icon-only control is the exception, because the button is the hit target. It needs a visible tooltip (`src/components/ui/tooltip.tsx`) and an `aria-label`.
- Motion uses **motion/react**.

## Where UI lives

- `src/components/ui` is shadcn primitives. Do not put feature UI there.
- Cross-feature templates go in `src/features/shared/template`.
- Cross-feature form controls go in `src/features/shared/components`.
- Feature screens go in `src/features/<feature>/components`.

## Shared controls

- Multi-value fields use `MultiSelect` (`src/features/shared/components/form/multi-select.tsx`).
- Dates use `DatePickerInput` (`src/components/date-picker.tsx`) or the form-builder date field. Do not use `type="date"` or `datetime-local`.
- Selects show the visible label, never the raw record id.
- A field with a leading icon uses `InputGroup` (`src/components/ui/input-group.tsx`).
- Numeric steppers are content-width (`w-fit`), not stretched.
- Every delete opens `ConfirmDialog` (`src/features/shared/template/confirm-dialog`). The confirm button uses the destructive `Button` variant.
- Toasts use `toast.success`, `toast.error`, or `toast` from `sonner`. The toaster is already mounted in `ClientProviders`. Do not mount a second one.

## Mobile (`max-width: 767px`)

- Layout chrome (sidebar, header, bottom nav, split panes) uses Tailwind `max-md:` / `md:` so the mobile layout is in CSS. The root layout boot script sets `data-viewport-mobile` before hydration. `useIsMobile` (`src/hooks/use-mobile.ts`) reads that attribute with `useSyncExternalStore`. Do not default the viewport in `useEffect`.
- Authenticated shells use a bottom nav instead of a sheet sidebar: Home (house icon), Create (+), Menu. Menu opens a glass panel with a spring-animated active pill (`motion/react`). The user row opens a profile `Drawer`. Profile editing on mobile uses that drawer. Desktop keeps the sidebar.
- Mobile menu root links are destinations. Home and create stay on the Home item and the + button. Grouped areas drill in (`>` on the root, `<` back) and list that group's children.
- Prefer `Drawer` (`src/components/ui/drawer.tsx`, `direction="bottom"`) over `Dialog` for profile, comments, attachments, and row detail. Primary actions sit in `DrawerFooter`. Detail editors are a `Dialog` on desktop and a bottom `Drawer` on mobile.
- List pages keep the bottom nav, use a sticky search header with `+` at the right end, and scroll the page. Do not add a nested scroll container around a list unless the pane is a fixed split (a sidebar beside an editor). Tap a card or row to open a detail drawer.
- Form routes hide the header and the bottom nav. Back is a `<` chevron only. A floating secondary action sits bottom-left and save sits bottom-right. Drag-and-drop mounts client-only.
- Split views open on the list, not the first item. The list keeps the bottom nav. The open item hides it. Back is the chevron only.
- Wide tables drop the sticky column and inline actions. Tap a row to open a detail drawer with every field and footer actions. Right-click or long-press still exposes the row actions.
- Multi-step create flows hide mobile chrome. Step rails are icon-only, with a dashed connector and a motion active pill. Choice tiles show icon + name only (`rounded-lg`). Fields stack. Back + Continue/Save stays sticky.
- Dashboard view mode stacks widgets: full width, no rounded corners, no vertical gap. KPI cards are one per row at `4.5rem`. Pie charts use `22rem`. Other charts and content use fixed row heights. Period or summary cards are full width, no radius, `border-b` only.

## Dashboards and charts

- Desktop dashboard widgets use `react-grid-layout` on a 12-column grid. Import `react-grid-layout/css/styles.css` with the grid.
- Charts use `ChartContainer` from `src/components/ui/chart.tsx` and recharts. Series colors come from the `--chart-*` tokens through `ChartConfig`.
- A refresh that changes nothing shows a spinner on the refresh icon and a toast. Do not replace the page with a skeleton.

## Client state

- **Zustand** for client state shared across components. Not for a single widget's local open/closed or input state.
- Server reads and writes go through the feature hook and its server actions. Do not add TanStack Query.
- Effects that fetch or set state need a stable guard (cancelled flag or equivalent). Do not put a state update in an effect without one. Do not leave an effect or hook dependency that refetches or rerenders in a loop.
