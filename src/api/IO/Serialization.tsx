import { UMLAccessModifiers, UMLAttribute, UMLClass, UMLMethode, UMLParameter } from "../UML";
import { UMLRelationshipContainer } from "../UML/UMLRelationship";

const classes = {
  UMLAttribute,
  UMLParameter,
  UMLMethode,
  UMLClass,
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
      const DynamicClass = classes[value.__type]
      value = Object.assign(new DynamicClass(), value);
      delete value.__type;
    }
    return value;
  });
}