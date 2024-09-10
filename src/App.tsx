import { Component, children, onMount } from 'solid-js';
import { ContextMenu, ContextOpenMode, Label, NavItem } from './api/UI';
import { drawTextHCenter, measureText, drawRectangle, drawTextHLeft, drawLine, drawNone } from './api/Drawing/CanvasDrawing';
import { internalStore, setStore, store } from './api/Store';
import { changingsObserved, endUpdateView, startUpdateView } from './api/GlobalState';
import { selectedClass, setContextMenuOpen, locationContextMenu, isContextMenuOpen } from './api/Signals';
import { onCanvasMouseDown, onCanvasMouseMove, onCanvasMouseUp } from './api/Peripheral/Mouse';
import { Math2 } from './api/Math2';
import Canvas, { canvas } from './api/UI/Canvas';
import { UMLArrowMode, UMLAttribute, UMLClass, UMLEnum, UMLInterface, UMLLineMode, UMLMethode, UMLPackage, UMLRelationshipType, UmlToString } from './api/UML';
import { UMLClassComponent } from './api/UML/UMLClass';
import { Point } from './api/Drawing';
import { deserialize, serialize } from './api/IO/Serialization';
import { UMLPackageComponent } from './api/UML/UMLPackage';


const App: Component = () => {

  let frameNumber: number;
  let ctx: CanvasRenderingContext2D;

  onMount(() => {
    window.addEventListener("resize", e => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      startUpdateView();
    });

    window.addEventListener("click", () => {
      // close the context menu by any click in the view
      if (isContextMenuOpen()) {
        setContextMenuOpen(false);
      }
    });

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx = canvas.getContext("2d");
    ctx.translate(0.5, 0.5);
    requestAnimationFrame(() => render(ctx));
  });

  function render(ctx: CanvasRenderingContext2D) {
    if (changingsObserved) {
      ctx.imageSmoothingQuality = 'high';
      ctx.imageSmoothingEnabled = true;

      ctx.fillStyle = internalStore.gridInfo.background;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      const gridSize = internalStore.gridInfo.space * store.zoom;
      const subGridSize = gridSize / (1 + internalStore.gridInfo.subCount);

      // Draw background
      {
        const xClusterShift = (store.viewOffset.x % gridSize);
        const yClusterShift = (store.viewOffset.y % gridSize);

        if (internalStore.gridInfo.subVisuale) {
          for (let x = -gridSize + xClusterShift; x < canvas.width + gridSize;) {
            drawLine(ctx, x, 0, x, canvas.height, 1, internalStore.gridInfo.color);

            for (let sx = 0; sx < internalStore.gridInfo.subCount; sx++) {
              x += subGridSize;
              drawLine(ctx, x, 0, x, canvas.height, 1, internalStore.gridInfo.subColor);
            }

            x += subGridSize;
          }

          for (let y = -gridSize + yClusterShift; y < canvas.height + gridSize;) {
            drawLine(ctx, 0, y, canvas.width, y, 1, internalStore.gridInfo.color);

            for (let sy = 0; sy < internalStore.gridInfo.subCount; sy++) {
              y += subGridSize;
              drawLine(ctx, 0, y, canvas.width, y, 1, internalStore.gridInfo.subColor);
            }

            y += subGridSize;
          }
        } else {
          for (let x = 0 + xClusterShift; x < canvas.width; x += gridSize) {
            drawLine(ctx, x, 0, x, canvas.height, 1, internalStore.gridInfo.color);
          }
          for (let y = 0 + yClusterShift; y < canvas.height; y += gridSize) {
            drawLine(ctx, 0, y, canvas.width, y, 1, internalStore.gridInfo.color);
          }
        }
      }
      // Font setup
      const linePadding = 2;
      ctx.font = `${store.fontSize * store.zoom}px Arial`;
      const xPadding = 16 * store.zoom;
      // Draw Packages
      {
        for (let umlPackage of internalStore.packages) {
          let titleSize = measureText(ctx, umlPackage.name);
          let maxHeaderBoxSize = titleSize.height + (xPadding / 2);
          let widestElementValue = titleSize.width + xPadding;
          let girdWidth = Math.ceil(widestElementValue / subGridSize);
          let maxBoxWidth = (girdWidth % 2 === 0 ? girdWidth + 1 : girdWidth) * subGridSize - 1;

          const xClassOffset = store.viewOffset.x + (umlPackage.x * store.zoom);
          const yClassOffset = store.viewOffset.y + (umlPackage.y * store.zoom);

          let maxBoxHeight = maxHeaderBoxSize + (linePadding + linePadding);
          let borderColor = internalStore.classDrawInfo.deselectColor;

          drawRectangle(ctx, xClassOffset, yClassOffset, maxBoxWidth, maxBoxHeight, borderColor, internalStore.classDrawInfo.background);
          drawTextHLeft(ctx, xClassOffset, yClassOffset + (xPadding / 4), xPadding, titleSize, internalStore.classDrawInfo.fontColor);

          umlPackage.width = maxBoxWidth;
          umlPackage.height = maxHeaderBoxSize + (2 * linePadding);
        }
      }
      // Draw classes
      {

        for (let umlClass of internalStore.classes) {
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
          let maxBoxWidth =
            (girdWidth % 2 === 0 ? girdWidth + 1 : girdWidth) * subGridSize - 1;

          let maxAttrBoxHeight = Math.max(attrSizes?.reduce((p, c) => p + c.height, 0), 10 * store.zoom);
          let maxMethBoxHeight = Math.max(methSizes?.reduce((p, c) => p + c.height, 0), 10 * store.zoom);

          const xClassOffset = store.viewOffset.x + (umlClass.x * store.zoom);
          const yClassOffset = store.viewOffset.y + (umlClass.y * store.zoom);

          let maxBoxHeight = maxHeaderBoxSize + maxAttrBoxHeight + maxMethBoxHeight + (linePadding + linePadding + linePadding);

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
      }
      // Draw connections
      {
        let arrowSize = store.fontSize * .8;
        for (const relationships of internalStore.relationships.filter(x => x.parent !== undefined)) {
          // calc vector
          let lineMode = UMLLineMode[relationships.type] ?? drawNone;
          let arrowMode = UMLArrowMode[relationships.type] ?? drawNone;
          let fillMode = relationships.type === UMLRelationshipType.composition
            ? "black"
            : "white";

          let dx = relationships.children.x - relationships.parent.x;
          let dy = relationships.children.y - relationships.parent.y;
          let m = Math.atan(dy / dx);

          if (-Math2.RAD45 < m && m < Math2.RAD45) {
            // LR
            if (relationships.parent.x < relationships.children.x) {
              // parent left
              let srcx = store.viewOffset.x + relationships.parent.x + relationships.parent.width;
              let srcy = store.viewOffset.y + relationships.parent.y + (relationships.parent.height * .5);

              let dstx = store.viewOffset.x + relationships.children.x;
              let dsty = store.viewOffset.y + relationships.children.y + (relationships.children.height * .5);

              let dx = dstx - srcx;
              let dy = dsty - srcy;
              let m = Math.atan(dy / dx);

              lineMode(ctx, srcx, srcy, dstx, dsty, 1, "black");
              if (arrowMode !== undefined) {
                arrowMode(ctx, srcx, srcy, arrowSize, arrowSize, m, "black", fillMode);
              }
              if (relationships.type === UMLRelationshipType.bidirectionalAssociation) {
                arrowMode(ctx, dstx, dsty, arrowSize, arrowSize, m - Math2.RAD180, "black", fillMode);
              }
            } else {
              // parent right
              let srcx = store.viewOffset.x + relationships.children.x + relationships.children.width;
              let srcy = store.viewOffset.y + relationships.children.y + (relationships.children.height * .5);

              let dstx = store.viewOffset.x + relationships.parent.x;
              let dsty = store.viewOffset.y + relationships.parent.y + (relationships.parent.height * .5);

              let dx = (dstx - srcx);
              let dy = (dsty - srcy);
              let m = Math.atan(dy / dx);

              lineMode(ctx, srcx, srcy, dstx, dsty, 1, "black");
              if (arrowMode !== undefined) {
                arrowMode(ctx, dstx, dsty, arrowSize, arrowSize, m + Math2.RAD180, "black", fillMode);
              }
              if (relationships.type === UMLRelationshipType.bidirectionalAssociation) {
                arrowMode(ctx, srcx, srcy, arrowSize, arrowSize, m, "black", fillMode);
              }
            }
          } else if (relationships.parent.y < relationships.children.y) {
            // TB
            let srcx = store.viewOffset.x + relationships.parent.x + (relationships.parent.width * .5);
            let srcy = store.viewOffset.y + relationships.parent.y + relationships.parent.height;

            let dstx = store.viewOffset.x + relationships.children.x + (relationships.children.width * .5);
            let dsty = store.viewOffset.y + relationships.children.y;

            let dx = (dstx - srcx);
            let dy = (dsty - srcy);
            let m = Math.atan(dy / dx);

            if (m < 0) {
              m -= Math2.RAD180;
            }


            lineMode(ctx, srcx, srcy, dstx, dsty, 1, "black");
            if (arrowMode !== undefined) {
              arrowMode(ctx, srcx, srcy, arrowSize, arrowSize, m, "black", fillMode);
            }
            if (relationships.type === UMLRelationshipType.bidirectionalAssociation) {
              arrowMode(ctx, dstx, dsty, arrowSize, arrowSize, m + Math2.RAD180, "black", fillMode);
            }
          } else {
            // TB
            let srcx = store.viewOffset.x + relationships.children.x + (relationships.children.width * .5);
            let srcy = store.viewOffset.y + relationships.children.y + relationships.children.height;

            let dstx = store.viewOffset.x + relationships.parent.x + (relationships.parent.width * .5);
            let dsty = store.viewOffset.y + relationships.parent.y;

            let dx = (dstx - srcx);
            let dy = (dsty - srcy);
            let m = Math.atan(dy / dx);

            if (m > 0) {
              m -= Math2.RAD180;
            }

            lineMode(ctx, srcx, srcy, dstx, dsty, 1, "black");
            if (arrowMode !== undefined) {
              arrowMode(ctx, dstx, dsty, arrowSize, arrowSize, m, "black", fillMode);
            }
            if (relationships.type === UMLRelationshipType.bidirectionalAssociation) {
              arrowMode(ctx, srcx, srcy, arrowSize, arrowSize, m + Math2.RAD180, "black", fillMode);
            }
          }
        }
      }
      // Draw hover class effect
      {
        // if(store.hoverClass !== undefined && store.hoverBorder){ 
        //   strokeRectangle(ctx, 
        //     store.viewOffset.x + (store.hoverClass.x * store.zoom), 
        //     store.viewOffset.y + (store.hoverClass.y * store.zoom), 
        //     store.hoverClass.width, store.hoverClass.height, 
        //     "green");
        // }
      }
      // draw multi selection area
      {
        if (store.selectionMode) {
          let dx = internalStore.mouseInfo.lastEvent.x - internalStore.mouseInfo.mouseSecondary.x;
          let dy = internalStore.mouseInfo.lastEvent.y - internalStore.mouseInfo.mouseSecondary.y;
          drawRectangle(ctx, internalStore.mouseInfo.mouseSecondary.x, internalStore.mouseInfo.mouseSecondary.y, dx, dy, "blue", "rgba(0,0,255,0.3)");
        }
      }

      endUpdateView();
    }

    frameNumber = requestAnimationFrame(() => render(ctx));
  }

  /*
   * Context Menu
   */

  function getPlacementLocation(): Point {
    const zoomFacktor = 1 / store.zoom;
    const gridSnap = (internalStore.gridInfo.space * store.zoom) / (1 + internalStore.gridInfo.subCount);
    const offsetX = internalStore.contextMenuRef.clientWidth;
    const offsetY = internalStore.contextMenuRef.clientHeight;

    let { x, y } = locationContextMenu();
    x = ((x - store.viewOffset.x) * zoomFacktor) - (x % gridSnap);
    y = ((y - store.viewOffset.y) * zoomFacktor) - (y % gridSnap);

    if ((internalStore.contextMenuOpenMode & ContextOpenMode.MirroredX) === ContextOpenMode.MirroredX) {
      x += offsetX;
    }

    if ((internalStore.contextMenuOpenMode & ContextOpenMode.MirroredY) === ContextOpenMode.MirroredY) {
      y += offsetY;
    }

    return { x, y };
  }

  function onContextMenuAddPackage() {
    const placement = getPlacementLocation();
    internalStore.packages.push(
      new UMLPackage(placement));
    startUpdateView();
  }

  function onContextMenuAddClass() {
    const placement = getPlacementLocation();
    internalStore.classes.push(
      new UMLClass(placement));
    startUpdateView();
  }

  function onContextMenuAddInterface() {
    const placement = getPlacementLocation();
    internalStore.classes.push(
      UMLInterface.Create(placement));

    startUpdateView();
  }

  function onContextMenuAddEnum() {
    const placement = getPlacementLocation();
    internalStore.classes.push(
      UMLEnum.Create(placement));

    startUpdateView();
  }


  function onContextMenuRemoveClass() {
    // remove class from store
    internalStore.classes = internalStore.classes.filter(x =>
      x.uuid !== selectedClass().uuid); // delete class by uuid

    // remove relationships from that class
    internalStore.relationships = internalStore.relationships.filter(x =>
      x.parent.uuid !== selectedClass().uuid // delete all relationships to 
      && x.children.uuid !== selectedClass().uuid); // delete all relationships from

    startUpdateView();
  }

  function onContextMenuSaveImage() {
    const {
      width: curWidth,
      height: curHeight
    } = canvas;

    const { x: curX, y: curY } = store.viewOffset;

    let startX = Number.MAX_VALUE;
    let endX = Number.MIN_VALUE;

    let startY = Number.MAX_VALUE;
    let endY = Number.MIN_VALUE;

    for (let element of internalStore.classes) {
      if (element.x < startX) {
        startX = element.x;
      }

      if (element.y < startY) {
        startY = element.y;
      }

      if ((element.x + element.width) > endX) {
        endX = (element.x + element.width);
      }

      if ((element.y + element.height) > endY) {
        endY = (element.y + element.height);
      }
    }

    let h = (endY - startY) + 1 /*class pixel */ + (2 * 8 /* padding*/);
    let w = (endX - startX) + 1 /*class pixel */ + (2 * 8 /* padding*/);

    setStore(
      "viewOffset",
      {
        x: -(startX - 8),
        y: -(startY - 8)
      });

    canvas.width = w;
    canvas.height = h;

    startUpdateView(() => {
      const link = document.createElement("a");
      link.download = 'download.png';
      link.href = canvas.toDataURL();
      link.click();
      link.remove();

      canvas.width = curWidth;
      canvas.height = curHeight;

      setStore(
        "viewOffset",
        {
          x: curX,
          y: curY
        });

      startUpdateView();
    });
  }

  function onContextMenuSaveState() {
    const link = document.createElement("a");
    let file = new Blob(
      [serialize(internalStore.classes[0])],
      { type: 'application/json;charset=utf-8' });
    link.download = 'config.json';
    link.href = URL.createObjectURL(file);
    link.click();
    link.remove();
  }

  function onContextMenuLoadState() {
    const fileLoader = document.createElement("input");
    fileLoader["type"] = "file";
    fileLoader["accept"] = "application/json";

    fileLoader.addEventListener('change', async e => {
      if (fileLoader.files.length > 1) {
        return;
      }

      if (fileLoader.files.length != 1) {
        return;
      }

      let file = fileLoader.files[0];
      let buffer = await file.arrayBuffer();
      let content = new TextDecoder("utf-8").decode(buffer);

      internalStore.classes.push(deserialize(content) as UMLClass);

      //   internalStore.classes = [];
      //   internalStore.relationships = [];

      //   for (let element of jsonArray.classes) {
      //     // const cls = new UMLClass({
      //     //   x: element["x"] ?? 0,
      //     //   y: element["y"] ?? 0
      //     // });
      //     // cls.property = element["property"];
      //     // cls.uuid = element["uuid"];
      //     // cls.name = element["name"],
      //     // cls.width = element["width"];
      //     // cls.height = element["height"];
      //     // cls.isAbstract = element["isAbstract"] ?? false;
      //     // cls.attributes = [];
      //     // for (let attrElement of element["attributes"] ?? []) {
      //     //   const attr: UMLAttribute = new UMLAttribute();
      //     //   attr.isStatic = attrElement["isStatic"] ?? false;
      //     //   attr.isConstant = attrElement["isConstant"] ?? false;
      //     //   attr.accessModifier = attrElement["accessModifier"] ?? null;
      //     //   attr.name = attrElement["name"];
      //     //   attr.type = attrElement["type"] ?? null;
      //     //   attr.multiplicity = attrElement["multiplicity"] ?? null;
      //     //   attr.defaultValue = attrElement["defaultValue"] ?? null;

      //     //   cls.attributes.push(attr);
      //     // }
      //     // cls.methodes = [];
      //     // for (let methElement of element["methodes"] ?? []) {
      //     //   const meth: UMLMethode = new UMLMethode();

      //     //   meth.isStatic = methElement["isStatic"] ?? false;
      //     //   meth.name = methElement["name"] ?? "methode";
      //     //   meth.returnType = methElement["returnType"] ?? null;
      //     //   meth.accessModifier = methElement["accessModifier"] ?? null;
      //     //   meth.parameters = [];

      //     //   for (let paramElement of methElement['parameters'] ?? []) {
      //     //     const param = new UMLParameter();
      //     //     param.name = paramElement["name"] ?? null;
      //     //     param.type = paramElement["type"] ?? null;

      //     //     meth.parameters.push(param);
      //     //   }

      //     //   cls.methodes.push(meth);
      //     // }


      // //     const attribues = [];
      // //     for (let attr of element.attributes) {
      // //       attribues.push(Object.assign(UMLAttribute, attr));
      // //     }

      // //     const methodes = [];
      // //     for (let meth of element.methodes) {

      // //       const parameters = [];
      // //       for (let param of meth.parameters) {
      // //         parameters.push(Object.assign(UMLParameter, param));
      // //       }
      // //       methodes.push(Object.assign(parameters), meth));
      // //     }

      // //     let cls = Object.assign(new UMLClass, element);

      // //     internalStore.classes.push(cls);
      // //   }

      // //   for (let element of jsonArray.relationships) {
      // //     let parent = internalStore.classes.find(x => x.uuid === element.parent);
      // //     let children = internalStore.classes.find(x => x.uuid === element.children);

      // //     internalStore.relationships.push(
      // //       new UMLRelationship(
      // //         children,
      // //         parent,
      // //         element["type"],
      // //         element["uuid"]));
      //   }

      startUpdateView();
    });

    fileLoader.click();
    fileLoader.remove();
  }


  /*
   * App
   */
  return (
    <div
      class="relative min-h-screen max-h-screen">
      <ContextMenu
        hidden={!isContextMenuOpen()}
        location={locationContextMenu()} >
        <NavItem title={"Add Package"}
          classExt={"hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-500"}
          onclick={onContextMenuAddPackage} />
        <NavItem title={"Add Class"}
          classExt={"hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-500"}
          onclick={onContextMenuAddClass} />
        <NavItem title={"Add Interface"}
          classExt={"hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-500"}
          onclick={onContextMenuAddInterface} />
        <NavItem title={"Add Enum"}
          classExt={"hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-500"}
          onclick={onContextMenuAddEnum} />
        <NavItem title="Delete Class"
          classExt={"hover:bg-red-500"}
          hidden={selectedClass() === null}
          onclick={onContextMenuRemoveClass} />
        <NavItem title="Save image"
          classExt={"hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-500"}
          onclick={onContextMenuSaveImage} />
        <NavItem title="Save state"
          classExt={"hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-500"}
          onclick={onContextMenuSaveState} />
        <NavItem title="Load saved state"
          classExt={"hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-500"}
          onclick={onContextMenuLoadState} />
      </ContextMenu>
      <Canvas
        onMouseDown={onCanvasMouseDown}
        onMouseMove={onCanvasMouseMove}
        onMouseUp={onCanvasMouseUp} />
      {/* WRTC */}
      {/* <div class="absolute fixed flex flex-row">
        <Button title='Share' onclick={() => {}} />
        <Field title='Adrress' onInputChange={(e) => setStore("rtc", {target: e.currentTarget.value})} />
        <Button title='Connect' onclick={() => {}} />
      </div> */}
      <UMLClassComponent />
      <UMLPackageComponent />
      <div class='z-20 absolute bottom-4 left-4 flex flex-col'>
        <Label title={`x: ${store.viewOffset.x}`} />
        <Label title={`y: ${store.viewOffset.y}`} />
      </div>

    </div>
  );
};

export default App;