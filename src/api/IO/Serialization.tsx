import { UMLAttribute, UMLClass, UMLMethode, UMLPackage, UMLParameter, UMLRelationshipImportExport } from "../UML";

const classes = {
  UMLAttribute,
  UMLParameter,
  UMLMethode,
  UMLClass,
  UMLPackage,
  UMLRelationshipImportExport
};

export function serialize(object: any) { 

  return JSON.stringify(object, (_, value) => {
    if (value && typeof(value) === "object") {
      value.__type = value.constructor.name;
    }
    return value;
  });

}

export function deserialize(json : string) { 
  
  return JSON.parse(json, (_, value) => {
    if (value && typeof (value) === "object" && value.__type) {
      if(value.__type !== "Object") {
        const dynamicClass = classes[value.__type]
        value = Object.assign(new dynamicClass(), value);
        delete value.__type;
      }
    }
    return value;
  });
}