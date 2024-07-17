import { For, JSX, ParentComponent, createSignal, onMount } from "solid-js";
import { gridStore, viewStore } from "../Store";
import Background from "./Background";

const View: ParentComponent<{
  onMouseDown: JSX.EventHandlerUnion<SVGSVGElement, MouseEvent>,
  onMouseMove: JSX.EventHandlerUnion<SVGSVGElement, MouseEvent>,
  onMouseUp: JSX.EventHandlerUnion<SVGSVGElement, MouseEvent>,
}> = ({ children, onMouseDown, onMouseMove, onMouseUp }) => {
  const [width, setWidth] = createSignal(window.innerWidth + (gridStore.space * 2));
  const [height, setHeight] = createSignal(window.innerHeight + (gridStore.space * 2));

  onMount(() => {
    window.addEventListener('resize', onWindowResize, false);
  });

  function onWindowResize(e: UIEvent): any {
    setWidth(window.innerWidth + (gridStore.space * 2));
    setHeight(window.innerHeight + (gridStore.space * 2));
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        overflow="visible"
        style={{
          left: -gridStore.space + "px",
          top:  -gridStore.space + "px",
        }}
        preserveAspectRatio="none"
        width={width()} height={height()}
        class="fixed bg-transparent"
      >

        <Background />
        {children}
    </svg>
  );

};
export default View;