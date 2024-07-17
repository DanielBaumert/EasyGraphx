import { createStore } from "solid-js/store";
import { Point } from "./Drawing";
import { ContextOpenMode } from "./UI";
import { UMLClass, UMLRelationship } from "./UMLv2";

type GridInfo = {
  background: string ,
  space: number,
  color: string,
  subVisuale: boolean,
  subColor: string,
  subCount: number,
};

export const [gridStore, setGridStore] = createStore<GridInfo>({
  background: "white",
  color: "#00505033",
  space: 64,
  subVisuale: true,
  subColor: "#00505011",
  subCount: 3,
});

type ViewInfo = { 
  offset: Point,
  zoom: number,
  fontSize: number,
}

export const [viewStore, setViewStore] = createStore<ViewInfo>({
  offset: { x: 0, y: 0 },
  zoom: 1.0,
  fontSize: 18,
});

type ClassDrawInfo = {
  background: string,
  fontColor: string,
  deselectColor: string,
  selectColor: string,
  borderWidth: number;
};

export const [classDrawInfoStore, setClassDrawInfoStore] = createStore<ClassDrawInfo>({
  background: "white",
  fontColor: "black",
  deselectColor: "black",
  selectColor: "gray",
  borderWidth: 2
});


type UserViewStoreInfo = {
  classes: UMLClass[],
  relationships: UMLRelationship[],
}

export const [userViewStore, setUserViewStore] = createStore<UserViewStoreInfo>({
  classes: [],
  relationships: []
});


type MouseInfo = {
  lastEvent: MouseEvent,
  mousePrimary: Point,
  mouseSecondary: Point,
};

type InternalStore = {
  mouseInfo: MouseInfo,
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
    rtc: {
      target: ""
    }
  });