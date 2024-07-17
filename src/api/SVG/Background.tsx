import { Component, For, Show } from "solid-js";
import { gridStore, viewStore } from "../Store";

const Background : Component = () => {
  return (
    <>
      <pattern 
        id="background-pattern" 
        patternUnits="userSpaceOnUse" 
        x={viewStore.offset.x % gridStore.space}
        y={viewStore.offset.y % gridStore.space}
        
        width={gridStore.space} 
        height={gridStore.space}>
        <line x1={gridStore.space} y1={0} x2={gridStore.space} y2={gridStore.space} stroke={gridStore.color} stroke-width="1" />
        <line y1={gridStore.space} x1={0} x2={gridStore.space} y2={gridStore.space} stroke={gridStore.color} stroke-width="1" />

        <Show when={gridStore.subCount > 0 && gridStore.subVisuale}>
          <For each={new Array(gridStore.subCount)}>
            {(_, index) => {
              const space = gridStore.space / (gridStore.subCount + 1);
              const pos = space * (index() + 1);

              return (<>
                <line x1={pos} y1={0} x2={pos} y2={gridStore.space} stroke={gridStore.subColor} stroke-width="1" />
                <line y1={pos} x1={0} x2={gridStore.space} y2={pos} stroke={gridStore.subColor} stroke-width="1" />
              </>)
            }}
          </For>
        </Show>
      </pattern>

      <rect width="100%" height="100%" fill="url(#background-pattern)" />
    </>
  );
}


export default Background;