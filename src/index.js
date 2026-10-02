/*
 * vite-package-ui — atomic React components (M-prefixed) + Tailwick tokens.
 *
 * Import CSS 1 lần trong entry của consumer (main.jsx / App entry):
 *   import 'vite-package-ui/styles';
 */

export { MButton } from "./components/MButton.jsx";
export {
  MCard,
  MCardHeader,
  MCardBody,
  MCardFooter,
  MCardTitle,
} from "./components/MCard.jsx";
export { MInput } from "./components/MInput.jsx";
export { MTextarea } from "./components/MTextarea.jsx";
export { MSelect } from "./components/MSelect.jsx";
export { MCheckbox } from "./components/MCheckbox.jsx";
export { MRadio } from "./components/MRadio.jsx";
export { MSwitch } from "./components/MSwitch.jsx";
export { MBadge } from "./components/MBadge.jsx";
export { MAlert } from "./components/MAlert.jsx";
export { MDropdown } from "./components/MDropdown.jsx";
export { MModal } from "./components/MModal.jsx";
export {
  MModalConfirm,
  useMModalConfirm,
} from "./components/MModalConfirm.jsx";
export {
  MToast,
  MToastContainer,
  useMToast,
} from "./components/MToast.jsx";
export { MSegmented } from "./components/MSegmented.jsx";

export { cn } from "./utils/cn.js";
