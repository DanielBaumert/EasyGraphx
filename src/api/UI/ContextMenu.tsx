import { ParentComponent } from "solid-js";
import { internalStore } from "../Store";
import { Point } from "../Drawing";

const ContextMenu: ParentComponent<{
  location: Point,
  hidden: boolean;
}> = (props) => {
  return (
    <div class={`
            ${props.hidden ? 'hidden' : ''}
            fixed flex flex-col 
            z-10 shadow-md`}
      ref={internalStore.contextMenuRef}
      style={{
        left: `${props.location?.x ?? 0}px`,
        top: `${props.location?.y ?? 0}px`
      }}>
      {props.children}
    </div>
  );
};

export default ContextMenu;