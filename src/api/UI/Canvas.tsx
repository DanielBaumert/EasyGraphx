import { Component, JSX } from "solid-js";
export let canvas: HTMLCanvasElement;

const Canvas: Component<{
  onMouseDown: JSX.EventHandlerUnion<HTMLCanvasElement, MouseEvent>,
  onMouseMove: JSX.EventHandlerUnion<HTMLCanvasElement, MouseEvent>,
  onMouseUp: JSX.EventHandlerUnion<HTMLCanvasElement, MouseEvent>,
  onKeyDown: JSX.EventHandlerUnion<HTMLCanvasElement, KeyboardEvent>
}> = (props) => {
  return <canvas
    ref={canvas} id="canny"
    class='absolute bg-transparent'
    onMouseDown={props.onMouseDown}
    onMouseMove={props.onMouseMove}
    onMouseUp={props.onMouseUp}
    onKeyDown={props.onKeyDown}
    />;
};

export default Canvas;