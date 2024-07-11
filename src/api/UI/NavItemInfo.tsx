import { JSX } from "solid-js";
type NavItemInfo = {
  title: string;
  hidden?: boolean;
  onclick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>;
  classExt?: string;
};

export default NavItemInfo;