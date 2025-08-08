import { Component, children, onMount } from 'solid-js';
import { ContextMenu, ContextOpenMode, Label, NavItem } from './api/UI';
import { drawTextHCenter, measureText, drawRectangle, drawTextHLeft, drawLine, drawNone } from './api/Drawing/CanvasDrawing';
import { internalStore, setStore, store } from './api/Store';
import { changingsObserved, endUpdateView, startUpdateView } from './api/GlobalState';
import { selectedClass, setContextMenuOpen, locationContextMenu, isContextMenuOpen } from './api/Signals';
import { onCanvasMouseDown, onCanvasMouseMove, onCanvasMouseUp } from './api/Peripheral/Mouse';
import { Math2 } from './api/Math2';
import Canvas, { canvas } from './api/UI/Canvas';
import { UMLArrowMode, UMLAttribute, UMLClass, UMLEnum, UMLInterface, UMLLineMode, UMLMethode, UMLPackage, UMLRelationship, UMLRelationshipImportExport, UMLRelationshipType, UmlToString } from './api/UML';
import { UMLClassComponent } from './api/UML/UMLClass';
import { Point } from './api/Drawing';
import { deserialize, serialize } from './api/IO/Serialization';
import { UMLPackageComponent } from './api/UML/UMLPackage';
import { drawBackground, drawClass as drawClasses } from './api/Drawing/UtilsDrawing';
import { onCanvasKeyDown } from './api/Peripheral/Keyboard';

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
    ctx.imageSmoothingQuality = 'high';
    ctx.imageSmoothingEnabled = true;
    
    requestAnimationFrame(() => render(ctx));
  });

  function render(ctx: CanvasRenderingContext2D) {
    if (changingsObserved) {
      ctx.fillStyle = internalStore.gridInfo.background;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      const gridSize = internalStore.gridInfo.space * store.zoom;
      const subGridSize = gridSize / (1 + internalStore.gridInfo.subCount);

      // Draw background
      {
        if(!internalStore.screenshotMode) {
          drawBackground(ctx, canvas, gridSize, subGridSize);
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
        drawClasses(ctx, xPadding, subGridSize, linePadding);
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

  function onContextMenuSortHorizontal() {
    
    internalStore.classes.sort((a, b) => b.height - a.height);
    let x = 0;
    for (let element of internalStore.classes) {
      element.x = x;
      x += element.width + 8;
    }

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
    
    internalStore.screenshotMode = true;
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
        
      internalStore.screenshotMode = false;
      startUpdateView();
    });
  }

  function onContextMenuSaveState() {
    const link = document.createElement("a");
    let file = new Blob(
      [serialize(internalStore)],
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
      let json = deserialize(content);

      internalStore.classes.push(...(json['classes'] as UMLClass[]));
      internalStore.relationships.push(...(json['relationships'] as UMLRelationshipImportExport[])
        .map(x => { 
          const relation = new UMLRelationship();
          relation.parent = internalStore.classes.find(y => y.uuid === x.parentUUID);
          relation.children = internalStore.classes.find(y => y.uuid === x.childrenUUID);
          relation.type = x.type;
          relation.uuid = x.uuid;
          return relation;
        }));

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
        <NavItem title="Sort Horizontal"
          classExt={"hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-500"}
          onclick={onContextMenuSortHorizontal} />
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
        onMouseUp={onCanvasMouseUp}
        onKeyDown={onCanvasKeyDown}
        />
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


