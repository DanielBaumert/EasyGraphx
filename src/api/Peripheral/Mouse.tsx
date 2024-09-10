import { Point } from "../Drawing";
import { startUpdateView } from "../GlobalState";
import { Math2 } from "../Math2";
import { setSelectedClass, setContextMenuOpen, isContextMenuOpen, selectedClass, setLocationContextMenu, setSelectedPackage, selectedPackage } from "../Signals";
import { internalStore, setStore, store } from "../Store";
import { ContextOpenMode } from "../UI";
import { UMLClass, UMLEnum, UMLInterface, UMLPackage } from "../UML";

// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
export enum MouseButtons {
  PrimaryButton = 1,
  SecondaryButton = 2,
  PrimaryAndSecondary = PrimaryButton | SecondaryButton
}

const isPrimaryButtonPressed = (e: MouseEvent): boolean => {
  return (e.buttons & MouseButtons.PrimaryButton) === MouseButtons.PrimaryButton;
}

const isSecondaryButtonPressed = (e: MouseEvent): boolean => {
  return (e.buttons & MouseButtons.SecondaryButton) === MouseButtons.SecondaryButton;
}

const isPrimaryAndSecondaryButtonPressed= (e: MouseEvent): boolean => {
  return (e.buttons & MouseButtons.PrimaryAndSecondary) === MouseButtons.PrimaryAndSecondary;
}


const onPrimaryDown = (e: MouseEvent) => {
  internalStore.mouseInfo.mousePrimary = e;
  let umlClass = findUMLItemBelowMouse(e);

  if (umlClass) {
    updateReadyToMove(true);
    if (umlClass instanceof UMLPackage) {
      setSelectedPackage(umlClass);
    } else if (umlClass instanceof UMLClass) {
      setSelectedClass(umlClass);
    }

    setStore(
      "selectedUmlOffset",
      {
        x: (e.x - umlClass.x),
        y: (e.y - umlClass.y)
      });
    startUpdateView();
  }
}


const onSecondaryDown = (e: MouseEvent) => {
  internalStore.mouseInfo.mouseSecondary = e;
  setContextMenuOpen(false);
}

export const onCanvasMouseDown = (e: MouseEvent) => {
  setSelectedClass(null);
  setSelectedPackage(null);

  if (isContextMenuOpen()) {
    setContextMenuOpen(false);
  }

  switch (e.buttons & MouseButtons.PrimaryAndSecondary) {
    case MouseButtons.PrimaryAndSecondary:
      updateReadyToMove(false);
      break;
    case MouseButtons.PrimaryButton:
      onPrimaryDown(e);
      break;
    case MouseButtons.SecondaryButton:
      onSecondaryDown(e);
      break;
  }
}

const isClassFoundOnMouse = (uml: UMLClass | UMLPackage): boolean => {
  return uml !== null;
}

const isCurrentlyOverAClass = (): boolean => {
  return store.hoverClass === null;
}


export const onCanvasMouseMove = (e: MouseEvent) => {
  let newHoverClass: UMLClass | UMLPackage = findUMLItemBelowMouse(e);
  if (!isClassFoundOnMouse(newHoverClass) && !isCurrentlyOverAClass()) {
    // no class below the mouse is found
    // but the store store have a class
    setStore("hoverClass", null); // reset
    //style["cursor"] = "default"
    startUpdateView();
  } else if (isClassFoundOnMouse(newHoverClass)) {
    // a class below the mouse is found
    if (store.hoverClass?.uuid !== newHoverClass.uuid) {
      // is the curret newHoverClass not the same below the mouse
      setStore("hoverClass", newHoverClass);
      //canvas.style["cursor"] = "move";
      startUpdateView();
    } else {
      const mouseViewX = e.x - store.viewOffset.x;
      const mouseViewY = e.y - store.viewOffset.y;
      const rightBorder = store.hoverClass.x + store.hoverClass.width;
      const bottomBorder = store.hoverClass.y + store.hoverClass.height;

      if (
        !store.hoverBorder &&
        (store.hoverClass.x - 5 <= mouseViewX && mouseViewX <= store.hoverClass.x + 5 // left side hover
          || store.hoverClass.y - 5 <= mouseViewY && mouseViewY + store.viewOffset.y <= store.hoverClass.y + 5 // top side hover
          || rightBorder - 5 <= mouseViewX && mouseViewX <= rightBorder + 5 //
          || bottomBorder - 5 <= mouseViewY && mouseViewY <= bottomBorder + 5)) {
        // if the mouse near the border and the hoverBorder is not set => set border hover
        setStore("hoverBorder", true);
        startUpdateView();
      } else if (store.hoverBorder) {
        // if hoverBorder set but the mouse not close to the border => deselect border hover
        setStore("hoverBorder", false);
        startUpdateView();
      }
    }
  }


  if (!isPrimaryAndSecondaryButtonPressed(e)) {
    if (isPrimaryButtonPressed(e)) {
      // primary mouse button is pressed
      if ((selectedClass() || selectedPackage()) && store.readyToMove) {
        // If the primary button fell on a class while pressed
        const gridSnap = (internalStore.gridInfo.space / (1 + internalStore.gridInfo.subCount)) * store.zoom;

        const deltaX = (e.x - store.selectedUmlOffset.x) * (1 / store.zoom);
        const deltaY = (e.y - store.selectedUmlOffset.y) * (1 / store.zoom);

        if (selectedPackage()) {
          selectedPackage().x = Math.floor((deltaX) / gridSnap) * gridSnap;
          selectedPackage().y = Math.floor((deltaY) / gridSnap) * gridSnap;
          setSelectedPackage(selectedPackage());
        } else if (selectedClass()) {
          selectedClass().x = Math.floor((deltaX) / gridSnap) * gridSnap;
          selectedClass().y = Math.floor((deltaY) / gridSnap) * gridSnap;
          setSelectedClass(selectedClass());
        }

        startUpdateView();
      } else {
        // if the primary button goes down on a class
        setStore("viewOffset", {
          x: store.viewOffset.x + (e.x - internalStore.mouseInfo.lastEvent.x),
          y: store.viewOffset.y + (e.y - internalStore.mouseInfo.lastEvent.y)
        });
        startUpdateView();
      }
    }

    if (isSecondaryButtonPressed(e)) {
      setStore("selectionMode", true);
      startUpdateView();
    }
  } else {
    // primary and secondary button is pressed
    setSelectedClass(null);
    startUpdateView();
  }

  internalStore.mouseInfo.lastEvent = e;
}


export const onCanvasMouseUp = (e: MouseEvent) => {

  if (isSecondaryButtonPressed(e)) {
    onSecondaryMouseUp(e);
  }
}

const onSecondaryMouseUp = (e: MouseEvent) => {
  if ((selectedClass() || selectedPackage()) && store.readyToMove) {
    updateReadyToMove(false);
    return;
  }

  if (store.selectionMode) {
    // Disable selection
    setStore("selectionMode", false);
    startUpdateView();
  } else {
    // show context menu
    var umlClass = findUMLItemBelowMouse(e);
    if (umlClass instanceof UMLPackage) {
      setSelectedPackage(umlClass);
    } else if (umlClass instanceof UMLClass) {
      setSelectedClass(umlClass);
    }

    if (internalStore.contextMenuRef) {
      setContextMenuOpen(true);

      const contextMenuHeight = internalStore.contextMenuRef.clientHeight;
      const contextMenuWidth = internalStore.contextMenuRef.clientWidth;
      let location: Point = { x: e.x, y: e.y };

      internalStore.contextMenuOpenMode = ContextOpenMode.Default;

      if (location.x + contextMenuWidth > window.innerWidth) {
        internalStore.contextMenuOpenMode |= ContextOpenMode.MirroredX;
        location.x -= contextMenuWidth;
      }

      if (location.y + contextMenuHeight > window.innerHeight) {
        internalStore.contextMenuOpenMode |= ContextOpenMode.MirroredY;
        location.y -= contextMenuHeight
      }

      setLocationContextMenu(location);
    }
  }
}

/**
 * Find the UMLClass or UMLPackage below a position
 * @param position The position to search for a UMLClass or UMLPackage
 * @returns The Closes UMLClass or UMLPackage to the postiton but is a UMLClass closer than a UMLPackage then the UMLClass will be returned.
 * If no UMLClass or UMLPackage is found then null will be returned.
 */
const findUMLItemBelowMouse = (position: Point): UMLClass | UMLPackage => {

  const normalMousePosition : Point = { 
    x: position.x - store.viewOffset.x, 
    y: position.y - store.viewOffset.y
  };

  const umlPackage = findPackgeBelowMouse(normalMousePosition);
  const umlClass = findClassBelowMouse(normalMousePosition);

  if(umlClass === null) { 
    return umlPackage;
  }

  return umlClass;
}

const findPackgeBelowMouse = (position: Point): UMLPackage => {
  // TODO: if a second one below the cursor and his area is smaller than the first one
  // then the second one should be a part of the first one -> second one should be selected

  for (var i = internalStore.packages.length - 1; i >= 0; i--) {
    const umlPackage = internalStore.packages[i];

    if (isMouseInReagion(umlPackage, position))
      return umlPackage;
  }

  return null;
}

const findClassBelowMouse = (position: Point): UMLClass => {
  for (var i = internalStore.classes.length - 1; i >= 0; i--) {
    const umlClass = internalStore.classes[i];

    if (isMouseInReagion(umlClass, position)) {
      return umlClass;
    }
  }

  return null;
}


const isMouseInReagion = (umlItem: UMLPackage | UMLClass, {x, y}) : boolean => {
  const xMin = umlItem.x * store.zoom;
  const xMax = (umlItem.x + umlItem.width) * store.zoom;
  const yMin = umlItem.y * store.zoom;
  const yMax = (umlItem.y + umlItem.height) * store.zoom;
  
  return Math2.inRange(x, xMin, xMax) &&
    Math2.inRange(y, yMin, yMax);
}

const updateReadyToMove = (state: boolean) => {
  setStore("readyToMove", (readyToMove) => state);
}