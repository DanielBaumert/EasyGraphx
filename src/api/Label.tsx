import { Component } from "solid-js";

export const Label: Component<{ title: string }> = (props) =>
  <label class=" text-sm font-medium text-gray-700 w-100-full">{props.title}</label>


export const SmallLabel: Component<{ title: string }> = (props) =>
    <label class="text-xs font-small text-gray-500 w-100-full">{props.title}</label>

