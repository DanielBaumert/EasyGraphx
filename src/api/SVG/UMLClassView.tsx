import { Component,  createEffect,  createSignal, observable, ParentComponent, Show } from "solid-js";
import { UMLClass } from "../UMLv2";
import { StringBuilder } from "../StringBuilder";
import { viewStore } from "../Store";
import { from } from "rxjs";


const ObservableText : ParentComponent<{onChange: (e: SVGTextElement) => void, x: number, y: number}> = (props) => {
  const [text, setText] = createSignal<SVGTextElement>();

  const changeEvent = () => {
    console.log("text changed");
    props.onChange(text());
  }

  const obsvHeader$ = from(observable(text));
  obsvHeader$.subscribe(changeEvent);

  return (<text 
    ref={setText} 
    x={props.x} y={props.y} 
    font-size={viewStore.fontSize.toString()} fill="black">{props.children}</text>)
}

type UMLClassViewAttributes = UMLClass & { 
  onClick : (e: MouseEvent) => void,
}

const UMLClassView : Component<UMLClassViewAttributes> = (props) => {

  const [width, setWidth] = createSignal<number>(0);
  const [height, setHeight] = createSignal<number>(0);

  let header: SVGTextElement;

  const updateHeight = () => { 
    const rect = header.getBBox();
    setHeight(rect.height);
    setWidth(rect.width);
  }

  const viewOffsetX = () => props.x + viewStore.offset.x;
  const viewOffsetY = () => props.y + viewStore.offset.y;

  return (<g onClick={props.onClick}>
    <rect x={viewOffsetX()} y={viewOffsetY()} fill="white" stroke="black" stroke-width={1} width={width() + 20} height={height() + 10} />
    <text ref={header} x={viewOffsetX() + 10} y={viewOffsetY() + 20} dy={0} text-anchor="middle">
      <Show when={props.property !== undefined}>
        <tspan>{`<<${props.property}>>`}</tspan>
      </Show>
      <tspan x={viewOffsetX() + 10} dy={viewStore.fontSize} onChange={updateHeight}>{props.name}</tspan>
      <Show when={props.isAbstract}>
        <tspan>{'{abstract}'}</tspan>
      </Show>
    </text>
  </g>);
}


export default UMLClassView;