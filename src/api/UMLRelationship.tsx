import { Accessor, Component, For, JSX, ParentComponent, Show, createSignal } from "solid-js";
import { UMLClass } from "./UMLClass";
import { Label, SmallLabel } from "./Label";
import { store } from "./Store";
import { selectedClass, setSelectedClass } from "./Signals";
import { startUpdateView } from "./GlobalState";
import { Radio } from "./CheckBox";
import { drawArrow, drawDotLine, drawLine, drawNone, fillContainment, fillKristal, fillTriangle } from "./DrawUtils";
import { DropDownArrowIcon } from "./Icons";

export enum UMLRelationshipType {
  association = "Association",
  directionalAssociation = "Directional Association",
  bidirectionalAssociation = "Bidirectional Association",
  composition = "Composition",
  aggregation = "Aggregation",
  usage = "Usage",
  subsitution = "Subsitution",
  abstraction = "Abstraction",
  dependency = "Dependency",
  informationFlow = "Information Flow",
  containment = "Containment",
  realization = "Realization",
  generalization = "Generalization",
  none = undefined,
}


export const UMLLineMode = {
  "Generalization": drawLine,
  "Realization": drawDotLine,
  "Containment": drawLine,
  "Information Flow" : drawDotLine,
  "Dependency" : drawDotLine,
  "Abstraction" : drawDotLine,
  "Subsitution" : drawDotLine,
  "Usage" : drawDotLine,
  "Association": drawLine,
  "Directional Association" : drawLine,
  "Bidirectional Association" : drawLine,
  "Composition" : drawLine,
  "Aggregation" : drawLine
}

export const UMLArrowMode = {
  "Generalization": fillTriangle,
  "Realization": fillTriangle,
  "Containment": fillContainment,
  "Information Flow" : drawArrow,
  "Dependency" : drawArrow,
  "Abstraction" : drawArrow,
  "Subsitution" : drawArrow,
  "Usage" : drawArrow,
  "Association": undefined,
  "Directional Association" : drawArrow,
  "Bidirectional Association" : drawArrow,
  "Composition" : fillKristal,
  "Aggregation" : fillKristal,
}


export class UMLRelationship {
  uuid: string;
  type: UMLRelationshipType;
  parent?: UMLClass;
  readonly children: UMLClass;

  constructor(children: UMLClass);
  constructor(children: UMLClass, parent: UMLClass, type: UMLRelationshipType, uuid:string);
  constructor(children: UMLClass, parent?: UMLClass, type?: UMLRelationshipType, uuid?:string) {
    this.uuid = crypto.randomUUID();
    this.type = type || UMLRelationshipType.generalization;
    this.parent = parent || undefined;
    this.children = children;
  }
}

export const UMLRelationshipContainer: ParentComponent<{
  index: number,
  childrenClass: UMLClass,
  relationship: UMLRelationship,
  delete: Function
}> = (props) => {
  const [isExpanded, setExpanded] = createSignal<boolean>(true);
  const [isDropDownOpen, setDropDownOpen] = createSignal<boolean>(false);
  const [classFilter, setClassFilter] = createSignal<string>("");
  const [isfocus, setFocus] = createSignal<boolean>(false);
  const [relationship, setRelationship] = createSignal<UMLRelationshipType>(props.relationship.type);
  const [isRelationshipParent, setRelationshipParent] = createSignal<boolean>(props.relationship.parent !== undefined);

  let inputField: HTMLInputElement;
  let dropDownName: HTMLDivElement;

  let dropDownTypeContainer : HTMLDivElement;
  let dropDownType: HTMLDivElement;


  function onExpanding() {
    setExpanded(!isExpanded());
    updateDropdown();
  }

  function updateDropdown() {
    if (isExpanded()) {
      let bounce = inputField.getBoundingClientRect();
      dropDownName.style.minWidth = `${bounce.width}px`;
      dropDownName.style.maxWidth = `${bounce.width}px`;
      // calc position
      dropDownName.style.top = `calc(${bounce.bottom}px + 0.25rem)`;
    }
  }

  function onInputChange() {
    console.log("input changed");
    props.relationship.parent = store.classes.find(x => x.name === inputField.value);
    
    setRelationshipParent(props.relationship.parent !== undefined);
    setClassFilter(inputField.value);
    setSelectedClass(selectedClass());
    startUpdateView();
  }

  function onDropItemClick(umlClass: UMLClass) {
    inputField.value = umlClass.name;
    props.relationship.parent = umlClass;
    setRelationshipParent(true);
    setClassFilter(umlClass.name);
    
    setSelectedClass(selectedClass());
    startUpdateView();
  }

  function onInputFocusIn() {
    setFocus(true);
    updateDropdown();
  }

  function updateRelationship(e: Event, type : UMLRelationshipType){
    if(props.relationship.parent !== undefined) { 
      props.relationship.type = type;
      setRelationship(type);
      setDropDownOpen(!isDropDownOpen());
      setSelectedClass(selectedClass());
      startUpdateView();
    }
  } 

  function onDropDownToggle(e: MouseEvent) { 
    setDropDownOpen(!isDropDownOpen());
    if(isDropDownOpen()){
      let bounce = dropDownTypeContainer.getBoundingClientRect();
      dropDownType.style.minWidth = `${bounce.width}px`;
      dropDownType.style.maxWidth = `${bounce.width}px`;

      dropDownType.style.top = `calc(${bounce.bottom}px + 0.25rem)`
    }
  }

  const DropDownItem : ParentComponent<{
    onClick?: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent>
  }> = (props) => 
    <div onClick={props.onClick} class="py-0.5 px-2 select-none hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-500 hover:text-white">{props.children}</div>

  return (
    <div
      class={`relative flex flex-col bg-white rounded border ${isRelationshipParent() ? "border-sky-400" : "border-red-400"} p-2 mb-2 shadow`}>
      <Show when={isExpanded()}>
        <div class="relative z-0 w-full mt-3 group" >
          <input id={this}
            ref={inputField}
            onFocusIn={onInputFocusIn}
            onInput={onInputChange}
            value={props.relationship.parent?.name ?? ""}
            placeholder=" "
            class="block mb-1 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" />
          <label for={this}
            class="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-7 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-2.5 peer-focus:scale-75 peer-focus:-translate-y-7">
            Relationship to
          </label>
        </div>
        <Show when={isfocus()}>
          <div id={this} ref={dropDownName} class="z-20 fixed border-2 overflow-y-auto rounded bg-white py-1 shadow max-h-64">
            <For each={(() => {
              let filter = classFilter();
              return store.classes.filter(x => x.name.includes(filter))
            })()}>
              {(umlClass, _) => {
                return (<div class="w-full pl-1 py-1 select-none hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-500 hover:text-white hover:shadow"
                  onClick={() => {
                    onDropItemClick(umlClass)
                    setFocus(false);
                  }}
                >{umlClass.name}</div>)
              }}
            </For>
          </div>
        </Show>
        <Show when={isRelationshipParent()}>
          <SmallLabel title="Relationship type" />

          <div ref={dropDownTypeContainer} class="flex flex-row w-full border-2 rounded mb-1">
            <label class="ml-2 block w-full">{props.relationship.type}</label>
            <div onclick={onDropDownToggle} class="border-l group hower:shadow hover:fill-red">
              <DropDownArrowIcon />
            </div>
            <Show when={isDropDownOpen()}>
              <div class="z-20 fixed border-2 overflow-y-auto rounded bg-white py-1 shadow" ref={dropDownType}>
                <DropDownItem onClick={e => updateRelationship(e, UMLRelationshipType.generalization)}>{UMLRelationshipType.generalization}</DropDownItem>
                <DropDownItem onClick={e => updateRelationship(e, UMLRelationshipType.containment)}>{UMLRelationshipType.containment}</DropDownItem>
                <DropDownItem onClick={e => updateRelationship(e, UMLRelationshipType.dependency)}>{UMLRelationshipType.dependency}</DropDownItem>
                <DropDownItem onClick={e => updateRelationship(e, UMLRelationshipType.subsitution)}>{UMLRelationshipType.subsitution}</DropDownItem>
                <DropDownItem onClick={e => updateRelationship(e, UMLRelationshipType.association)}>{UMLRelationshipType.association}</DropDownItem>
                <DropDownItem onClick={e => updateRelationship(e, UMLRelationshipType.bidirectionalAssociation)}>{UMLRelationshipType.bidirectionalAssociation}</DropDownItem>
                <DropDownItem onClick={e => updateRelationship(e, UMLRelationshipType.directionalAssociation)}>{UMLRelationshipType.directionalAssociation}</DropDownItem>
                <DropDownItem onClick={e => updateRelationship(e, UMLRelationshipType.realization)}>{UMLRelationshipType.realization}</DropDownItem>
                <DropDownItem onClick={e => updateRelationship(e, UMLRelationshipType.informationFlow)}>{UMLRelationshipType.informationFlow}</DropDownItem>
                <DropDownItem onClick={e => updateRelationship(e, UMLRelationshipType.abstraction)}>{UMLRelationshipType.abstraction}</DropDownItem>
                <DropDownItem onClick={e => updateRelationship(e, UMLRelationshipType.composition)}>{UMLRelationshipType.composition}</DropDownItem>
                <DropDownItem onClick={e => updateRelationship(e, UMLRelationshipType.aggregation)}>{UMLRelationshipType.aggregation}</DropDownItem>
                <DropDownItem onClick={e => updateRelationship(e, UMLRelationshipType.usage)}>{UMLRelationshipType.usage}</DropDownItem>
                <DropDownItem onClick={e => updateRelationship(e, UMLRelationshipType.none)}>None</DropDownItem>
              </div>
            </Show>
          </div>
        </Show>
        <button class="
          py-1 w-full rounded mb-1 
          border border-gray-200 
          text-sm font-medium text-gray-700 
          hover:bg-red-500 hover:text-white hover:shadow"
          onClick={() => props.delete(props.relationship.uuid)}>
          Delete
        </button>
      </Show>
      <Show when={!isExpanded()}>
        <SmallLabel title={`${`${props.childrenClass.name}.${props.index}`} <-> ${props.relationship.parent?.name ?? "???"}`} />
      </Show>
      <div class="absolute flex flex-row top-1 right-1 cursor-pointer">
        <div class={isExpanded() ? 'group rotate-180' : 'group'} onClick={onExpanding}>
          <DropDownArrowIcon />
        </div>
      </div>
    </div>
  )
}

