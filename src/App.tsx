import { Component, children, onMount } from 'solid-js';
import { ContextMenu, NavItem } from './api/ContextMenu';
import { drawTextHCenter, measureText, drawRectangle, drawTextHLeft, SingleTextBlock, drawLine, fillTriangle, drawDotLine, FULL_CIRCLE, HALF_CIRCLE } from './api/DrawUtils';
import { Label } from './api/Label';
import { UMLAttribute } from './api/UMLAttribute';
import { UMLClass, UMLClassComponent, UMLEnum, UMLInterface } from './api/UMLClass';
import { UMLMethode } from './api/UMLMethode';
import { UMLParameter } from './api/UMLParameter';
import { setStore, store } from './api/Store';
import { changingsObserved, endUpdateView, startUpdateView } from './api/GlobalState';
import { selectedClass, setContextMenuOpen, locationContextMenu, isContextMenuOpen } from './api/Signals';
import { onCanvasMouseDown, onCanvasMouseMove, onCanvasMouseUp } from './api/Mouse';
import { canvas, Canvas } from './api/Canvas';
import { Math2 } from './api/Math2';
import { UMLArrowMode, UMLLineMode, UMLRelationship, UMLRelationshipType } from './api/UMLRelationship';
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
    ctx.translate(0.5, 0.5);
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
          var widestElementValue = Math.max(
              titleSize.width + xPadding,
              ...methSizes?.map(x => x.width + xPadding),
              ...attrSizes?.map(x => x.width + xPadding));

          var girdWidth = Math.ceil(widestElementValue / subGridSize);
          var maxBoxWidth = 
            (girdWidth % 2 === 0 ? girdWidth + 1 : girdWidth) * subGridSize - 1;

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
        let arrowSize = store.fontSize * .8;
        for (const relationships of store.relationships.filter(x => x.parent !== undefined)) {
          // calc vector
          let lineMode = UMLLineMode[relationships.type];
          let arrowMode = UMLArrowMode[relationships.type];
          let fillMode = relationships.type === UMLRelationshipType.composition 
            ? "black"
            : "white";

          let dx = relationships.children.x - relationships.parent.x;
          let dy = relationships.children.y - relationships.parent.y;
          let m = Math.atan(dy / dx);
          
          if(-Math2.RAD45 < m && m < Math2.RAD45) { 
            // LR
            if(relationships.parent.x < relationships.children.x) {
              // parent left
              let srcx = store.viewOffset.x + relationships.parent.x + relationships.parent.width;
              let srcy = store.viewOffset.y + relationships.parent.y + (relationships.parent.height * .5);
  
              let dstx = store.viewOffset.x + relationships.children.x;
              let dsty = store.viewOffset.y + relationships.children.y + (relationships.children.height * .5);
  
              let dx = dstx - srcx;
              let dy = dsty - srcy;
              let m = Math.atan(dy / dx);
  
              lineMode(ctx, srcx, srcy, dstx, dsty, 1, "black");
              if(arrowMode !== undefined){
                arrowMode(ctx, srcx, srcy, arrowSize, arrowSize, m, "black", fillMode);
              }
              if(relationships.type === UMLRelationshipType.bidirectionalAssociation){
                arrowMode(ctx, dstx, dsty, arrowSize, arrowSize, m - HALF_CIRCLE, "black", fillMode);
              }
            } else {
              // parent right
              let srcx = store.viewOffset.x + relationships.children.x +  relationships.children.width;
              let srcy = store.viewOffset.y + relationships.children.y + (relationships.children.height * .5);

              let dstx = store.viewOffset.x + relationships.parent.x;
              let dsty = store.viewOffset.y + relationships.parent.y + (relationships.parent.height * .5);

              let dx = (dstx - srcx);
              let dy = (dsty - srcy);
              let m = Math.atan(dy / dx);

              lineMode(ctx, srcx, srcy, dstx, dsty, 1, "black");
              if(arrowMode !== undefined){
                arrowMode(ctx, dstx, dsty, arrowSize, arrowSize, m + HALF_CIRCLE, "black", fillMode);
              }
              if(relationships.type === UMLRelationshipType.bidirectionalAssociation){
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

            if(m < 0)
            {
              m -= HALF_CIRCLE 
            }


            lineMode(ctx, srcx, srcy, dstx, dsty, 1, "black");
            if(arrowMode !== undefined){
              arrowMode(ctx, srcx, srcy, arrowSize, arrowSize, m, "black", fillMode);
            }
            if(relationships.type === UMLRelationshipType.bidirectionalAssociation){
              arrowMode(ctx, dstx, dsty, arrowSize, arrowSize, m + HALF_CIRCLE, "black", fillMode);
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

            if(m > 0)
            {
              m -= HALF_CIRCLE 
            }

            lineMode(ctx, srcx, srcy, dstx, dsty, 1, "black");
            if(arrowMode !== undefined){
              arrowMode(ctx, dstx, dsty, arrowSize, arrowSize, m, "black", fillMode);
            }
            if(relationships.type === UMLRelationshipType.bidirectionalAssociation){
              arrowMode(ctx, srcx, srcy, arrowSize, arrowSize, m + HALF_CIRCLE, "black", fillMode);
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
    
    // remove relationships from that class
    setStore(
      "relationships",
      store.relationships.filter(x => 
        x.parent.uuid !== selectedClass().uuid // delete all relationships to 
        && x.children.uuid !== selectedClass().uuid)); // delete all relationships from

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
        relationships: store.relationships.map(x => 
        ({
          uuid: x.uuid,
          parent: x.parent?.uuid ?? undefined,
          children: x.children.uuid,
          type: x.type,
        }))
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
      setStore("relationships", []);

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
      
      for (var element of jsonArray.relationships) {
        let parent = store.classes.find(x => x.uuid === element.parent);
        let children = store.classes.find(x => x.uuid === element.children);
        
        setStore(
          "relationships",
          store.relationships.length,
          new UMLRelationship(children, parent, element["type"], element["uuid"]));
      }
      
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
      <div class='z-20 absolute bottom-4 left-4 flex flex-col'>
        <Label title={`x: ${store.viewOffset.x}`}/>
        <Label title={`y: ${store.viewOffset.y}`}/>
      </div>

    </div>
  );
};

export default App;