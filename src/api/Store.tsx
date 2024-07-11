import { createStore } from "solid-js/store";
import { Point } from "./DrawUtils";
import { UMLClass } from "./UMLClass";
import { UMLRelationship } from "./UMLRelationship";
import { ContextOpenMode } from "./UI/ContextOpenMode";


type GridInfo = {
  background: string | CanvasGradient | CanvasPattern,
  space: number,
  color: string | CanvasGradient | CanvasPattern,
  subVisuale: boolean,
  subColor: string | CanvasGradient | CanvasPattern,
  subCount: number,
};

type ClassDrawInfo = {
  background: string | CanvasGradient | CanvasPattern,
  fontColor: string | CanvasGradient | CanvasPattern,
  deselectColor: string | CanvasGradient | CanvasPattern,
  selectColor: string | CanvasGradient | CanvasPattern,
  borderWidth: number;
};


type MouseInfo = {
  lastEvent: MouseEvent,
  mousePrimary: Point,
  mouseSecondary: Point,
};

type InternalStore = {
  mouseInfo: MouseInfo,
  viewOffset: Point,
  gridInfo: GridInfo,
  classDrawInfo: ClassDrawInfo,
  classes: UMLClass[],
  relationships: UMLRelationship[],
  contextMenuRef?: HTMLDivElement,
  contextMenuOpenMode?: ContextOpenMode;
};

export let internalStore: InternalStore = {
  mouseInfo: {
    lastEvent: null,
    mousePrimary: { x: 0, y: 0 },
    mouseSecondary: { x: 0, y: 0 },
  },
  classDrawInfo: {
    background: "white",
    fontColor: "black",
    deselectColor: "black",
    selectColor: "gray",
    borderWidth: 2
  },
  viewOffset: { x: 0, y: 0 },
  gridInfo: {
    background: "white",
    color: "#00505033",
    space: 64,
    subVisuale: true,
    subColor: "#00505011",
    subCount: 3,
  },
  classes: [],
  relationships: [],
  contextMenuRef: null,
  contextMenuOpenMode: null
};


export const [store, setStore] = createStore<
  {
    class: UMLClass,
    selectedClassOffset: Point,
    hoverClass?: UMLClass,
    hoverBorder: boolean,
    readyToMove: boolean,
    selectionMode: boolean,
    viewOffset: Point,
    fontSize: number,
    zoom: number,
    rtc: {
      target: string;
    };
  }>({
    class: null,
    selectedClassOffset: { x: 0, y: 0 },
    hoverClass: null,
    hoverBorder: false,
    readyToMove: false,
    selectionMode: false,
    viewOffset: { x: 0, y: 0 },
    zoom: 1.0,
    fontSize: 18,
    rtc: {
      target: ""
    }
  });