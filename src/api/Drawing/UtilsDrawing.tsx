import { selectedClass } from "../Signals";
import { internalStore, store } from "../Store";
import { UmlToString, UMLAttribute, UMLMethode, UMLClass, UMLEnum } from "../UML";
import { measureText, drawRectangle, drawTextHCenter, drawLine, drawTextHLeft } from "./CanvasDrawing";

export const drawBackground = (ctx: CanvasRenderingContext2D, {width, height} , gridSize: number, subGridSize: number)  => { 
  const xClusterShift = (store.viewOffset.x % gridSize);
  const yClusterShift = (store.viewOffset.y % gridSize);

  if (internalStore.gridInfo.subVisuale) {
    for (let x = -gridSize + xClusterShift; x < width + gridSize;) {
      drawLine(ctx, x, 0, x, height, 1, internalStore.gridInfo.color);

      for (let sx = 0; sx < internalStore.gridInfo.subCount; sx++) {
        x += subGridSize;
        drawLine(ctx, x, 0, x, height, 1, internalStore.gridInfo.subColor);
      }

      x += subGridSize;
    }

    for (let y = -gridSize + yClusterShift; y < height + gridSize;) {
      drawLine(ctx, 0, y, width, y, 1, internalStore.gridInfo.color);

      for (let sy = 0; sy < internalStore.gridInfo.subCount; sy++) {
        y += subGridSize;
        drawLine(ctx, 0, y, width, y, 1, internalStore.gridInfo.subColor);
      }

      y += subGridSize;
    }
  } else {
    for (let x = 0 + xClusterShift; x < width; x += gridSize) {
      drawLine(ctx, x, 0, x, height, 1, internalStore.gridInfo.color);
    }
    for (let y = 0 + yClusterShift; y < height; y += gridSize) {
      drawLine(ctx, 0, y, width, y, 1, internalStore.gridInfo.color);
    }
  }
}


type UMLRegionInfo = { 
  left: UMLClass,
  top: UMLClass,
  right: UMLClass,
  bottom: UMLClass
}

export const drawClass = (ctx: CanvasRenderingContext2D, xPadding: number, subGridSize: number, linePadding: number) : UMLRegionInfo | null => {
 
  let regionInfo: UMLRegionInfo = null;
  let nUmlClass = internalStore.classes.length;
  for (let iUmlClass = 0; iUmlClass <  nUmlClass; iUmlClass++) {

    const umlClass : UMLClass = internalStore.classes[iUmlClass];

    let titleSize = measureText(ctx, UmlToString(umlClass));
    let attrSizes = umlClass.attributes?.map((x: UMLAttribute) => {
      let measuredText = measureText(ctx, UmlToString(x));
      if ('decoration' in measuredText) {
        measuredText.decoration.underline = x.isStatic ?? false;
      }
      return measuredText;
    }) ?? [];
    let methSizes = umlClass.methodes?.map((x: UMLMethode) => {
      let measuredText = measureText(ctx, UmlToString(x));
      if ('decoration' in measuredText) {
        measuredText.decoration.underline = x.isStatic ?? false;
      }
      return measuredText;
    }) ?? [];

    let maxHeaderBoxSize = titleSize.height + (xPadding / 2);
    let widestElementValue = Math.max(
      titleSize.width + xPadding,
      ...methSizes?.map(x => x.width + xPadding),
      ...attrSizes?.map(x => x.width + xPadding));

    let girdWidth = Math.ceil(widestElementValue / subGridSize);
    let maxBoxWidth = (girdWidth % 2 === 0 ? girdWidth + 1 : girdWidth) * subGridSize - 1;

    let maxAttrBoxHeight = Math.max(attrSizes?.reduce((p, c) => p + c.height, 0), 10 * store.zoom);
    let maxMethBoxHeight = Math.max(methSizes?.reduce((p, c) => p + c.height, 0), 10 * store.zoom);

    const xClassOffset = store.viewOffset.x + (umlClass.x * store.zoom);
    const yClassOffset = store.viewOffset.y + (umlClass.y * store.zoom);

    let maxBoxHeight = maxHeaderBoxSize + maxAttrBoxHeight + maxMethBoxHeight + (linePadding + linePadding + linePadding);

    if(iUmlClass === 0) {
      regionInfo = {
        left: umlClass,
        right: umlClass,
        top: umlClass,
        bottom: umlClass,
      }
    } else {
      if(umlClass.x < regionInfo.left.x) { 
        regionInfo.left = umlClass;
      } else if(umlClass.x > regionInfo.right.x) { 
        regionInfo.right = umlClass;
      }
      
      if(umlClass.y < regionInfo.top.y) { 
        regionInfo.top = umlClass;
      } else if(umlClass.y > regionInfo.bottom.y) { 
        regionInfo.bottom = umlClass;
      }
    }

    if (umlClass.uuid === selectedClass()?.uuid) {

      let borderColor = internalStore.classDrawInfo.selectColor;
      ctx.shadowColor = borderColor as string;
      ctx.shadowBlur = 7;

      drawRectangle(ctx, xClassOffset, yClassOffset, maxBoxWidth, maxBoxHeight, borderColor, internalStore.classDrawInfo.background);

      ctx.shadowBlur = 0;
    } else {

      let borderColor = internalStore.classDrawInfo.deselectColor;
      drawRectangle(ctx, xClassOffset, yClassOffset, maxBoxWidth, maxBoxHeight, borderColor, internalStore.classDrawInfo.background);

    }

    // draw heder 
    //drawRectangle(ctx, xClassOffset, yClassOffset, maxBoxWidth, maxHeaderBoxSize, borderColor, internalStore.classDrawInfo.background);
    drawTextHCenter(ctx, xClassOffset, yClassOffset + (xPadding / 4), maxBoxWidth, xPadding, titleSize, internalStore.classDrawInfo.fontColor);

    // draw attributes
    let yOffset = yClassOffset + maxHeaderBoxSize;
    drawLine(ctx, xClassOffset, yOffset, xClassOffset + maxBoxWidth, yOffset, 1, "black");
    yOffset += linePadding;
    //drawRectangle(ctx, xClassOffset, yOffset, maxBoxWidth, maxAttrBoxHeight, borderColor, internalStore.classDrawInfo.background);
    for (let attr of attrSizes) {
      drawTextHLeft(ctx, xClassOffset, yOffset, xPadding, attr, internalStore.classDrawInfo.fontColor);
      yOffset += attr.height;
    }

    // draw methodes
    yOffset = yClassOffset + maxHeaderBoxSize + maxAttrBoxHeight;
    yOffset += linePadding;
    drawLine(ctx, xClassOffset, yOffset, xClassOffset + maxBoxWidth, yOffset, 1, "black");
    yOffset += linePadding;
    //drawRectangle(ctx, xClassOffset, yOffset, maxBoxWidth, maxMethBoxHeight, borderColor, internalStore.classDrawInfo.background);
    for (let meth of methSizes) {
      drawTextHLeft(ctx, xClassOffset, yOffset, xPadding, meth, internalStore.classDrawInfo.fontColor);
      yOffset += meth.height;
    }

    // set new size
    umlClass.width = maxBoxWidth;
    umlClass.height = maxHeaderBoxSize + maxAttrBoxHeight + maxMethBoxHeight + (3 * linePadding);
    ctx.shadowBlur = 0;
  }

  return regionInfo;
};

