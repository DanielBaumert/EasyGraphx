import { useState } from "react";
import { CheckBox, LabelSmall } from ".."
import { UMLAccessModifiers } from "../../api/Uml";


type UMLAccessModifiersContainerProps = {
  id: string,
  initValue?: UMLAccessModifiers,
  onChange: (accessModifier?: UMLAccessModifiers) => void;
}

export default (props: UMLAccessModifiersContainerProps) => {

  const [accessModifier, setAccessModifier] = useState<UMLAccessModifiers | undefined>(props.initValue);

  function updateAccessModifier(modifiers: UMLAccessModifiers) {
    const state = accessModifier != modifiers ? modifiers : undefined;
    setAccessModifier(state);
    props.onChange(state);
  }

  return (
    <>
      <LabelSmall title="Access Modifiers" />
      <div className="grid grid-cols-2 gap-x-3">
        <div className="flex flex-col">
          <CheckBox
            title="Public (+)"
            id={`public-${props.id}`}
            initValue={accessModifier === UMLAccessModifiers.Public}
            onChanges={() => updateAccessModifier(UMLAccessModifiers.Public)} />
          <CheckBox
            title="Protected (#)"
            id={`protected-${props.id}`}
            initValue={accessModifier === UMLAccessModifiers.Protected}
            onChanges={() => updateAccessModifier(UMLAccessModifiers.Protected)} />
        </div>
        <div className="flex flex-col ">
          <CheckBox
            title="Private (-)"
            id={`private-${props.id}`}
            initValue={accessModifier === UMLAccessModifiers.Private}
            onChanges={() => updateAccessModifier(UMLAccessModifiers.Private)} />
          <CheckBox
            title="Internal (~)"
            id={`internal-${props.id}`}
            initValue={accessModifier === UMLAccessModifiers.Internal}
            onChanges={() => updateAccessModifier(UMLAccessModifiers.Internal)} />
        </div>
      </div>
    </>
  )
}