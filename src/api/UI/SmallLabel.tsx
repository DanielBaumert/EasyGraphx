import { Component } from "solid-js";

const SmallLabel: Component<{ title: string; }> = (props) => 
  <label class="text-xs font-small text-gray-500 w-100-full select-none">{props.title}</label>;

export default SmallLabel;