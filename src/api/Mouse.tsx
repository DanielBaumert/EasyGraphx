import { Point } from "./DrawUtils";
import { startUpdateView } from "./GlobalState";
import { setCurrentClass, isContextMenuOpen, setContextMenuOpen, currentClass, setLocationContextMenu } from "./Signals";
import { setStore, store } from "./Store";
import { UMLClass } from "./UMLClass";

// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
export enum MouseButtons {
  PrimaryButton = 1,
  SecondaryButton = 2
}

export function onCanvasMouseDown(e: MouseEvent) {
  setCurrentClass(null);
  if (isContextMenuOpen()) {
    setContextMenuOpen(false);
  }

  if ((e.buttons & MouseButtons.PrimaryButton) === MouseButtons.PrimaryButton) {
    setStore("mouse", { x: e.x, y: e.y });
    var umlClass = findClassAt(e);
    if (umlClass) {
      updateReadyToMove(true);
      setCurrentClass(umlClass);
      setStore(
        "selectedClassOffset",
        {
          x: (e.x - umlClass.x),
          y: (e.y - umlClass.y)
        });
      startUpdateView();
    }
  }

  if ((e.buttons & MouseButtons.SecondaryButton) === MouseButtons.SecondaryButton) {
    setStore("mouseSecondary", { x: e.x, y: e.y });
    setContextMenuOpen(false);
  }
}

export function onCanvasMouseMove(e: MouseEvent) {
  let newHoverClass = findClassAt(e);
  if (newHoverClass === null
    && store.hoverClass !== null) {
    // no class below the mouse is found
    // but the store store have a class
    setStore("hoverClass", null); // reset
    //style["cursor"] = "default"
    startUpdateView();
  } else if (newHoverClass !== null) {
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

  if ((e.buttons & MouseButtons.PrimaryButton) === MouseButtons.PrimaryButton) {
    // primary mouse button is pressed
    if (currentClass() && store.readyToMove) {
      // If the primary button fell on a class while pressed
      const gridSnap = (store.grid.space / (1 + store.grid.subCount)) * store.zoom;

      const deltaX = (e.x - store.selectedClassOffset.x) * (1 / store.zoom);
      const deltaY = (e.y - store.selectedClassOffset.y) * (1 / store.zoom);

      currentClass().x = Math.floor((deltaX) / gridSnap) * gridSnap;
      currentClass().y = Math.floor((deltaY) / gridSnap) * gridSnap;

      setCurrentClass(currentClass());
      startUpdateView();
    } else {
      // if the primary button goes down on a class
      setStore(
        "viewOffset",
        {
          x: store.viewOffset.x + (e.x - store.mouse.x),
          y: store.viewOffset.y + (e.y - store.mouse.y)
        });
      startUpdateView();
    }
  }

  if ((e.buttons & MouseButtons.SecondaryButton) === MouseButtons.SecondaryButton) {
    setStore("selectionMode", true);
    startUpdateView();
  }

  setStore("mouse", e);
}

export function onCanvasMouseUp(e: MouseEvent) {
  if ((e.button & MouseButtons.SecondaryButton) === MouseButtons.SecondaryButton) {
    if (currentClass() && store.readyToMove) {
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
      setCurrentClass(umlClass);
      setLocationContextMenu(e);
      setContextMenuOpen(true);
    }
  }
}


function findClassAt(position: Point): UMLClass {
  for (var i = store.classes.length - 1; i >= 0; i--) {
    const umlClass = store.classes[i];
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