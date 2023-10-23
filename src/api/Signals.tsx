import { createSignal } from "solid-js";
import { Point } from "./DrawUtils";
import { UMLClass, UMLContextMenu } from "./UMLClass";

export const [isContextMenuOpen, setContextMenuOpen] = createSignal<boolean>(false, { equals: false });
export const [currentClass, setCurrentClass] = createSignal<UMLClass>(null, { equals: false });
export const [contentIndex, setContextIndex] = createSignal<UMLContextMenu>(0);
export const [locationContextMenu, setLocationContextMenu] = createSignal<Point>(null);
