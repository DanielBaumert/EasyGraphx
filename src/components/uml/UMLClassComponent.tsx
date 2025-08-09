import { useState } from "react";
import { UMLClass } from "../../api/Uml";
import { Button, CheckBox, Field, Label } from "..";

enum UMLContextMenu {
  Attributes,
  Methodes,
  Relationships
}

type UMLClassComponentProps = {
  selectedClass?: UMLClass;
};

export default (props: UMLClassComponentProps) => {

  const [contentIndex, setContextIndex] = useState<UMLContextMenu>(UMLContextMenu.Attributes);

  return (
    props.selectedClass &&
    <>
      <div id="side-nav" className="fixed flex max-h-screen top-0 right-0 p-4 min-w-2/12">
        <div className="flex grow flex-col">
          <div className="bg-white rounded border border-sky-400 px-4 py-2 mb-4 shadow">
            <Label title="Class" />
            <Field title='Property'
              initValue={props.selectedClass!.property}
              onInputChange={e => {
                // if (selectedClass().property?.trim().toLowerCase() !== "interface" // source become an interface
                //   && e.currentTarget.value.trim().toLowerCase() === "interface") {

                // } else if (selectedClass().property.trim().toLowerCase() === "interface"
                //   && e.currentTarget.value.trim().toLowerCase() !== "interface") {

                // }

                // selectedClass().property = e.currentTarget.value;
                // setSelectedClass(selectedClass());
                // startUpdateView();
              }} />
            <Field title='Name'
              initValue={props.selectedClass!.name}
               /*onInputChange={onNameInputChanged}*/ />
            <CheckBox id="static" title="Abstract" value={props.selectedClass!.isAbstract!}
            //  onChanges={updateIsStatic} 
             />
          </div>
          {/* Tabs */}
          <div>
            <div className='flex flex-row justify-between'>
              <div className={`py-1 w-full text-sm font-medium text-gray-700 rounded-t
            text-center select-none cursor-pointer
            ${contentIndex === UMLContextMenu.Attributes
                  ? "bg-white border-sky-400 border-x border-t"
                  : "border border-gray-400 bg-white border-b-sky-400 hover:border-sky-400 text-gray-400 hover:text-gray-700"}`}
                onClick={() => setContextIndex(UMLContextMenu.Attributes)}
              >Attributes</div>
              <div className={`py-1 w-full text-sm font-medium text-gray-700 rounded-t
            text-center select-none cursor-pointer
            ${contentIndex === UMLContextMenu.Methodes
                  ? "bg-white border-sky-400 border-x border-t"
                  : "border border-gray-400 bg-white border-b-sky-400 hover:border-sky-400 text-gray-400 hover:text-gray-700"}`}
                onClick={() => setContextIndex(UMLContextMenu.Methodes)}
              >Methodes</div>
              <div className={`py-1 w-full text-sm font-medium text-gray-700 rounded-t
            text-center select-none cursor-pointer
            ${contentIndex === UMLContextMenu.Relationships
                  ? "bg-white border-sky-400 border-x border-t"
                  : "border border-gray-400 bg-white border-b-sky-400 hover:border-sky-400 text-gray-400 hover:text-gray-700"}`}
                onClick={() => setContextIndex(UMLContextMenu.Relationships)}
              >Relationships</div>
              {/* <Button title="" onclick={() => setContextIndex(1)} /> */}
            </div>
          </div>
          {/* Tabs content */}
          {(() => {
            switch (contentIndex) {
              case UMLContextMenu.Attributes:
                return (
                  <div id="attr-container" className="flex flex-col overflow-hidden max-h-max bg-white rounded-b border-x border-b border-sky-400 p-2 shadow">
                    <Button title='Add attribute' /*onClick={pushAttribute} *//>
                    <div className="overflow-y-auto h-full">
                      {/* <For each={selectedClass().attributes}>
                        {(attr, i) => <UMLAttributeContainer
                          index={i()}
                          attr={attr}
                          update={startUpdateView}
                          delete={() => popAttribute(i())} />}
                      </For> */}
                    </div>
                  </div>)
              case UMLContextMenu.Methodes:
                return (
                  <div id="meth-container" className="flex flex-col overflow-hidden max-h-max bg-white rounded-b border-x border-b border-sky-400 p-2 shadow">
                    <Button title='Add methode' /*onClick={pushMethode} *//>
                    <div className="overflow-y-auto h-full">
                      {/* <For each={selectedClass().methodes}>
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
                      </For> */}
                    </div>
                  </div>);
              case UMLContextMenu.Relationships:
                // return (
                //   <div id="meth-container" className="flex flex-col overflow-hidden max-h-max bg-white rounded-b border-x border-b border-sky-400 p-2 shadow">
                //     <Button title='Add Relationships' onClick={pushRelationship} />
                //     <div className="overflow-y-auto h-full">
                //       <For each={internalStore.relationships.filter(x => x.children.uuid === selectedClass().uuid)}>
                //         {(relationShip, iRelationship) => {
                //           return <UMLRelationshipContainer
                //             index={iRelationship()}
                //             childrenClass={selectedClass()}
                //             relationship={relationShip}
                //             delete={popRelationship}
                //           />;
                //         }}
                //       </For>
                //     </div>
                //   </div>);
            }
          })()}
        </div>
      </div>
    </>);

}