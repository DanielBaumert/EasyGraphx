import { createStore } from "solid-js/store";
import { Point } from "./DrawUtils";
import { UMLClass } from "./UMLClass";
import { UMLRelationship } from "./UMLRelationship";

export const [store, setStore] = createStore<
  {
    classes: UMLClass[],
    relationships: UMLRelationship[],
    grid: {
      background: string | CanvasGradient | CanvasPattern,
      space: number,
      color: string | CanvasGradient | CanvasPattern,
      subVisuale: boolean,
      subColor: string | CanvasGradient | CanvasPattern,
      subCount: number,
    },
    class: {
      background: string | CanvasGradient | CanvasPattern,
      fontColor: string | CanvasGradient | CanvasPattern,
      deselectColor:  string | CanvasGradient | CanvasPattern,
      selectColor:  string | CanvasGradient | CanvasPattern,
      borderWidth: number
    },
    mousePrimary: Point,
    mouseSecondary: Point,
    mouse: MouseEvent,
    selectedClassOffset: Point,
    hoverClass?: UMLClass,
    hoverBorder: boolean,
    readyToMove: boolean,
    selectionMode: boolean,
    viewOffset: Point,
    fontSize: number,
    zoom: number,
    rtc : {
      pc: RTCPeerConnection,
      rmd: string,
      ch: RTCDataChannel,
      isChOpen: boolean,
      remoteMouse: Point,
      remoteView: Point
    }
  }>({
    classes: [],
    relationships: [],
    grid: {
      background: "white",
      color: "#00505033",
      space: 64,
      subVisuale: true,
      subColor: "#00505011",
      subCount: 3,
    },
    class: { 
      background: "white",
      fontColor: "black",
      deselectColor: "black",
      selectColor: "gray",
      borderWidth: 2
    },
    selectedClassOffset: {x: 0, y: 0},
    hoverClass: null,
    hoverBorder: false,
    mousePrimary: { x: 0, y: 0 },
    mouseSecondary: { x: 0, y: 0 },
    mouse: null,
    readyToMove: false,
    selectionMode: false,
    viewOffset: { x: 0, y: 0 },
    zoom: 1.0,
    fontSize: 18,
    rtc : {
      pc: undefined,
      rmd: undefined,
      ch: undefined,
      isChOpen: false,
      remoteMouse: undefined,
      remoteView: undefined
    }
});



