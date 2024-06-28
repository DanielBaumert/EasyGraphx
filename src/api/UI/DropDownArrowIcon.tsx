import { Component } from "solid-js";

const DropDownArrowIcon: Component = () =>
  <svg xmlns="http://www.w3.org/2000/svg"
    class="w-6 h-6 shrink-0 fill-gray-500 group-hover:fill-black"
    viewBox="0 0 20 20"
    fill="none">
    <path stroke-linecap="round"
      stroke-linejoin="round" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z">
    </path>
  </svg>;

export default DropDownArrowIcon;