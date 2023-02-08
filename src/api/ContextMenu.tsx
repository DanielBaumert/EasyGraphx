import { Component, createSignal, For, JSX, ParentComponent } from "solid-js";
import { Point } from "./DrawUtils";

export type ItemInfo = { 
    title: string,
    hidden?: boolean,
    onclick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> 
}

export const NavItem : Component<ItemInfo> = (props) => (
    <button class="
        bg-white
        px-8 py-2 w-full
        text-left
        border border-gray-200 
        text-sm font-medium text-gray-700 
        hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-500 
        hover:text-white"
        hidden={props.hidden ?? false}
        onclick={props.onclick}>
        {props.title}
    </button>);

export const ContextMenu : ParentComponent<{
    location: Point,
    hidden:boolean
}> = (props) => { 
    return (
        <div class={`
            ${props.hidden ? 'hidden' : ''}
            fixed flex flex-col 
            min-w-230 z-10 shadow-md`} 
            style={{
                left: `${props.location?.x ?? 0}px`,
                top: `${props.location?.y ?? 0}px`
            }}>
            {props.children}
        </div>
    );
}