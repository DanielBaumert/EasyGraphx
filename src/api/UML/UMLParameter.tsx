import { Component, createSignal, Show } from "solid-js";
import { UMLParameter, UmlToString } from ".";
import { startUpdateView } from "../GlobalState";
import { Field, SmallLabel } from "../UI";


export const UMLParameterContainer: Component<{
  param: UMLParameter,
  popParameter: Function,
}> = (props) => {
  const [isExpanded, setExpanded] = createSignal<boolean>(true);

  function onNameInputChanged(e) {
    props.param.name = e.currentTarget.value;
    startUpdateView();
  }

  function onTypeInputChanged(e) {
    props.param.type = e.currentTarget.value;
    startUpdateView();
  }


  function getCollapesedLabel(): string {
    const label = UmlToString(props.param);
    if(label === '') 
      return 'Unnamed';

    if(label.length < 26)
      return label;


    return `${label.substring(0, 26)}...`;
  }

  return (
    <div class="relative border rounded p-1 mb-1">
      <div class={`absolute flex flex-row ${!isExpanded() ? "h-full items-center top-0" : "top-1"} right-1`}>
        <div class="group" onClick={() => props.popParameter()}>
          <svg class="w-4 h-4 group-hover:stroke-red-500 group-hover:shadow"
            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width={2} stroke="currentColor" >
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <div class={isExpanded() ? 'group rotate-180' : 'group'} onClick={() => setExpanded(!isExpanded())}>
          <svg class="w-4 h-4 group-hover:shadow"
            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width={2} stroke="currentColor" >
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </div>
      <Show when={isExpanded()}>
        <Field
          title="Name"
          initValue={props.param.name}
          onInputChange={onNameInputChanged} />
        <Field
          title="Type"
          initValue={props.param.type}
          onInputChange={onTypeInputChanged} />
      </Show>
      <Show when={!isExpanded()}>
        <SmallLabel title={getCollapesedLabel()} />
      </Show>
    </div>
  );
};
