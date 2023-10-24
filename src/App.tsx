import { Component, createSignal, For, Match, onMount, Show, Switch } from 'solid-js';
import { Button } from './api/Button';
import { CheckBox, CheckBoxSlim } from './api/CheckBox';
import { ContextMenu, NavItem } from './api/ContextMenu';
import { drawTextHCenter, measureText, drawRectangle, drawTextHLeft, Point, SingleTextBlock, drawLine, fillTriangle, drawDotLine } from './api/DrawUtils';
import { Field } from './api/Field';
import { Label } from './api/Label';
import { UMLAttribute, UMLAttributeContainer } from './api/UMLAttribute';
import { dropAttribute, dropMethode, IUMLClass, popAttribute, popMethode, popParameter, pushAttribute, pushMethode, pushParameter, UMLClass, UMLContextMenu, UMLEnum, UMLInterface } from './api/UMLClass';
import { UMLMethode, UMLMethodeContainer } from './api/UMLMethode';
import { UMLParameter, UMLParameterContainer } from './api/UMLParameter';
import { IUMLDerive, UMLClassDerive, UMLInterfaceDerive } from './api/UMLDerive';
import { setStore, store } from './api/Store';
import { changingsObserved, endUpdateView, getUpdateViewState, startUpdateView } from './api/GlobalState';
import { selectedClass, setSelectedClass, setLocationContextMenu, setContextMenuOpen, locationContextMenu, isContextMenuOpen, contentIndex, setContextIndex } from './api/Signals';
import { MouseButtons, onCanvasMouseDown, onCanvasMouseMove, onCanvasMouseUp } from './api/Mouse';
import { canvas, Canvas } from './api/Canvas';
import { getImplementsNameSymbol, ImplementsNameSymbolIUMLDervice } from './api/Symbols';
// var exampleClass = new UMLClass();
// exampleClass.isAbstract = true;
// exampleClass.attributes.push(new UMLAttribute());
// exampleClass.attributes.push(new UMLAttribute());
// exampleClass.attributes.push(new UMLAttribute());
// var exampleMethode = new UMLMethode();
// exampleMethode.name = "Abc";
// exampleMethode.returnType = "Integer";
// exampleClass.methodes.push(exampleMethode);
// exampleClass.methodes.push(exampleMethode);
// exampleClass.methodes.push(exampleMethode);
// exampleClass.methodes.push(exampleMethode);


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
      if(isContextMenuOpen()){
        setContextMenuOpen(false);
      }
    });

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx = canvas.getContext("2d");
    requestAnimationFrame(() => render(ctx));
  });

  function render(ctx: CanvasRenderingContext2D) {
    if (changingsObserved) {
      ctx.imageSmoothingQuality = 'high';
      ctx.imageSmoothingEnabled = true;

      ctx.fillStyle = store.grid.background;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      const gridSize = store.grid.space * store.zoom;
      const subGridSize = gridSize / (1 + store.grid.subCount);

      // Draw background
      {
        const xClusterShift = (store.viewOffset.x % gridSize);
        const yClusterShift = (store.viewOffset.y % gridSize);

        if (store.grid.subVisuale) {
          for (var x = -gridSize + xClusterShift; x < canvas.width + gridSize;) {
            drawLine(ctx, x, 0, x, canvas.height, 1, store.grid.color);

            for (var sx = 0; sx < store.grid.subCount; sx++) {
              x += subGridSize;
              drawLine(ctx, x, 0, x, canvas.height, 1, store.grid.subColor);
            }

            x += subGridSize;
          }

          for (var y = -gridSize + yClusterShift; y < canvas.height + gridSize;) {
            drawLine(ctx, 0, y, canvas.width, y, 1, store.grid.color);

            for (var sy = 0; sy < store.grid.subCount; sy++) {
              y += subGridSize;
              drawLine(ctx, 0, y, canvas.width, y, 1, store.grid.subColor);
            }

            y += subGridSize;
          }
        } else {
          for (var x = 0 + xClusterShift; x < canvas.width; x += gridSize) {
            drawLine(ctx, x, 0, x, canvas.height, 1, store.grid.color);
          }
          for (var y = 0 + yClusterShift; y < canvas.height; y += gridSize) {
            drawLine(ctx, 0, y, canvas.width, y, 1, store.grid.color);
          }
        }
      }
      // Draw classes
      {
        const linePadding = 2
        const douleLinePadding = linePadding * 2
        ctx.font = `${store.fontSize * store.zoom}px Arial`;
        const xPadding = 16 * store.zoom;

        for (var umlClass of store.classes) {
          var titleSize = measureText(ctx, umlClass.toString());
          var attrSizes = umlClass.attributes?.map(x => {
            var measuredText = measureText(ctx, x.toString());
            if (measuredText instanceof SingleTextBlock) {
              measuredText.decoration.underline = x.isStatic ?? false;
            }
            return measuredText;
          }) ?? [];
          var methSizes = umlClass.methodes?.map(x => {
            var measuredText = measureText(ctx, x.toString());
            if (measuredText instanceof SingleTextBlock) {
              measuredText.decoration.underline = x.isStatic ?? false;
            }
            return measuredText;
          }) ?? [];

          var maxHeaderBoxSize = titleSize.height + (xPadding / 2);
          var maxBoxWidth =
            Math.ceil(
              Math.max(
                titleSize.width + xPadding,
                ...methSizes?.map(x => x.width + xPadding),
                ...attrSizes?.map(x => x.width + xPadding)) / subGridSize) 
            * subGridSize - 1;


          var maxAttrBoxHeight = Math.max(attrSizes?.reduce((p, c) => p + c.height, 0), 10 * store.zoom);
          var maxMethBoxHeight = Math.max(methSizes?.reduce((p, c) => p + c.height, 0), 10 * store.zoom);

          const xClassOffset = store.viewOffset.x + (umlClass.x * store.zoom);
          const yClassOffset = store.viewOffset.y + (umlClass.y * store.zoom);

          var maxBoxHeight = maxHeaderBoxSize + maxAttrBoxHeight + maxMethBoxHeight + (linePadding + linePadding + linePadding);

          if(umlClass.uuid === selectedClass()?.uuid) {

            let borderColor = store.class.selectColor;
            ctx.shadowColor = borderColor as string;
            ctx.shadowBlur = 7;
            
            drawRectangle(ctx, xClassOffset, yClassOffset, maxBoxWidth, maxBoxHeight, borderColor, store.class.background);
            
            ctx.shadowBlur = 0;
          } else {
            
            let borderColor = store.class.deselectColor;
            drawRectangle(ctx, xClassOffset, yClassOffset, maxBoxWidth, maxBoxHeight, borderColor, store.class.background);
          
          }
            

          // draw heder 
          //drawRectangle(ctx, xClassOffset, yClassOffset, maxBoxWidth, maxHeaderBoxSize, borderColor, store.class.background);
          drawTextHCenter(ctx, xClassOffset, yClassOffset + (xPadding / 4), maxBoxWidth, xPadding, titleSize, store.class.fontColor);

          // draw attributes
          var yOffset = yClassOffset + maxHeaderBoxSize;
          drawLine(ctx, xClassOffset, yOffset, xClassOffset + maxBoxWidth, yOffset, 1, "black");
          yOffset += linePadding;
          //drawRectangle(ctx, xClassOffset, yOffset, maxBoxWidth, maxAttrBoxHeight, borderColor, store.class.background);
          for (var attr of attrSizes) {
            drawTextHLeft(ctx, xClassOffset, yOffset, xPadding, attr, store.class.fontColor);
            yOffset += attr.height;
          }

          // draw methodes
          yOffset = yClassOffset + maxHeaderBoxSize + maxAttrBoxHeight;
          yOffset += linePadding;
          drawLine(ctx, xClassOffset, yOffset, xClassOffset + maxBoxWidth, yOffset, 1,"black");
          yOffset += linePadding;
          //drawRectangle(ctx, xClassOffset, yOffset, maxBoxWidth, maxMethBoxHeight, borderColor, store.class.background);
          for (var meth of methSizes) {
            drawTextHLeft(ctx, xClassOffset, yOffset, xPadding, meth, store.class.fontColor);
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
        for (const derive of store.derives) {
          // calc vector
          let lineMode = derive instanceof UMLInterfaceDerive
            ? drawDotLine
            : drawLine;
          
          if(derive.parent.x < derive.children.x) {
            // parent left
            let srcx = store.viewOffset.x + derive.parent.x + derive.parent.width;
            let srcy = store.viewOffset.y + derive.parent.y + (derive.parent.height * .5);

            let dstx = store.viewOffset.x + derive.children.x;
            let dsty = store.viewOffset.y + derive.children.y + (derive.children.height * .5);

            let dx = dstx - srcx;
            let dy = dsty - srcy;
            let m = Math.atan(dy / dx);

            lineMode(ctx, srcx, srcy, dstx, dsty, 1, "black");
            fillTriangle(ctx, srcx, srcy, 16, 16, m, "black", "white");
          } else { 
            // parent right
            let srcx = store.viewOffset.x + derive.children.x +  derive.children.width;
            let srcy = store.viewOffset.y + derive.children.y + (derive.children.height * .5);

            let dstx = store.viewOffset.x + derive.parent.x;
            let dsty = store.viewOffset.y + derive.parent.y + (derive.parent.height * .5);

            let dx = (dstx - srcx);
            let dy = (dsty - srcy);
            let m = Math.atan(dy / dx) + Math.PI;

            lineMode(ctx, srcx, srcy, dstx, dsty, 1, "black");
            fillTriangle(ctx, dstx, dsty, 16, 16, m, "black", "white");
          }
        }
      //   for (var connection of store.connections) {
      //     const direction = [
      //       Math.sign(connection.dst.x - connection.src.x), 
      //       Math.sign(connection.dst.y - connection.dst.x)
      //     ];

      //     const rightSide = connection.src.x + connection.src.width;
      //     const distanceY = (connection.dst.y + (connection.dst.height / 2))
      //       - (connection.src.y + (connection.src.height / 2));
          
      //       switch(true) { 
      //         case connection.src.y == connection.dst.y: 
      //           // horizontal alined
      //           { 
      //             const srcY = connection.src.y * store.zoom;
                  
      //             const srcCenterH = 
      //               store.viewOffset.y 
      //               + srcY 
      //               + (connection.src.height <= connection.dst.height 
      //                 ? connection.src.height / 2
      //                 : connection.dst.height / 2);

      //             const [startX, endX] = connection.src.x + connection.src.width < connection.dst.x 
      //               ? [ connection.src.x * store.zoom + connection.src.width,
      //                   connection.dst.x * store.zoom]
      //               : [ connection.dst.x * store.zoom + connection.dst.width,
      //                   connection.src.x * store.zoom ];
                    
      //             ctx.strokeStyle = "black";
      //             ctx.beginPath();
      //             ctx.moveTo(
      //               store.viewOffset.x + startX,
      //               srcCenterH);
      //             ctx.lineTo(
      //               store.viewOffset.x + endX,
      //               srcCenterH);
      //             ctx.stroke();
      //           }
      //           break;
      //         case connection.src.x + (connection.src.width / 2) === connection.dst.x + (connection.dst.width / 2): 
      //           // vertical alined
      //           {
      //             const src = connection.src,
      //                   dst = connection.dst;
      //             const srcY = src.y * store.zoom;

      //             const center = store.viewOffset.x + srcY + src.width / 2;
      //             const startY = Math.min(src.y + src.height, dst.y);
      //             const endY = Math.max(src.y, dst.y);

    
      //             ctx.strokeStyle = "black";
      //             ctx.beginPath();
      //             ctx.moveTo(center, startY);
      //             ctx.lineTo(center, endY);
      //             ctx.stroke();
      //           }
      //         case connection.src.x <= connection.dst.x && connection.dst.x <= connection.src.x + connection.src.width: 
      //           {
      //             const src = connection.src,
      //                   dst = connection.dst;
      //             const srcY = src.y * store.zoom,
      //                   dstY = dst.y * store.zoom;

      //             const srcCenterV = Math.min(src.width, dst.width) / 2;
                
      //           }
      //           break;
      //         default:
      //           const srcX = connection.src.x * store.zoom;
      //           const srcY = connection.src.y * store.zoom;
      //           const dstX = connection.dst.x * store.zoom;
      //           const dstY = connection.dst.y * store.zoom;

      //           const srcCenterH = connection.src.height / 2;
      //           const dstCenterH = connection.dst.height / 2;
      //           const distanceX = connection.dst.x - rightSide;
      //           const src2dstCenter = connection.src.width + (distanceX / 2);

      //           ctx.beginPath();
      //           ctx.moveTo(
      //             store.viewOffset.x + srcX + connection.src.width,
      //             store.viewOffset.y + srcY + srcCenterH);
      //           ctx.lineTo( // to center
      //             store.viewOffset.x + srcX + src2dstCenter, 
      //             store.viewOffset.y + srcY + srcCenterH);
      //           ctx.lineTo( // to down
      //             store.viewOffset.x + srcX + src2dstCenter, 
      //             store.viewOffset.y + dstY + dstCenterH);
      //           ctx.lineTo(
      //             store.viewOffset.x + dstX, 
      //             store.viewOffset.y + dstY + dstCenterH);
      //           ctx.stroke();
      //           break;
      //       }
      //   }
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
        if(store.selectionMode){ 
          let dx = store.mouse.x - store.mouseSecondary.x;
          let dy = store.mouse.y - store.mouseSecondary.y;
          drawRectangle(ctx, store.mouseSecondary.x, store.mouseSecondary.y, dx, dy, "blue", "rgba(0,0,255,0.3)");
        }
      }

      endUpdateView();
    }

    frameNumber = requestAnimationFrame(() => render(ctx));
  }

  
  /*
   * Derives management
   */
  function pushDerive(parent : IUMLDerive | UMLClass, children: UMLClass | boolean = null, updateView : boolean = false) {

    if(parent instanceof UMLClass && parent !== null
      && children instanceof UMLClass && children !== null) 
    { 
      let derive : IUMLDerive = parent?.property?.trim().toLowerCase() === "interface"
        ? new UMLInterfaceDerive(parent, children)
        : new UMLClassDerive(parent, children);

      setStore(
        "derives",
        store.derives.length,
        derive);

      if(updateView) {
        startUpdateView();
      }

    } else if(parent[getImplementsNameSymbol]() === ImplementsNameSymbolIUMLDervice) {
      setStore(
        "derives",
        store.derives.length,
        parent as IUMLDerive); 
        
      if(children) {
        startUpdateView();
      }
    }
  }

  function deleteDerive(parent: IUMLDerive | UMLClass | string, children: UMLClass | string | boolean = null, updateView : boolean = false) {
    if(parent instanceof UMLClass && parent !== null
      && children instanceof UMLClass && children !== null) 
    { 
      setStore(
        "derives",
        store.derives.filter(x => 
          !(x.parent.uuid === parent.uuid && x.children.uuid === children.uuid)));
      if(updateView) {
        startUpdateView();
      }
    } else if(parent[getImplementsNameSymbol]() === ImplementsNameSymbolIUMLDervice) {
      let derive = parent as IUMLDerive;
      setStore(
        "derives",
        store.derives.filter(x => 
          !(x.parent.uuid === derive.parent.uuid && x.children.uuid === derive.children.uuid)));

      if(children) {
        startUpdateView();
      }
    } 
  }
 /*
   * End - Derives management
   */
  /*
   * UI related methodes
   */
 
  function updateIsStatic(e: Event) {
    if (e.currentTarget instanceof HTMLInputElement) {
      selectedClass().isAbstract = e.currentTarget.checked;
      startUpdateView();
    }
  }
  
  

  /*
   * Context Menu
   */
  function onContextMenuAddClass() {
    const zoomFacktor = 1 / store.zoom;
    let { x, y } = locationContextMenu();
    x = (x - store.viewOffset.x) * zoomFacktor;
    y = (y - store.viewOffset.y) * zoomFacktor;

    const gridSnap = (store.grid.space * store.zoom) / (1 + store.grid.subCount);
    setStore(
      "classes",
      store.classes.length,
      new UMLClass({
        x: x - (x % gridSnap),
        y: y - (y % gridSnap)
      }));
    startUpdateView();
  }

  function onContextMenuAddInterface() {
    const zoomFacktor = 1 / store.zoom;
    let { x, y } = locationContextMenu();
    x = (x - store.viewOffset.x) * zoomFacktor;
    y = (y - store.viewOffset.y) * zoomFacktor;

    const gridSnap = (store.grid.space * store.zoom) / (1 + store.grid.subCount);
    setStore(
      "classes",
      store.classes.length,
      UMLInterface.Create({
        x: x - (x % gridSnap),
        y: y - (y % gridSnap)
      }));
    startUpdateView();
  }

  function onContextMenuAddEnum() {
    const zoomFacktor = 1 / store.zoom;
    let { x, y } = locationContextMenu();
    x = (x - store.viewOffset.x) * zoomFacktor;
    y = (y - store.viewOffset.y) * zoomFacktor;

    const gridSnap = (store.grid.space * store.zoom) / (1 + store.grid.subCount);
    setStore(
      "classes",
      store.classes.length,
      UMLEnum.Create({
        x: x - (x % gridSnap),
        y: y - (y % gridSnap)
      }));
    startUpdateView();
  }

  function onContextMenuRemoveClass() {
    // remove class from store
    setStore(
      "classes",
      store.classes.filter(x => x.uuid !== selectedClass().uuid));
    
    // remove derives from that class
    setStore(
      "derives",
      store.derives.filter(x => x.parent.uuid !== selectedClass().uuid))
      
    startUpdateView();
  }

  function onContextMenuSaveImage() {
    const {
      width: curWidth,
      height: curHeight
    } = canvas;
    
    const {x: curX, y: curY} = store.viewOffset;

    let startX = Number.MAX_VALUE;
    let endX = Number.MIN_VALUE;

    let startY = Number.MAX_VALUE;
    let endY = Number.MIN_VALUE;

    for(let element of store.classes)
    {
      if(element.x < startX) { 
        startX = element.x;
      }
      
      if(element.y < startY) { 
        startY = element.y;
      } 

      if((element.x + element.width) > endX) {
        endX = (element.x + element.width);
      }  
      
      if((element.y + element.height) > endY) {
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
    var file = new Blob(
      [JSON.stringify({
        classes: store.classes,
        derives: store.derives
      })],{ type: 'application/json;charset=utf-8' });
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

      var file = fileLoader.files[0];
      var buffer = await file.arrayBuffer();
      var content = new TextDecoder("utf-8").decode(buffer);
      var jsonArray = JSON.parse(content);

      setStore("classes", []);
      setStore("derives", []);

      for (var element of jsonArray.classes) {
        const cls = new UMLClass({
          x: element["x"] ?? 0,
          y: element["y"] ?? 0
        });
        cls.property = element["property"];
        cls.uuid = element["uuid"];
        cls.name = element["name"],
        cls.width = element["width"];
        cls.height = element["height"];
        cls.isAbstract = element["isAbstract"] ?? false;
        cls.attributes = [];
        for (var attrElement of element["attributes"] ?? []) {
          const attr: UMLAttribute = new UMLAttribute();
          attr.isStatic = attrElement["isStatic"] ?? false;
          attr.isConstant = attrElement["isConstant"] ?? false;
          attr.accessModifier = attrElement["accessModifier"] ?? null;
          attr.name = attrElement["name"];
          attr.type = attrElement["type"] ?? null;
          attr.multiplicity = attrElement["multiplicity"] ?? null;
          attr.defaultValue = attrElement["defaultValue"] ?? null;

          cls.attributes.push(attr);
        }
        cls.methodes = [];
        for (var methElement of element["methodes"] ?? []) {
          const meth: UMLMethode = new UMLMethode();

          meth.isStatic = methElement["isStatic"] ?? false;
          meth.name = methElement["name"] ?? "methode";
          meth.returnType = methElement["returnType"] ?? null;
          meth.accessModifier = methElement["accessModifier"] ?? null;
          meth.parameters = [];

          for (var paramElement of methElement['parameters'] ?? []) {
            const param = new UMLParameter();
            param.name = paramElement["name"] ?? null;
            param.type = paramElement["type"] ?? null;

            meth.parameters.push(param);
          }

          cls.methodes.push(meth);
        }

        setStore(
          "classes",
          store.classes.length,
          cls);
      }

      for (var element of jsonArray.derives) {
        let parent = store.classes.find(x => x.uuid === element.parent.uuid);
        let children = store.classes.find(x => x.uuid === element.children.uuid);

        setStore(
          "derives",
          store.derives.length,
          parent.property?.toLowerCase() === "interface" 
            ? new UMLInterfaceDerive(parent, children)
            : new UMLClassDerive(parent, children));
      }
      
      startUpdateView();
    });

    fileLoader.click();
    fileLoader.remove();
    
  }
  /*
   * Head-Nav
   */

  /*
   * App
   */
  return (
    <div 
      class="relative min-h-screen max-h-screen">
      <ContextMenu
        hidden={!isContextMenuOpen()}
        location={locationContextMenu()} >
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
      <Show when={selectedClass()}>
        <div id="side-nav" class="fixed flex max-h-screen top-0 right-0 p-4 min-w-[351px]">
          <div class="flex grow flex-col">
            <div class="bg-white rounded border border-sky-400 px-4 py-2 mb-4 shadow">
              <Label title="Class" />
              <Field title='Property'
                initValue={selectedClass().property}
                onInputChange={e => { 
                  if(selectedClass().property.trim().toLowerCase() !== "interface" // source become an interface
                    && e.currentTarget.value.trim().toLowerCase() === "interface")
                  {
                    let derives = store.derives.filter(x => 
                      x instanceof UMLClassDerive 
                      && x.parent.uuid === selectedClass().uuid);

                    for(var derive of derives) { 
                      deleteDerive(derive);
                      pushDerive(new UMLInterfaceDerive(derive.parent, derive.children));
                    }
                  } else if (selectedClass().property.trim().toLowerCase() === "interface" 
                    && e.currentTarget.value.trim().toLowerCase() !== "interface") 
                  { 
                    let derives = store.derives.filter(x => 
                      x instanceof UMLInterfaceDerive 
                      && x.parent.uuid === selectedClass().uuid);

                    for(var derive of derives) {
                      deleteDerive(derive);
                      pushDerive(new UMLClassDerive(derive.parent, derive.children));
                    }
                  }

                  selectedClass().property = e.currentTarget.value; 
                  setSelectedClass(selectedClass());
                  startUpdateView()
                }} />
              <Field title='Name'
                initValue={selectedClass().name}
                onInputChange={e => { selectedClass().name = e.currentTarget.value; startUpdateView() }} />
              <CheckBox id="static" title="Abstract" value={selectedClass().isAbstract} onChanges={updateIsStatic} />
            </div>
            {/* Tabs */}
            <div>
              <div class='flex flex-row justify-between'>
                <button class={`py-1 w-full text-sm font-medium text-gray-700 rounded-t
                  ${contentIndex() === UMLContextMenu.Attributes
                    ? "bg-white border-sky-400 border-x border-t"
                    : "border border-gray-400 bg-white border-b-sky-400 hover:border-sky-400 text-gray-400 hover:text-gray-700"}`}
                  onclick={() => setContextIndex(UMLContextMenu.Attributes)}
                >Attributes</button>
                <button class={`py-1 w-full text-sm font-medium text-gray-700 rounded-t
                  ${contentIndex() === UMLContextMenu.Methodes
                    ? "bg-white border-sky-400 border-x border-t"
                    : "border border-gray-400 bg-white border-b-sky-400 hover:border-sky-400 text-gray-400 hover:text-gray-700"}`}
                  onclick={() => setContextIndex(UMLContextMenu.Methodes)}
                >Methodes</button>
                <button class={`py-1 w-full text-sm font-medium text-gray-700 rounded-t
                  ${contentIndex() === UMLContextMenu.Derives
                    ? "bg-white border-sky-400 border-x border-t"
                    : "border border-gray-400 bg-white border-b-sky-400 hover:border-sky-400 text-gray-400 hover:text-gray-700"}`}
                  onclick={() => setContextIndex(UMLContextMenu.Derives)}
                >Derives</button>
                {/* <Button title="" onclick={() => setContextIndex(1)} /> */}
              </div>
            </div>
            {/* Tabs content */}
            <Switch>
              <Match when={contentIndex() === UMLContextMenu.Attributes} >
                <div id="attr-container" class="flex flex-col overflow-hidden max-h-max bg-white rounded-b border-x border-b border-sky-400 p-2 shadow">
                  <Button title='Add attribute' onclick={pushAttribute} />
                  <div class="overflow-y-auto h-full">
                    <For each={selectedClass().attributes}>
                      {(attr, i) => <UMLAttributeContainer
                        index={i()}
                        attr={attr}
                        onDrop={e => dropAttribute(i(), e)}
                        update={startUpdateView}
                        delete={() => popAttribute(i())} />}
                    </For>
                  </div>
                </div>
              </Match>
              <Match when={contentIndex() === UMLContextMenu.Methodes} >
                <div id="meth-container" class="flex flex-col overflow-hidden max-h-max bg-white rounded-b border-x border-b border-sky-400 p-2 shadow">
                  <Button title='Add methode' onclick={pushMethode} />
                  <div class="overflow-y-auto h-full">
                    <For each={selectedClass().methodes}>
                      {(methode, iMethode) => {
                        return (<UMLMethodeContainer
                          index={iMethode()}
                          methode={methode}
                          onDrop={e => dropMethode(iMethode(), e)}
                          update={startUpdateView}
                          delete={() => popMethode(iMethode())}
                          onPushParameter={() => pushParameter(iMethode())}>

                          <For each={selectedClass().methodes[iMethode()].parameters}>
                            {(param, iParam) => <UMLParameterContainer
                              param={param}
                              popParameter={() => popParameter(iMethode(), iParam())}
                              update={startUpdateView}
                            />}
                          </For>
                        </UMLMethodeContainer>)
                      }}
                    </For>
                  </div>
                </div>
              </Match>
              <Match when={contentIndex() === UMLContextMenu.Derives} >
                <div id="meth-container" class="flex flex-col overflow-hidden max-h-max bg-white rounded-b border-x border-b border-sky-400 p-2 shadow">
                  <div class="overflow-y-auto h-full">
                    <For each={store.classes}>
                      {(umlClass, iUmlClass) => {
                        if(umlClass.uuid === selectedClass().uuid)
                          return;
                        return (
                          <div 
                            class="relative flex flex-row bg-white rounded border border-sky-400 p-2 mb-2 shadow">
                            <CheckBoxSlim 
                              id={`static-derive-${umlClass.name}_${iUmlClass()}`} 
                              value={store.derives.findIndex(x => x.children.uuid === selectedClass().uuid && x.parent.uuid === umlClass.uuid) !== -1} 
                              title={umlClass.name} 
                              onChanges={(e) => {
                                let deriveAction =  e.currentTarget.checked ? pushDerive : deleteDerive;
                                deriveAction(umlClass, selectedClass());
                                setSelectedClass(selectedClass());
                                startUpdateView();  
                              }} />
                          </div>
                      )}}
                    </For>
                  </div>
                </div>
              </Match>
            </Switch>
          </div>
        </div>
      </Show>
      <div class='z-20 absolute bottom-4 left-4 flex flex-col'>
        <Label title={`x: ${store.viewOffset.x}`}/>
        <Label title={`y: ${store.viewOffset.y}`}/>
      </div>

    </div>
  );
};

export default App;