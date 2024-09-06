import { Component } from "solid-js";

const Label: Component<{ title: string; }> = (props) =>
  <label class=" text-sm font-medium text-gray-700 w-100-full select-none">{props.title}</label>;

export default Label;


