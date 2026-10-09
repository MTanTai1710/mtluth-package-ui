import React, { useState } from "react";
import {
  MButton,
  MCard,
  MInput,
  MTextarea,
  MSelect,
  MCheckbox,
  MRadio,
  MSwitch,
  MBadge,
  MAlert,
  MDropdown,
  MModal,
  MSegmented,
  MPagination,
  useMPagination,
} from "../src/index.js";

/*
 * Playground — page nhanh kiểm tra visual mọi component.
 * Không phải shipped code — chỉ có ở dev.
 */

export function Playground() {
  const [dark, setDark] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [switchOn, setSwitchOn] = useState(true);
  const [radio, setRadio] = useState("a");
  const [checked, setChecked] = useState(false);
  const [role, setRole] = useState("admin");
  const [country, setCountry] = useState("");
  const [logic, setLogic] = useState("and");
  const [view, setView] = useState("list");

  // Fake dataset cho MPagination demo (23 items → 3 trang nếu size=10).
  const PAGINATION_DATA = React.useMemo(
    () =>
      Array.from({ length: 23 }, (_, i) => ({
        id: i + 1,
        name: `Item #${String(i + 1).padStart(2, "0")}`,
      })),
    [],
  );
  const pager = useMPagination(PAGINATION_DATA, 10);
  const [controlledPage, setControlledPage] = useState(1);

  const COUNTRIES = [
    { value: "vn", label: "Việt Nam" },
    { value: "us", label: "United States" },
    { value: "jp", label: "Japan" },
    { value: "kr", label: "South Korea" },
    { value: "sg", label: "Singapore" },
    { value: "th", label: "Thailand" },
    { value: "id", label: "Indonesia" },
    { value: "ph", label: "Philippines" },
    { value: "my", label: "Malaysia" },
    { value: "cn", label: "China" },
    { value: "tw", label: "Taiwan" },
    { value: "hk", label: "Hong Kong" },
    { value: "au", label: "Australia" },
    { value: "de", label: "Germany" },
    { value: "fr", label: "France" },
  ];

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-default-900">vite-package-ui</h1>
          <MSwitch
            label={dark ? "Dark" : "Light"}
            checked={dark}
            onChange={(e) => setDark(e.target.checked)}
          />
        </div>

        <MCard title="Buttons">
          <div className="flex flex-wrap gap-2">
            <MButton variant="primary">Primary</MButton>
            <MButton variant="secondary">Secondary</MButton>
            <MButton variant="success">Success</MButton>
            <MButton variant="info">Info</MButton>
            <MButton variant="warning">Warning</MButton>
            <MButton variant="danger">Danger</MButton>
            <MButton variant="default">Default</MButton>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <MButton variant="primary" fill="soft">Soft</MButton>
            <MButton variant="primary" fill="outline">Outline</MButton>
            <MButton variant="ghost">Ghost</MButton>
            <MButton size="sm">Small</MButton>
            <MButton size="lg">Large</MButton>
            <MButton loading>Loading…</MButton>
            <MButton disabled>Disabled</MButton>
          </div>
        </MCard>

        <MCard title="Badges">
          <div className="flex flex-wrap gap-2">
            <MBadge variant="primary">Primary</MBadge>
            <MBadge variant="success" fill="solid">Success</MBadge>
            <MBadge variant="warning" fill="outline">Warning</MBadge>
            <MBadge variant="danger" size="lg">Danger lg</MBadge>
            <MBadge variant="info" size="sm">Info sm</MBadge>
          </div>
        </MCard>

        <MCard title="Alerts">
          <div className="space-y-2">
            <MAlert variant="info" title="Info">Đây là alert kiểu info.</MAlert>
            <MAlert variant="success" title="Thành công" dismissible>Đã lưu.</MAlert>
            <MAlert variant="warning" fill="solid">Cảnh báo dạng solid.</MAlert>
            <MAlert variant="danger">Có lỗi xảy ra.</MAlert>
          </div>
        </MCard>

        <MCard title="Form controls">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MInput label="Email" type="email" placeholder="you@example.com" required />
            <MInput label="Mật khẩu" type="password" hint="Ít nhất 8 ký tự" />
            <MInput label="Lỗi" error="Trường bắt buộc" placeholder="…" />
            <MSelect
              label="Vai trò"
              placeholder="-- chọn --"
              options={[
                { value: "admin", label: "Admin" },
                { value: "user", label: "User" },
              ]}
            />
            <MTextarea
              label="Ghi chú"
              placeholder="…"
              containerClassName="md:col-span-2"
            />
            <div className="flex flex-wrap gap-4 items-center">
              <MCheckbox
                label="Đồng ý"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
              />
              <MRadio
                label="A"
                name="grp"
                value="a"
                checked={radio === "a"}
                onChange={(e) => setRadio(e.target.value)}
              />
              <MRadio
                label="B"
                name="grp"
                value="b"
                checked={radio === "b"}
                onChange={(e) => setRadio(e.target.value)}
              />
              <MSwitch
                label="Bật thông báo"
                checked={switchOn}
                onChange={(e) => setSwitchOn(e.target.checked)}
              />
            </div>
          </div>
        </MCard>

        <MCard title="Segmented control">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-default-600 w-24">Logic:</span>
              <MSegmented
                value={logic}
                onChange={setLogic}
                options={[
                  { value: "and", label: "AND" },
                  { value: "or", label: "OR" },
                ]}
              />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-default-600 w-24">View:</span>
              <MSegmented
                size="sm"
                value={view}
                onChange={setView}
                options={[
                  { value: "list", label: "List" },
                  { value: "grid", label: "Grid" },
                  { value: "kanban", label: "Kanban" },
                  { value: "calendar", label: "Calendar", disabled: true },
                ]}
              />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-default-600 w-24">Full width:</span>
              <div className="flex-1">
                <MSegmented
                  fullWidth
                  variant="success"
                  value={view}
                  onChange={setView}
                  options={[
                    { value: "list", label: "List" },
                    { value: "grid", label: "Grid" },
                    { value: "kanban", label: "Kanban" },
                  ]}
                />
              </div>
            </div>
          </div>
        </MCard>

        <MCard title="Dropdown — action menu">
          <div className="flex gap-3">
            <MDropdown trigger={<MButton variant="default">Menu ▾</MButton>}>
              <MDropdown.Header>Actions</MDropdown.Header>
              <MDropdown.Item onClick={() => alert("edit")}>Sửa</MDropdown.Item>
              <MDropdown.Item onClick={() => alert("duplicate")}>Nhân bản</MDropdown.Item>
              <MDropdown.Divider />
              <MDropdown.Item danger onClick={() => alert("delete")}>Xoá</MDropdown.Item>
            </MDropdown>
            <MButton variant="primary" onClick={() => setModalOpen(true)}>
              Mở Modal
            </MButton>
          </div>
        </MCard>

        <MCard title="Dropdown — select mode (thay native <select>)">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MDropdown
              label="Vai trò"
              placeholder="Chọn vai trò"
              value={role}
              onChange={setRole}
              items={[
                { value: "admin", label: "Admin" },
                { value: "user", label: "User" },
                { value: "guest", label: "Guest", disabled: true },
              ]}
            />
            <MDropdown
              label="Quốc gia (searchable)"
              placeholder="Chọn quốc gia..."
              searchable
              value={country}
              onChange={setCountry}
              items={COUNTRIES}
              hint="Gõ để lọc — ↑↓ + Enter để chọn"
            />
          </div>
        </MCard>

        <MCard title="Pagination (useMPagination + MPagination)">
          <div className="rounded-lg border border-default-200 bg-card overflow-hidden">
            <table className="min-w-full divide-y divide-default-200">
              <thead className="bg-default-150">
                <tr className="text-sm font-normal text-default-700">
                  <th className="px-3.5 py-3 text-start w-16">#</th>
                  <th className="px-3.5 py-3 text-start">Name</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-default-200">
                {pager.pageItems.map((it) => (
                  <tr key={it.id} className="text-default-800 text-sm">
                    <td className="px-3.5 py-2 font-mono">{it.id}</td>
                    <td className="px-3.5 py-2">{it.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-default-200">
              <MPagination
                page={pager.page}
                pageCount={pager.pageCount}
                pageSize={pager.pageSize}
                total={pager.total}
                onPageChange={pager.setPage}
              />
            </div>
          </div>

          <div className="mt-4 text-xs text-default-500">
            Controlled (dataset lớn, 42 trang — demo ellipsis):
          </div>
          <MPagination
            page={controlledPage}
            pageSize={10}
            total={420}
            onPageChange={setControlledPage}
          />
        </MCard>

        <MModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Xác nhận"
          footer={
            <>
              <MButton variant="default" fill="soft" onClick={() => setModalOpen(false)}>
                Huỷ
              </MButton>
              <MButton variant="primary" onClick={() => setModalOpen(false)}>
                Đồng ý
              </MButton>
            </>
          }
        >
          <p>Bạn có chắc muốn thực hiện thao tác này?</p>
        </MModal>
      </div>
    </div>
  );
}
