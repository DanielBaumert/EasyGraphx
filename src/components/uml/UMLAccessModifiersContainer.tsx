import CheckBox from "../basic/CheckBox";
import LabelSmall from "../basic/LabelSmall";



const UMLAccessModifiersContainer = (props) => {
    const [accessModifier, setAccessModifier] = createState(props.initValue);

  return (
    <>
     <LabelSmall title="Access Modifiers"/>
        <div className="grid grid-cols-2 gap-x-3">
            <div className="flex flex-col">
                <CheckBox 
                    title="Public (+)" 
                    id={`public-${props.id}`}
                    value={accessModifier() === UMLAccessModifiers.Public} 
                    onChanges={() => updateAccessModifier(UMLAccessModifiers.Public)} />
                <CheckBox 
                    title="Protected (#)" 
                    id={`protected-${props.id}`}
                    value={accessModifier() === UMLAccessModifiers.Proteced} 
                    onChanges={() => updateAccessModifier(UMLAccessModifiers.Proteced)}/>
            </div>
            <div className="flex flex-col ">
                <CheckBox 
                    title="Private (-)"
                    id={`private-${props.id}`}
                    value={accessModifier() === UMLAccessModifiers.Private} 
                    onChanges={() => updateAccessModifier(UMLAccessModifiers.Private)} />
                <CheckBox 
                    title="Internal (~)" 
                    id={`internal-${props.id}`}
                    value={accessModifier() === UMLAccessModifiers.Internal} 
                    onChanges={() => updateAccessModifier(UMLAccessModifiers.Internal)}/>
            </div>
        </div>
    </>
  );
}