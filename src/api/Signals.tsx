import { createSignal } from "solid-js";
import { UMLContextMenu } from "./UML/UMLClass";
import { Point } from "./Drawing";
import { UMLClass } from "./UMLv2";

export const [isContextMenuOpen, setContextMenuOpen] = createSignal<boolean>(false, { equals: false });
export const [selectedClass, setSelectedClass] = createSignal<UMLClass>(null, { equals: false });
export const [contentIndex, setContextIndex] = createSignal<UMLContextMenu>(0);
export const [locationContextMenu, setLocationContextMenu] = createSignal<Point>(null);



export const [selectedClassIndex, setSelectedClassIndex] = createSignal<number>(null, { equals: false });