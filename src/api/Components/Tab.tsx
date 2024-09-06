import { JSX, ParentComponent } from "solid-js";


const OPEN_TAB_STYLE = "bg-white border-sky-400 border-x border-t";
const CLOSE_TAB_STYLE = "border border-gray-400 bg-white border-b-sky-400 hover:border-sky-400 text-gray-400 hover:text-gray-700";

export type TabProps = {
  children?: JSX.Element;
  onClick: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent>
  isSelected:  () => boolean;
}

export const Tab : ParentComponent<TabProps> = ({children, onClick, isSelected}) => 
  <div class={`py-1 w-full text-sm font-medium text-gray-700 rounded-t text-center select-none cursor-pointer ${isSelected() ? OPEN_TAB_STYLE : CLOSE_TAB_STYLE}`} onClick={onClick}>
    {children}
  </div>

