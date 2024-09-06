import { createSignal, ParentComponent, Show } from "solid-js";
import { UMLMethode, UMLAccessModifiers } from ".";
import { startUpdateView } from "../GlobalState";
import { Field, SmallLabel, Button, DropDownArrowIcon, Checkbox } from "../UI";
import { UMLAccessModifiersContainer } from "./UMLAccessModifiers";



export const UMLMethodeContainer: ParentComponent<{
  index: number,
  methode: UMLMethode,
  delete: Function,
  onPushParameter: Function;
}> = (props) => {
  const [isExpanded, setExpanded] = createSignal<boolean>(true);
  const [isMethodeNameNotEmpty, setMethodeNameNotEmpty] = createSignal<boolean>(props.methode.name !== "");

  function onMethodeNameInputChanged(e) {
    props.methode.name = e.currentTarget.value;
    setMethodeNameNotEmpty(props.methode.name !== "");
    startUpdateView();
  }

  function onStaticPropertyStateChanged(e) {
    props.methode.isStatic = e.currentTarget.checked;
    startUpdateView();
  }

  function onReturnTypeInputChanged(e) {
    props.methode.returnType = e.currentTarget.value;
    startUpdateView();
  }

  return (
    <div class={`relative flex flex-row bg-white rounded border ${isMethodeNameNotEmpty() ? "border-sky-400" : "border-red-400"} p-2 mb-2 shadow`}>
      <Show when={isExpanded()}>
        <div class="flex flex-col">
          <Field
            title="Name"
            initValue={props.methode.name}
            onInputChange={onMethodeNameInputChanged} />
          <Checkbox
            id={`static-methode-${props.index}`}
            title="Static"
            value={props.methode.isStatic}
            onChanges={onStaticPropertyStateChanged} />
          <UMLAccessModifiersContainer
            id={`methode-${props.index}`}
            initValue={props.methode.accessModifier}
            onChange={(mod: UMLAccessModifiers) => { props.methode.accessModifier = mod; startUpdateView(); }} />
          <SmallLabel title="Parameters" />
          <Button title='Add parameter' onclick={() => props.onPushParameter()} />
          <div class="flex flex-col p-1 rounded border border-sky-400">
            {props.children}
          </div>
          <Field title="Return type"
            initValue={props.methode.returnType}
            onInputChange={onReturnTypeInputChanged} />
          <button class="
                        py-1 w-full rounded mb-1 
                        border border-gray-200 
                        text-sm font-medium text-gray-700 
                        hover:bg-red-500 hover:text-white hover:shadow"
            onClick={() => props.delete()}>
            Delete
          </button>
        </div>
      </Show>
      <Show when={!isExpanded()}>
        <label for={this}
          class="text-sm text-gray-500 duration-300 scale-75 origin-[0]">
          {isMethodeNameNotEmpty() ? props.methode.name : "unnamed"}
        </label>
      </Show>
      <div class="absolute flex flex-row top-1.5 right-1">
        <div class={isExpanded() ? 'group rotate-180' : 'group'} onClick={() => setExpanded(!isExpanded())}>
          <DropDownArrowIcon />
        </div>
      </div>
    </div>
  );
};