import { createStore } from "solid-js/store";
import { Point } from "./DrawUtils";
import { UMLClass } from "./UMLClass";
import { IUMLDerive } from "./UMLDerive";

export const [store, setStore] = createStore<
  {
    classes: UMLClass[],
    grid: {
      space: number,
      color: string | CanvasGradient | CanvasPattern,
      subVisuale: boolean,
      subColor: string | CanvasGradient | CanvasPattern,
      subCount: number,
    },
    derives: IUMLDerive[],
    selectedClassOffset: Point,
    hoverClass?: UMLClass,
    hoverBorder: boolean,
    mouseDown: Point,
    mouse: Point,
    readyToMove: boolean,
    viewOffset: Point,
    zoom: number,
    rtc : {
      target: string
    }
  }>({
    classes: [],
    derives: [],
    grid: {
      color: "#00505033",
      space: 64,
      subVisuale: true,
      subColor: "#00505011",
      subCount: 3,
    },
    selectedClassOffset: {x: 0, y: 0},
    hoverClass: null,
    hoverBorder: false,
    mouseDown: { x: 0, y: 0 },
    mouse: { x: 0, y: 0 },
    readyToMove: false,
    viewOffset: { x: 0, y: 0 },
    zoom: 1.0,
    rtc : {
      target: ""
    }
});



