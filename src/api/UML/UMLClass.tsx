import { Component, Show, Switch, Match, For } from "solid-js";
import { startUpdateView } from "../GlobalState";
import { selectedClass, setSelectedClass, contentIndex, setContextIndex } from "../Signals";
import { internalStore } from "../Store";
import { Label, Field, Button, Checkbox } from "../UI";
import { UMLAttributeContainer } from "./UMLAttribute";
import { UMLMethodeContainer } from "./UMLMethode";
import { UMLParameterContainer } from "./UMLParameter";
import { UMLRelationshipContainer } from "./UMLRelationship";
import { UMLAttribute, UMLMethode, UMLParameter, UMLRelationship, UMLRelationshipType } from ".";

export enum UMLContextMenu {
  Attributes = 0,
  Methodes,
  Relationships
}

export const UMLClassComponent: Component = () => {
  /*
  * Attribute management 
  */
  function pushAttribute() {
    selectedClass().attributes.push(new UMLAttribute());
    setSelectedClass(selectedClass());
    startUpdateView();
  }

  function popAttribute(attrIndex: number) {
    selectedClass().attributes.splice(attrIndex, 1);
    setSelectedClass(selectedClass());
    startUpdateView();
  }

  function pushMethode() {
    selectedClass().methodes.push(new UMLMethode());
    setSelectedClass(selectedClass());
    startUpdateView();
  }

  function popMethode(methIndex: number) {
    selectedClass().methodes.splice(methIndex, 1);
    setSelectedClass(selectedClass());
    startUpdateView();
  }

  function pushParameter(methodeIndex: number) {
    selectedClass().methodes[methodeIndex].parameters.push(
      new UMLParameter());
    setSelectedClass(selectedClass());
    startUpdateView();
  }
  function popParameter(methIndex: number, parameterIndex: number) {
    selectedClass().methodes[methIndex].parameters.splice(parameterIndex, 1);
    setSelectedClass(selectedClass());
    startUpdateView();
  }

  function pushRelationship() {
    internalStore.relationships.push(
      {
        children: selectedClass(),
        type : UMLRelationshipType.generalization,
      } as UMLRelationship);

    setSelectedClass(selectedClass());
    startUpdateView();
  }

  function popRelationship(relationShipUuid: string) {
    internalStore.relationships = internalStore.relationships
      .filter(x =>
        x.uuid !== relationShipUuid);

    setSelectedClass(selectedClass());
    startUpdateView();
  }

  function updateIsStatic(e: Event) {
    if (e.currentTarget instanceof HTMLInputElement) {
      selectedClass().isAbstract = e.currentTarget.checked;
      startUpdateView();
    }
  }

  function onNameInputChanged(e) {
    selectedClass().name = e.currentTarget.value;
    setSelectedClass(selectedClass());
    startUpdateView();
  }

  return (
    <Show when={selectedClass()}>
      <div id="side-nav" class="fixed flex max-h-screen top-0 right-0 p-4 min-w-[351px]">
        <div class="flex grow flex-col">
          <div class="bg-white rounded border border-sky-400 px-4 py-2 mb-4 shadow">
            <Label title="Class" />
            <Field title='Property'
              initValue={selectedClass().property}
              onInputChange={e => {
                // if (selectedClass().property?.trim().toLowerCase() !== "interface" // source become an interface
                //   && e.currentTarget.value.trim().toLowerCase() === "interface") {

                // } else if (selectedClass().property.trim().toLowerCase() === "interface"
                //   && e.currentTarget.value.trim().toLowerCase() !== "interface") {

                // }

                selectedClass().property = e.currentTarget.value;
                setSelectedClass(selectedClass());
                startUpdateView();
              }} />
            <Field title='Name'
              initValue={selectedClass().name}
              onInputChange={onNameInputChanged} />
            <Checkbox id="static" title="Abstract" value={selectedClass().isAbstract} onChanges={updateIsStatic} />
          </div>
          {/* Tabs */}
          <div>
            <div class='flex flex-row justify-between'>
              <div class={`py-1 w-full text-sm font-medium text-gray-700 rounded-t
              text-center select-none cursor-pointer
              ${contentIndex() === UMLContextMenu.Attributes
                  ? "bg-white border-sky-400 border-x border-t"
                  : "border border-gray-400 bg-white border-b-sky-400 hover:border-sky-400 text-gray-400 hover:text-gray-700"}`}
                onclick={() => setContextIndex(UMLContextMenu.Attributes)}
              >Attributes</div>
              <div class={`py-1 w-full text-sm font-medium text-gray-700 rounded-t
              text-center select-none cursor-pointer
              ${contentIndex() === UMLContextMenu.Methodes
                  ? "bg-white border-sky-400 border-x border-t"
                  : "border border-gray-400 bg-white border-b-sky-400 hover:border-sky-400 text-gray-400 hover:text-gray-700"}`}
                onclick={() => setContextIndex(UMLContextMenu.Methodes)}
              >Methodes</div>
              <div class={`py-1 w-full text-sm font-medium text-gray-700 rounded-t
              text-center select-none cursor-pointer
              ${contentIndex() === UMLContextMenu.Relationships
                  ? "bg-white border-sky-400 border-x border-t"
                  : "border border-gray-400 bg-white border-b-sky-400 hover:border-sky-400 text-gray-400 hover:text-gray-700"}`}
                onclick={() => setContextIndex(UMLContextMenu.Relationships)}
              >Relationships</div>
              {/* <Button title="" onclick={() => setContextIndex(1)} /> */}
            </div>
          </div>
          {/* Tabs content */}
          <Switch>
            <Match when={contentIndex() === UMLContextMenu.Attributes} >
              <div id="attr-container" class="flex flex-col overflow-hidden max-h-max bg-white rounded-b border-x border-b border-sky-400 p-2 shadow">
                <Button title='Add attribute' onclick={pushAttribute} />
                <div class="overflow-y-auto h-full">
                  <For each={selectedClass().attributes}>
                    {(attr, i) => <UMLAttributeContainer
                      index={i()}
                      attr={attr}
                      update={startUpdateView}
                      delete={() => popAttribute(i())} />}
                  </For>
                </div>
              </div>
            </Match>
            <Match when={contentIndex() === UMLContextMenu.Methodes} >
              <div id="meth-container" class="flex flex-col overflow-hidden max-h-max bg-white rounded-b border-x border-b border-sky-400 p-2 shadow">
                <Button title='Add methode' onclick={pushMethode} />
                <div class="overflow-y-auto h-full">
                  <For each={selectedClass().methodes}>
                    {(methode, iMethode) => {
                      return (<UMLMethodeContainer
                        index={iMethode()}
                        methode={methode}
                        delete={() => popMethode(iMethode())}
                        onPushParameter={() => pushParameter(iMethode())}>

                        <For each={selectedClass().methodes[iMethode()].parameters}>
                          {(param, iParam) => <UMLParameterContainer
                            param={param}
                            popParameter={() => popParameter(iMethode(), iParam())}
                          />}
                        </For>
                      </UMLMethodeContainer>);
                    }}
                  </For>
                </div>
              </div>
            </Match>
            <Match when={contentIndex() === UMLContextMenu.Relationships} >
              <div id="meth-container" class="flex flex-col overflow-hidden max-h-max bg-white rounded-b border-x border-b border-sky-400 p-2 shadow">
                <Button title='Add Relationships' onclick={pushRelationship} />
                <div class="overflow-y-auto h-full">
                  <For each={internalStore.relationships.filter(x => x.children.uuid === selectedClass().uuid)}>
                    {(relationShip, iRelationship) => {
                      return <UMLRelationshipContainer
                        index={iRelationship()}
                        childrenClass={selectedClass()}
                        relationship={relationShip}
                        delete={popRelationship}
                      />;
                    }}
                  </For>
                </div>
              </div>
            </Match>
          </Switch>
        </div>
      </div>
    </Show>);
};