import { Component, JSX, onCleanup } from "solid-js";

export const CheckBox : Component<{
    id: string,
    title:string, 
    value:boolean,
    onChanges:JSX.EventHandlerUnion<HTMLInputElement, Event>}> = (props) => {
    return (
        <div class="flex items-center mb-2 p-1 rounded hover:shadow">
            <input 
                id={`checkbox-${props.id}`} 
                class="w-3.5 h-3.5 text-sky-600 bg-gray-100 border-gray-300 rounded"
                onChange={props.onChanges} type="checkbox" checked={props.value} />
            <label for={`checkbox-${props.id}`} class="pl-2 text-sm text-gray-900 w-full">{props.title}</label>
        </div>);
}