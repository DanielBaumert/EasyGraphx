import { Component, createSignal, Show } from "solid-js";
import { Checkbox, DropDownArrowIcon, Field } from "../UI";
import { UMLAttribute } from ".";
import { UMLAccessModifiersContainer } from "./UMLAccessModifiers";

export const UMLAttributeContainer: Component<{
  index: number,
  attr: UMLAttribute,
  delete: Function,
  update: Function,
}> = (props) => {
  const [isExpanded, setExpanded] = createSignal<boolean>(true);
  const [isAttributeNameNotEmpty, setAttributeNameNotEmpty] = createSignal<boolean>(props.attr.name !== "");

  return (
    <div
      class={`relative flex flex-row bg-white rounded border ${isAttributeNameNotEmpty() ? "border-sky-400" : "border-red-400"} p-2 mb-2 shadow`}>
      <Show when={isExpanded()}>
        <div class="flex flex-col">
          <Field title="Name"
            initValue={props.attr.name}
            onInputChange={e => { props.attr.name = e.currentTarget.value; setAttributeNameNotEmpty(props.attr.name !== ""); props.update(); }} />
          <div class="grid grid-cols-2">
            <Checkbox
              id={`static-attribute-${props.index}`}
              title="Static"
              value={props.attr.isStatic}
              onChanges={e => { props.attr.isStatic = e.currentTarget.checked; props.update(); }} />
            <Checkbox
              id={`constant-attribute-${props.index}`}
              title="Constant"
              value={props.attr.isConstant}
              onChanges={e => { props.attr.isConstant = e.currentTarget.checked; props.update(); }} />
          </div>
          <UMLAccessModifiersContainer
            id={`attribute-${props.index}`}
            initValue={props.attr.accessModifier}
            onChange={(mod) => { props.attr.accessModifier = mod; props.update(); }} />
          <Field title="Type"
            initValue={props.attr.type}
            onInputChange={e => { props.attr.type = e.currentTarget.value; props.update(); }} />
          <Field title="Default value"
            initValue={props.attr.defaultValue}
            onInputChange={e => { props.attr.defaultValue = e.currentTarget.value; props.update(); }} />
          <button class="
                        py-1 w-full rounded mb-1 
                        border border-gray-200 
                        text-sm font-medium text-gray-700 
                        hover:bg-red-500 hover:text-white hover:shadow"
            onClick={e => props.delete()}>
            Delete
          </button>
        </div>
      </Show>
      <Show when={!isExpanded()}>
        <label for={this}
          class="
                text-sm text-gray-500 
                dark:text-gray-400 duration-300 
                scale-75 origin-[0]">
          {isAttributeNameNotEmpty() ? props.attr.name : "unnamed"}
        </label>
      </Show>
      <div class="absolute flex flex-row top-1.5 right-1">
        <div class={isExpanded() ? 'group rotate-180' : 'group'} onClick={() => setExpanded(!isExpanded())}>
          <DropDownArrowIcon />
        </div>
      </div>
    </div>
  );
}


