# vite-package-ui

Atomic React UI components (`MButton`, `MCard`, `MDropdown`, `MModal`, `MInput`, …) — style bằng Tailwind CSS v4 + design tokens trích từ **Tailwick** admin template.

Không có layout (sidenav / topbar / header) — chỉ atomic components. Ship dạng **source** (`.jsx` + `.css`); consumer dùng Vite + `@tailwindcss/vite` sẽ tự transpile.

---

## Cài đặt

Package chưa publish lên npm registry — cài trực tiếp từ GitHub:

```bash
npm install github:<user>/vite-package-ui
# hoặc pin commit / branch / tag:
npm install github:<user>/vite-package-ui#main
```

Yêu cầu peer deps ở project consumer:

```bash
npm install react react-dom
npm install -D tailwindcss @tailwindcss/vite @vitejs/plugin-react vite
```

## Setup nhanh (project mới)

### 1. `vite.config.js`

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

### 2. Entry CSS

Trong `src/main.css` (hoặc file gốc), chỉ cần 1 dòng import:

```css
@import "vite-package-ui/styles";
```

File này đã bao gồm:
- `@import "tailwindcss";`
- `@source` chỉ Tailwind quét class names bên trong `node_modules/vite-package-ui/src/components/**/*.jsx`
- Theme tokens (`themes.css`)
- Component styles (`_buttons.css`, `_card.css`, `_forms.css`, `_modal.css`, `_badge.css`, `_alert.css`, `_dropdown.css`, …)

### 3. Entry JS

Trong `src/main.jsx`:

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import "./main.css"; // ← chỗ import CSS phía trên

import { MButton, MCard, MInput, MModal, MDropdown } from "vite-package-ui";

function App() {
  return (
    <MCard title="Ví dụ">
      <MInput label="Họ tên" placeholder="Nhập họ tên" />
      <div className="mt-4 flex gap-2">
        <MButton variant="primary">Lưu</MButton>
        <MButton variant="default" fill="soft">Huỷ</MButton>
      </div>
    </MCard>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
```

---

## Components

Xem file source (`src/components/M*.jsx`) — mỗi component có prop docs trong comment đầu file.

| Component | Props chính |
|---|---|
| `MButton` | `variant`, `fill` (`solid`/`soft`/`outline`), `size`, `loading`, `leftIcon`, `rightIcon` |
| `MCard` + `.Header/.Body/.Footer/.Title` | `title`, `actions`, `footer` (compact) hoặc composable |
| `MInput` | `label`, `hint`, `error`, `size`, `leftAddon`, `rightAddon` |
| `MTextarea` | `label`, `hint`, `error`, `rows` |
| `MSelect` | `options` (array) hoặc children `<option>` |
| `MCheckbox` / `MRadio` / `MSwitch` | `label`, forward native input props |
| `MBadge` | `variant`, `fill`, `size` |
| `MAlert` | `variant`, `fill`, `title`, `icon`, `dismissible`, `onClose` |
| `MDropdown` + `.Item/.Divider/.Header` | **Action menu**: `trigger`, `align`, `placement`, children `<MDropdown.Item>`.<br>**Select mode** (thay native `<select>`): `items` (`[{value,label,disabled?}]`), `value`, `onChange`, `searchable`, `placeholder`, `label`, `hint`, `error`. Bàn phím ↑↓ + Enter + Esc. |
| `MModal` + `.Header/.Body/.Footer` | `open`, `onClose`, `size`, `title`, `footer`, `dismissable` |

## Design tokens

Kế thừa từ Tailwick — 6 color role (`primary` blue, `secondary` violet, `success` green, `info` sky, `warning` amber, `danger` orange), thang `default-50 → 950` (zinc), font body DM Sans. Dark mode kích hoạt bằng `data-theme="dark"` hoặc class `.dark` trên phần tử cha.

Custom token: sửa file `.css` của consumer, override sau `@import "vite-package-ui/styles"`:

```css
@import "vite-package-ui/styles";

@theme {
  --color-primary: var(--color-emerald-500);
}
```

## Chạy demo trong package

```bash
npm install
npm run dev
```

Vite dev server sẽ chạy ở port `5174`.
