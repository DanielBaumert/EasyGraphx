import { For, Component, Show, createSignal } from "solid-js";
import { store } from "./Store";
import { selectedClass } from "./Signals";
import { canvas } from "./Canvas";

export const Comboxbox: Component<{
  title: string
}> = (props) => {
  let comboboxSearch : HTMLInputElement;
  let comboboxContainer : HTMLDivElement;
  let classList : HTMLUListElement;

  const [isExpanded, setIsExpaned] = createSignal<boolean>(false);

  return (<div class="relative" ref={comboboxContainer}>
    <input 
      ref={comboboxSearch}
      id={`combobox`}
      list=""
      placeholder=" "
      class="block mb-1 px-0 w-full text-sm text-gray-900 
      bg-transparent border-0 border-b-2 border-gray-300 
      appearance-none focus:outline-none 
      focus:ring-0 focus:border-blue-600 peer" />
    <label for={this}
      class="peer-focus:font-medium absolute text-sm text-gray-500 
      duration-300 transform -translate-y-7 scale-75 top-3 -z-10 origin-[0] 
      peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 
      peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-2.5 
      peer-focus:scale-75 peer-focus:-translate-y-7">
      {props.title}
    </label>
    <button 
      id="combobox-button"
      onClick={() =>{
        setIsExpaned(!isExpanded())
        if(classList.offsetTop + classList.clientHeight > canvas.height){
          classList.style.top = `${comboboxContainer.getBoundingClientRect().y - 8 - classList.clientHeight}px`;
        } else { 
          classList.style.top = null;
        }
      }}
      class="px-2 flex right-0 bottom-0 top-0 absolute items-center"
      type="button">
      <svg xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 20 20" 
        fill="currentColor"
        class="w-4 h-4 fill-gray-500">
          <path fill-rule="evenodd" d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z" clip-rule="evenodd"></path></svg>
    </button>
    <Show when={isExpanded()}>
      <ul
        ref={classList}
        id={`combobox-list`}
        style={{
          width: `${comboboxContainer.clientWidth}px`
        }}
        class="rounded border border-gray-200
          snap-start overflow-x-hidden h-auto
          max-h-96 my-1 list-none z-20 overflow-y-auto	bg-white"
        role="list">
          <For each={store.classes}>
            {(umlClass, iUmlClass) => { 
               return (<li
                class="py-0.5 border 
                w-full select-none px-2 
                hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-500 hover:text-white hover:shadow">{
                umlClass.uuid === selectedClass().uuid ? selectedClass().name : umlClass.name}</li>)
            }}
          </For>
      </ul>
    </Show>
  </div>);
};