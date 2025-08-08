import { startUpdateView } from "../GlobalState";
import { selectedClass, selectedPackage } from "../Signals";
import { internalStore } from "../Store";


export const onCanvasKeyDown = (e: KeyboardEvent) => {
  if (e.key === "Delete") {
    if (selectedClass() || selectedPackage()) {
      deleteSelectedUML();
      startUpdateView();
    }
  }
}


function deleteSelectedUML() {
     // remove class from store
      internalStore.classes = internalStore.classes.filter(x =>
        x.uuid !== selectedClass().uuid); // delete class by uuid
  
      // remove relationships from that class
      internalStore.relationships = internalStore.relationships.filter(x =>
        x.parent.uuid !== selectedClass().uuid // delete all relationships to 
        && x.children.uuid !== selectedClass().uuid); // delete all relationships from
  
      startUpdateView();
}
