import { Component,  createSignal, observable, ParentComponent } from "solid-js";
import { UMLClass } from "../UMLv2";
import { StringBuilder } from "../StringBuilder";
import { viewStore } from "../Store";


const ObservableText : ParentComponent<{onChange: (e: SVGTextElement) => void, x: number, y: number}> = (props) => {
  const [text, setText] = createSignal<SVGTextElement>();
  const obsvHeader$ = observable(text);
  obsvHeader$.subscribe(() => {
      props.onChange(text());
  });

  return (<text x={props.x} y={props.y} ref={setText} font-size={viewStore.fontSize.toString()} fill="black">{props.children}</text>)
}

type UMLClassViewAttributes = UMLClass & { 
  onClick : (e: MouseEvent) => void,
}

const UMLClassView : Component<UMLClassViewAttributes> = (props) => {

  const [width, setWidth] = createSignal<number>(0);
  const [height, setHeight] = createSignal<number>(0);

  const getCaption = () => {
    let sb = new StringBuilder();

    if (props.property !== undefined) {
      sb.write("<<").write(props.property).write(">>").newline();
    }

    sb.write(props.name);

    if (props.isAbstract) {
      sb.newline().write("{abstract}");
    }

    return sb.toString();
  }

  const updateHeight = (e : SVGTextElement) => { 
    const rect =  e.getBBox();

    setHeight(rect.height);
    setWidth(rect.width);
  }

  const viewOffsetX = () => props.x + viewStore.offset.x;
  const viewOffsetY = () => props.y + viewStore.offset.y;

  return (<g onClick={props.onClick}>
    <rect x={viewOffsetX()} y={viewOffsetY()} fill="white" stroke="black" stroke-width={1} width={width() + 20} height={height() + 10} />
    <ObservableText x={viewOffsetX() + 10} y={viewOffsetY() + 20} onChange={updateHeight}>{getCaption()}</ObservableText>
  </g>);
}


export default UMLClassView;