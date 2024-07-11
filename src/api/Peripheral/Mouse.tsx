import { Point } from "../Drawing";
import { startUpdateView } from "../GlobalState";
import { setSelectedClass, setContextMenuOpen, isContextMenuOpen, selectedClass, setLocationContextMenu } from "../Signals";
import { internalStore, setStore, store } from "../Store";
import { ContextOpenMode } from "../UI";
import { UMLClass } from "../UML";

// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
export enum MouseButtons {
  PrimaryButton = 1,
  SecondaryButton = 2,
  PrimaryAndSecondary = PrimaryButton | SecondaryButton
}

function isPrimaryButtonPressed(e: MouseEvent): boolean {
  return (e.buttons & MouseButtons.PrimaryButton) === MouseButtons.PrimaryButton;
}

function isSecondaryButtonPressed(e: MouseEvent): boolean {
  return (e.buttons & MouseButtons.SecondaryButton) === MouseButtons.SecondaryButton;
}

function isPrimaryAndSecondaryButtonPressed(e: MouseEvent): boolean {
  return (e.buttons & MouseButtons.PrimaryAndSecondary) === MouseButtons.PrimaryAndSecondary;
}


function onPrimaryDown(e: MouseEvent) {
  internalStore.mouseInfo.mousePrimary = e;
  let umlClass = findClassAt(e);

  if (umlClass) {
    updateReadyToMove(true);
    setSelectedClass(umlClass);
    setStore(
      "selectedClassOffset",
      {
        x: (e.x - umlClass.x),
        y: (e.y - umlClass.y)
      });
    startUpdateView();
  }
}


function onSecondaryDown(e: MouseEvent) {
  internalStore.mouseInfo.mouseSecondary = e;
  setContextMenuOpen(false);
}

export function onCanvasMouseDown(e: MouseEvent) {
  setSelectedClass(null);
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

function isClassFoundOnMouse(umlClass: UMLClass): boolean {
  return umlClass !== null;
}

function isCurrentlyOverAClass(): boolean {
  return store.hoverClass === null;
}


export function onCanvasMouseMove(e: MouseEvent) {
  let newHoverClass: UMLClass = findClassAt(e);
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
      if (selectedClass() && store.readyToMove) {
        // If the primary button fell on a class while pressed
        const gridSnap = (internalStore.gridInfo.space / (1 + internalStore.gridInfo.subCount)) * store.zoom;

        const deltaX = (e.x - store.selectedClassOffset.x) * (1 / store.zoom);
        const deltaY = (e.y - store.selectedClassOffset.y) * (1 / store.zoom);

        selectedClass().x = Math.floor((deltaX) / gridSnap) * gridSnap;
        selectedClass().y = Math.floor((deltaY) / gridSnap) * gridSnap;

        setSelectedClass(selectedClass());
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


export function onCanvasMouseUp(e: MouseEvent) {

  if ((e.button & MouseButtons.SecondaryButton) === MouseButtons.SecondaryButton) {
    if (selectedClass() && store.readyToMove) {
      updateReadyToMove(false);
      return;
    }

    if (store.selectionMode) {
      // Disable selection
      setStore("selectionMode", false);
      startUpdateView();
    } else {
      // show context menu
      var umlClass = findClassAt(e);
      setSelectedClass(umlClass);
      if (internalStore.contextMenuRef) {
        setContextMenuOpen(true);

        const contextMenuHeight = internalStore.contextMenuRef.clientHeight;
        const contextMenuWidth = internalStore.contextMenuRef.clientWidth;
        let location : Point = { x: e.x, y: e.y };

        internalStore.contextMenuOpenMode = ContextOpenMode.Default;

        if(location.x + contextMenuWidth > window.innerWidth) {
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
}


function findClassAt(position: Point): UMLClass {
  for (var i = internalStore.classes.length - 1; i >= 0; i--) {
    const umlClass = internalStore.classes[i];
    const mouseViewX = position.x - store.viewOffset.x;
    const mouseViewY = position.y - store.viewOffset.y;

    if ((umlClass.x * store.zoom) <= mouseViewX // left
      && mouseViewX <= (umlClass.x * store.zoom) + umlClass.width // right
      && (umlClass.y * store.zoom) <= mouseViewY // top
      && mouseViewY <= (umlClass.y * store.zoom) + umlClass.height /* bottom */) {
      return umlClass;
    }
  }

  return null;
}

function updateReadyToMove(state: boolean) {
  setStore("readyToMove", (readyToMove) => {
    readyToMove = state;
    return readyToMove;
  });
}