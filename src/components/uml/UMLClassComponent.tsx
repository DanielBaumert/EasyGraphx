import { useState } from "react";
import { UMLClass } from "../../api/Uml";
import { Button, CheckBox, Field, Label, NavItem, UMLAttributeContainer } from "..";
import { type Node } from "@xyflow/react";
import Navbar from "../basic/Navbar";
import UMLMethodeContainer from "./UMLMethodContainer";

enum UMLContextMenu {
  Attributes,
  Methodes,
  Relationships
}

type UMLClassComponentProps = {
  node: Node<UMLClass>
  setNodes: React.Dispatch<React.SetStateAction<Node<UMLClass>[]>>;
};

export default (props: UMLClassComponentProps) => {
  const [contentIndex, setContextIndex] = useState<UMLContextMenu>(UMLContextMenu.Attributes);

  const updateNode = (data: Partial<UMLClass>) => {
    props.setNodes(nodes => nodes.map(node => {
      if (node.id === props.node.id) {
        return {
          ...node,
          data: {
            ...node.data,
            ...data
          }
        };
      }
      return node;
    }));
  };

  return (
    <>
      <div id="side-nav" className="fixed flex max-h-screen top-0 right-0 p-4 min-w-1/4 gap-2">
        <div className="flex grow flex-col gap-2">
          <div className="bg-white dark:bg-[#3e3e3e] rounded border-2 border-sky-400 px-4 py-2 shadow">
            <Label title="Class" />
            <Field title='Property'
              initValue={props.node.data.property}
              onInputChange={e => updateNode({ property: e.target.value })} />
            <Field title='Name'
              initValue={props.node.data.name}
              onInputChange={e => updateNode({ name: e.target.value })} />
            <CheckBox id="static" title="Abstract" initValue={props.node.data.isAbstract ?? false}
              onChanges={(e) => updateNode({ isAbstract: e.target.checked })}
            />
          </div>
          <div className="relative flex flex-col overflow-hidden">
          {/* Tabs */}
          <Navbar>
            <NavItem
              title="Attributes"
              onClick={() => setContextIndex(UMLContextMenu.Attributes)}
              isActive={contentIndex === UMLContextMenu.Attributes} />
            <NavItem
              title="Methodes"
              onClick={() => setContextIndex(UMLContextMenu.Methodes)}
              isActive={contentIndex === UMLContextMenu.Methodes} />
            <NavItem
              title="Relationships"
              onClick={() => setContextIndex(UMLContextMenu.Relationships)}
              isActive={contentIndex === UMLContextMenu.Relationships} />
          </Navbar>
          {/* Tabs content */}
          {contentIndex === UMLContextMenu.Attributes && (
            <div id="attr-container" className="flex flex-col overflow-hidden max-h-max bg-white dark:bg-[#3e3e3e] rounded-b-2 border-2 border-sky-400 p-2 shadow">
              <div className="pb-2">
                <Button title='Add attribute' /*onClick={pushAttribute} */ />
              </div>
              <div className="overflow-y-auto h-full flex flex-col gap-1">
                {props.node.data.attributes.map((attr, i) => (
                  <UMLAttributeContainer
                    key={i}
                    index={i}
                    attr={attr}
                    update={(data) => updateNode({
                      attributes: props.node.data.attributes.map((attr, iAttr) => {
                        if (iAttr === i) {
                          return data;
                        }

                        return attr;
                      })
                    })}
                    delete={() => { }} />
                ))}
              </div>
            </div>)}
          {contentIndex === UMLContextMenu.Methodes && (
            <div id="meth-container" className="flex flex-col overflow-hidden max-h-max bg-white dark:bg-[#3e3e3e] rounded-b-2 border-2 border-sky-400 p-2 shadow">
              <div className="pb-2">
                <Button title='Add methode' /*onClick={pushMethode} */ />
              </div>
              <div className="overflow-y-auto h-full flex flex-col gap-2">
                {props.node.data.methods.map((methode, iMethode) => {
                  return (
                    <UMLMethodeContainer
                      key={iMethode}
                      index={iMethode}
                      methode={methode}
                      update={data => updateNode({
                        methods: props.node.data.methods.map((m, i) => {
                          if (i === iMethode) {
                            return data;
                          }
                          return m;
                        })
                      })}
                    />
                  );
                })}
              </div>
            </div>)}
          {contentIndex === UMLContextMenu.Relationships && (
            <div id="rel-container" className="flex flex-col overflow-hidden max-h-max bg-white rounded-b border-x border-b border-sky-400 p-2 shadow"></div>)}
        </div>
      </div>
      </div>
    </>);

}


 {/* <Button title='Add Relationships' onClick={pushRelationship} />
                <div className="overflow-y-auto h-full">
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
              </div> */}