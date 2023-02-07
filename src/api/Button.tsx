import { Component } from "solid-js"
import { JSX } from "solid-js/jsx-runtime"

export const Button: Component<{ 
    title: string, 
    onclick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> 
}> = (props) => (
    <button class="
            py-1 w-full rounded mb-1 
            border border-gray-200 
            text-sm font-medium text-gray-700 
            hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-500 hover:text-white hover:shadow"
        onclick={props.onclick}>
        {props.title}
    </button>);