import { Component } from "solid-js";
import NavItemInfo from "./NavItemInfo";

const NavItem: Component<NavItemInfo> = (props) => (
  <button class={`
        bg-white
        px-8 py-2
        text-left
        border border-gray-200 
        text-sm font-medium text-gray-700  
        hover:text-white ${props.classExt ? props.classExt : ""}`}
    hidden={props.hidden ?? false}
    onclick={props.onclick}>
    {props.title}
  </button>);

export default NavItem;
