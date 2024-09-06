import { Component, Show } from "solid-js";
import { UMLPackage } from ".";
import { Field, Label } from "../UI";
import { selectedPackage, setSelectedPackage } from "../Signals";
import { startUpdateView } from "../GlobalState";



export const UMLPackageComponent: Component = () => {

  function onNameInputChanged(e) {
    selectedPackage().name = e.currentTarget.value;
    setSelectedPackage(selectedPackage());
    startUpdateView();
  }

  return (
    <Show when={selectedPackage()}>
      <div id="side-nav" class="fixed flex max-h-screen top-0 right-0 p-4 min-w-[351px]">
        <div class="flex grow flex-col">
          <div class="bg-white rounded border border-sky-400 px-4 py-2 mb-4 shadow">
            <Label title="Package" />
            <Field title='Name'
              initValue={selectedPackage().name}
              onInputChange={onNameInputChanged} />
          </div>
        </div>
      </div>
    </Show>
  )
}