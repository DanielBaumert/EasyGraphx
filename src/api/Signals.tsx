import { createSignal } from "solid-js";
import { UMLClass } from "./UML";
import { UMLContextMenu } from "./UML/UMLClass";
import { Point } from "./Drawing";

export const [isContextMenuOpen, setContextMenuOpen] = createSignal<boolean>(false, { equals: false });
export const [selectedClass, setSelectedClass] = createSignal<UMLClass>(null, { equals: false });
export const [contentIndex, setContextIndex] = createSignal<UMLContextMenu>(0);
export const [locationContextMenu, setLocationContextMenu] = createSignal<Point>(null);
