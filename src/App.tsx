import { Component, createSignal, For, Match, onMount, Show, Switch } from 'solid-js';
import { createStore } from "solid-js/store";
import { Button } from './api/Button';
import { CheckBox, CheckBoxSlim } from './api/CheckBox';
import { ContextMenu, NavItem } from './api/ContextMenu';
import { drawTextHCenter, measureText, drawRectangle, drawTextHLeft, Point, SingleTextBlock, drawLine, fillTriangle, drawDotLine } from './api/DrawUtils';
import { Field } from './api/Field';
import { Label } from './api/Label';
import { UMLAttribute, UMLAttributeContainer } from './api/UMLAttribute';
import { UMLClass } from './api/UMLClass';
import { UMLMethode, UMLMethodeContainer } from './api/UMLMethode';
import { UMLParameter, UMLParameterContainer } from './api/UMLParameter';
import { IUMLDerive, UMLClassDerive, UMLInterfaceDerive } from './api/UMLDerive';

const [store, setStore] = createStore<
  {
    classes: UMLClass[],
    grid: {
      space: number,
      color: string | CanvasGradient | CanvasPattern,
      subVisuale: boolean,
      subColor: string | CanvasGradient | CanvasPattern,
      subCount: number,
    },
    derives: IUMLDerive[],
    selectedClassOffset: Point,
    hoverClass?: UMLClass,
    hoverBorder: boolean,
    mouseDown: Point,
    mouse: Point,
    readyToMove: boolean,
    viewOffset: Point,
    zoom: number,
    rtc : {
      target: string
    }
  }>({
    classes: [],
    derives: [],
    grid: {
      color: "#00505033",
      space: 64,
      subVisuale: true,
      subColor: "#00505011",
      subCount: 3,
    },
    selectedClassOffset: {x: 0, y: 0},
    hoverClass: null,
    hoverBorder: false,
    mouseDown: { x: 0, y: 0 },
    mouse: { x: 0, y: 0 },
    readyToMove: false,
    viewOffset: { x: 0, y: 0 },
    zoom: 1.0,
    rtc : {
      target: ""
    }
  });

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




var changingsObserved: boolean = true;

const App: Component = () => {
  const [isContextMenuOpen, setContextMenuOpen] = createSignal<boolean>(false);
  const [currentClass, setCurrentClass] = createSignal<UMLClass>(null, { equals: false });
  const [contentIndex, setContextIndex] = createSignal<number>(0);
  const [locationContextMenu, setLocationContextMenu] = createSignal<Point>(null);

  let frameNumber: number;
  let canvas: HTMLCanvasElement;

  onMount(() => {
    window.addEventListener("resize", e => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      changingsObserved = true;
    });

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext("2d");
    requestAnimationFrame(() => render(ctx));
  })

  function updateView() {
    changingsObserved = true;
  }
  function render(ctx: CanvasRenderingContext2D) {
    if (changingsObserved) {
      ctx.imageSmoothingQuality = 'high';
      ctx.imageSmoothingEnabled = true;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      const gridSize = store.grid.space * store.zoom;
      const subGridSize = gridSize / (1 + store.grid.subCount);

      // Draw background
      {
        const xClusterShift = (store.viewOffset.x % gridSize);
        const yClusterShift = (store.viewOffset.y % gridSize);

        if (store.grid.subVisuale) {
          for (var x = -gridSize + xClusterShift; x < canvas.width + gridSize;) {
            drawLine(ctx, x, 0, x, canvas.height, store.grid.color);

            for (var sx = 0; sx < store.grid.subCount; sx++) {
              x += subGridSize;
              drawLine(ctx, x, 0, x, canvas.height, store.grid.subColor);
            }

            x += subGridSize;
          }

          for (var y = -gridSize + yClusterShift; y < canvas.height + gridSize;) {
            drawLine(ctx, 0, y, canvas.width, y, store.grid.color);

            for (var sy = 0; sy < store.grid.subCount; sy++) {
              y += subGridSize;
              drawLine(ctx, 0, y, canvas.width, y, store.grid.subColor);
            }

            y += subGridSize;
          }
        } else {
          for (var x = 0 + xClusterShift; x < canvas.width; x += gridSize) {
            drawLine(ctx, x, 0, x, canvas.height, store.grid.color);
          }
          for (var y = 0 + yClusterShift; y < canvas.height; y += gridSize) {
            drawLine(ctx, 0, y, canvas.width, y, store.grid.color);
          }
        }
      }
      // Draw classes
      {
        ctx.strokeStyle = "black";
        ctx.fillStyle = "white";
        ctx.font = `${16 * store.zoom}px Arial`;
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

          let borderColor : string = umlClass.uuid === currentClass()?.uuid 
            ? "green"
            : "black";
          
          // draw heder 
          drawRectangle(ctx, xClassOffset, yClassOffset, maxBoxWidth, maxHeaderBoxSize, borderColor, "white");
          drawTextHCenter(ctx, xClassOffset, yClassOffset + (xPadding / 4), maxBoxWidth, xPadding, titleSize, "black");

          // draw attributes
          var yOffset = yClassOffset + maxHeaderBoxSize;
          drawRectangle(ctx, xClassOffset, yOffset, maxBoxWidth, maxAttrBoxHeight, borderColor, "white");
          for (var attr of attrSizes) {
            drawTextHLeft(ctx, xClassOffset, yOffset, xPadding, attr, "black");
            yOffset += attr.height;
          }

          // draw methodes
          yOffset = yClassOffset + maxHeaderBoxSize + maxAttrBoxHeight;
          drawRectangle(ctx, xClassOffset, yOffset, maxBoxWidth, maxMethBoxHeight, borderColor, "white");
          for (var meth of methSizes) {
            drawTextHLeft(ctx, xClassOffset, yOffset, xPadding, meth, "black");
            yOffset += meth.height;
          }

          // set new size
          umlClass.width = maxBoxWidth;
          umlClass.height = maxHeaderBoxSize + maxAttrBoxHeight + maxMethBoxHeight;
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
            let dx = (derive.children.x - derive.parent.x);
            let dy = (derive.children.y - derive.parent.y);
            let m = dy / dx;
            
            let srcx = store.viewOffset.x + derive.parent.x + derive.parent.width;
            let srcy = store.viewOffset.y + derive.parent.y + (derive.parent.height * .5);

            let dstx = store.viewOffset.x + derive.children.x;
            let dsty = store.viewOffset.y + derive.children.y + (derive.children.height * .5);

            lineMode(ctx, srcx, srcy, dstx, dsty, "black");
            fillTriangle(ctx, srcx, srcy, 16, 16, m, "black", "white");
          } else { 
            // parent right
            let dx = (derive.parent.x - derive.children.x);
            let dy = (derive.parent.y - derive.children.y);
            let m = dy / dx + Math.PI;
            
            let srcx = store.viewOffset.x + derive.children.x +  derive.children.width;
            let srcy = store.viewOffset.y + derive.children.y + (derive.children.height * .5);

            let dstx = store.viewOffset.x + derive.parent.x;
            let dsty = store.viewOffset.y + derive.parent.y + (derive.parent.height * .5);

            lineMode(ctx, srcx, srcy, dstx, dsty, "black");
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


      changingsObserved = false;
    }

    frameNumber = requestAnimationFrame(() => render(ctx));
  }

  /*
   * Attribute management 
   */
  function pushAttribute() {
    currentClass().attributes.push(new UMLAttribute());
    setCurrentClass(currentClass());
    updateView();
  }
  function popAttribute(attrIndex: number) {
    currentClass().attributes.splice(attrIndex, 1);
    setCurrentClass(currentClass());
    updateView();
  }
  function dropAttribute(i: number, e: DragEvent) {
    const src = Number.parseInt(e.dataTransfer.getData("number"));
    currentClass().attributes.splice(
      i,
      0,
      ...currentClass().attributes.splice(src, 1));

    setCurrentClass(currentClass());
    updateView();
  }
  /*
   * Methode management
   */
  function pushMethode() {
    currentClass().methodes.push(new UMLMethode());
    setCurrentClass(currentClass());
    updateView();
  }
  function popMethode(methIndex: number) {
    currentClass().methodes.splice(methIndex, 1);
    setCurrentClass(currentClass());
    updateView();
  }
  function dropMethode(i: number, e: DragEvent) {
    const src = Number.parseInt(e.dataTransfer.getData("number"));
    currentClass().methodes.splice(
      i,
      0,
      ...currentClass().methodes.splice(src, 1));

    setCurrentClass(currentClass());
    updateView();
  }
  /*
   * End - Methode management
   */
  function pushParameter(methodeIndex: number) {
    currentClass().methodes[methodeIndex].parameters.push(new UMLParameter())
    setCurrentClass(currentClass());
    updateView();
  }
  function popParameter(methIndex: number, parameterIndex: number) {
    currentClass().methodes[methIndex].parameters.splice(parameterIndex, 1);
    setCurrentClass(currentClass());
    updateView();
  }
  function dropParameter(methIndex: number, parameterIndex: number, e: DragEvent) {
    const src = Number.parseInt(e.dataTransfer.getData("number"));
    currentClass().methodes[methIndex].parameters.splice(
      parameterIndex,
      0,
      ...currentClass().methodes[methIndex].parameters.splice(src, 1));

    setCurrentClass(currentClass());
    updateView();
  }

  /*
   * derives
   */
  function pushDerive(parentIndex: number) {
    let parent: UMLClass = store.classes[parentIndex];
    if(parent?.property?.toLowerCase() === "interface"){ 
      setStore(
        "derives",
        store.derives.length,
        new UMLInterfaceDerive(parent, currentClass()));
    } else { 
      setStore(
        "derives",
        store.derives.length,
        new UMLClassDerive(parent, currentClass()));
    }
    setCurrentClass(currentClass());
    updateView();
  }

  function deleteDerive(parentIndex: number) {
    let parent: UMLClass = store.classes[parentIndex];
    setStore(
      "derives",
      store.derives.filter(x => x.parent.uuid !== parent.uuid && x.children.uuid !== currentClass().uuid));
    updateView();
  }

  /*
   * UI related methodes
   */
  function updateReadyToMove(state: boolean) {
    setStore("readyToMove", (readyToMove) => {
      readyToMove = state;
      return readyToMove;
    });
  }
  function updateIsStatic(e: Event) {
    if (e.currentTarget instanceof HTMLInputElement) {
      currentClass().isAbstract = e.currentTarget.checked;
      updateView();
    }
  }
  function findClassAt(position: Point): UMLClass {
    for (var i = store.classes.length - 1; i >= 0; i--) {
      const umlClass = store.classes[i];
      const mouseViewX = position.x - store.viewOffset.x;
      const mouseViewY = position.y - store.viewOffset.y;

      if ((umlClass.x * store.zoom) <= mouseViewX // left
        && mouseViewX <= (umlClass.x * store.zoom) + umlClass.width // right
        && (umlClass.y * store.zoom) <= mouseViewY // top
        && mouseViewY <= (umlClass.y * store.zoom) + umlClass.height /* bottom */) {
        return umlClass;
      }
    }

    return null;
  }
  

  /*
   * Canvas
   */
  function onCanvasScroll(e: WheelEvent) {
    // if (e.deltaY > 0) {
    //   setStore("zoom", store.zoom * 0.9);
    //   updateView();
    // } else {
    //   setStore("zoom", store.zoom * 1.1);
    //   updateView();
    // }
  }

  function onCanvasMouseDown(e: MouseEvent) {
    setCurrentClass(null);
    if (e.buttons === 1) {
      setStore("mouse", e);
      setStore("mouseDown", e);
      var umlClass = findClassAt(e);
      if (umlClass) {
        updateReadyToMove(true);
        setCurrentClass(umlClass);
        setStore(
          "selectedClassOffset", 
          {
            x: (e.x - umlClass.x), 
            y: (e.y - umlClass.y)
          });
      }
    }
  }
  function onCanvasMouseMove(e: MouseEvent) {
    let newHoverClass = findClassAt(e);
    if (newHoverClass === null && store.hoverClass !== null) {
      setStore("hoverClass", newHoverClass);
      canvas.style["cursor"] = "default"
      updateView();
    } else if (newHoverClass !== null) {
      // a class below the mouse is found
      if (store.hoverClass?.uuid !== newHoverClass.uuid) {
        // is the curret newHoverClass not the same below the mouse
        setStore("hoverClass", newHoverClass);
        //canvas.style["cursor"] = "move";
        updateView();
      } else {
        const mouseViewX = e.x - store.viewOffset.x;
        const mouseViewY = e.y - store.viewOffset.y;
        const rightBorder = store.hoverClass.x + store.hoverClass.width;
        const bottomBorder = store.hoverClass.y + store.hoverClass.height;
        if (
          !store.hoverBorder &&
          (store.hoverClass.x - 5 <= mouseViewX && mouseViewX <= store.hoverClass.x + 5 // left side hover
            || store.hoverClass.y - 5 <= mouseViewY && mouseViewY + store.viewOffset.y <= store.hoverClass.y + 5 // top side hover
            || rightBorder - 5 <= mouseViewX && mouseViewX <= rightBorder + 5 //
            || bottomBorder - 5 <= mouseViewY && mouseViewY <= bottomBorder + 5)) {
          // if the mouse near the border and the hoverBorder is not set => set border hover
          setStore("hoverBorder", true);
          updateView();
        } else if (store.hoverBorder) {
          // if hoverBorder set but the mouse not close to the border => deselect border hover
          setStore("hoverBorder", false);
          updateView();
        }
      }
    }

    if (e.buttons === 1) {
      // primary mouse button is pressed
      if (currentClass() && store.readyToMove) {
        // If the primary button fell on a class while pressed
        const gridSnap = (store.grid.space / (1 + store.grid.subCount)) * store.zoom;

        const deltaX = (e.x - store.selectedClassOffset.x) * (1 / store.zoom);
        const deltaY = (e.y - store.selectedClassOffset.y) * (1 / store.zoom);

        currentClass().x = Math.floor((deltaX) / gridSnap) * gridSnap;
        currentClass().y = Math.floor((deltaY) / gridSnap) * gridSnap;

        setCurrentClass(currentClass());
        updateView();
      } else {
        // if the primary button goes down on a class
        setStore(
          "viewOffset",
          {
            x: store.viewOffset.x + (e.x - store.mouse.x),
            y: store.viewOffset.y + (e.y - store.mouse.y)
          });
        updateView();
      }
    }
    setStore("mouse", e);
  }
  function onCanvasMouseUp(e: MouseEvent) {
    if (currentClass() && e.buttons === 0 && store.readyToMove) {
      updateReadyToMove(false);
    }
  }
  function onCanvasContextMenu(e: MouseEvent) {
    e.preventDefault();
    var umlClass = findClassAt(e);
    setCurrentClass(umlClass);
    setLocationContextMenu(e);
    setContextMenuOpen(true);
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
    updateView();
  }
  function onContextMenuRemoveClass() {
    // remove class from store
    setStore(
      "classes",
      store.classes.filter(x => x.uuid !== currentClass().uuid));
    
    // remove derives from that class
    setStore(
      "derives",
      store.derives.filter(x => x.parent.uuid !== currentClass().uuid))
      
    updateView();
  }
  function onContextMenuSaveImage() {
    const link = document.createElement("a");
    link.download = 'download.png';
    link.href = canvas.toDataURL();
    link.click();
    link.remove();
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
      
      updateView();
    });

    fileLoader.click();
    fileLoader.remove();
    
  }
  /*
   * Head-Nav
   */

  /*
   * Debug
   */
  // setLocationContextMenu({ x: 100, y: 100 });
  // onContextMenuAddClass();
  // setLocationContextMenu({ x: 500, y: 500 });
  // onContextMenuAddClass();

  // setStore(
  //   "connections",
  //   store.connections.length,
  //   {
  //     src: store.classes[0],
  //     dst: store.classes[1]
  //   });

  /*
   * App
   */
  return (
    <div
      onClick={e => {
        if (isContextMenuOpen()) {
          setContextMenuOpen(false);
        }
      }}
      class="relative min-h-screen max-h-screen">
      <ContextMenu
        hidden={!isContextMenuOpen()}
        location={locationContextMenu()} >
        <NavItem title={"Add Class"}
          classExt={"hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-500"}
          onclick={onContextMenuAddClass} />
        <NavItem title="Delete Class"
          classExt={"hover:bg-red-500"}
          hidden={currentClass() === null}
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
      <canvas
        ref={canvas} id="canny"
        class='absolute bg-transparent'
        onWheel={onCanvasScroll}
        onmousedown={onCanvasMouseDown}
        onmousemove={onCanvasMouseMove}
        onmouseup={onCanvasMouseUp}
        onContextMenu={onCanvasContextMenu} />
      <div class="absolute fixed flex flex-row">
        <Button title='Share' onclick={() => {}} />
        <Field title='Adrress' onInputChange={(e) => setStore("rtc", {target: e.currentTarget.value})} />
        <Button title='Connect' onclick={() => {}} />
      </div>
      <Show when={currentClass()}>
        <div id="side-nav" class="fixed flex max-h-screen top-0 right-0 p-4 min-w-[351px]">
          <div class="flex grow flex-col">
            <div class="bg-white rounded border border-sky-400 px-4 py-2 mb-4 shadow">
              <Label title="Class" />
              <Field title='Property'
                initValue={currentClass().property}
                onInputChange={e => { currentClass().property = e.currentTarget.value; updateView() }} />
              <Field title='Name'
                initValue={currentClass().name}
                onInputChange={e => { currentClass().name = e.currentTarget.value; updateView() }} />
              <CheckBox id="static" title="Abstract" value={currentClass().isAbstract} onChanges={updateIsStatic} />
            </div>
            {/* Tabs */}
            <div>
              <div class='flex flex-row justify-between'>
                <button class={`py-1 w-full text-sm font-medium text-gray-700 rounded-t
                  ${contentIndex() == 0
                    ? "bg-white border-sky-400 border-x border-t"
                    : "border border-gray-400 bg-white border-b-sky-400 hover:border-sky-400 text-gray-400 hover:text-gray-700"}`}
                  onclick={() => setContextIndex(0)}
                >Attributes</button>
                <button class={`py-1 w-full text-sm font-medium text-gray-700 rounded-t
                  ${contentIndex() == 1
                    ? "bg-white border-sky-400 border-x border-t"
                    : "border border-gray-400 bg-white border-b-sky-400 hover:border-sky-400 text-gray-400 hover:text-gray-700"}`}
                  onclick={() => setContextIndex(1)}
                >Methodes</button>
                <button class={`py-1 w-full text-sm font-medium text-gray-700 rounded-t
                  ${contentIndex() == 2
                    ? "bg-white border-sky-400 border-x border-t"
                    : "border border-gray-400 bg-white border-b-sky-400 hover:border-sky-400 text-gray-400 hover:text-gray-700"}`}
                  onclick={() => setContextIndex(2)}
                >Derivces</button>
                {/* <Button title="" onclick={() => setContextIndex(1)} /> */}
              </div>
            </div>
            {/* Tabs content */}
            <Switch>
              <Match when={contentIndex() === 0} >
                <div id="attr-container" class="flex flex-col overflow-hidden max-h-max bg-white rounded-b border-x border-b border-sky-400 p-2 shadow">
                  <Button title='Add attribute' onclick={pushAttribute} />
                  <div class="overflow-y-auto h-full">
                    <For each={currentClass().attributes}>
                      {(attr, i) => <UMLAttributeContainer
                        index={i()}
                        attr={attr}
                        onDrop={e => dropAttribute(i(), e)}
                        update={updateView}
                        delete={() => popAttribute(i())} />}
                    </For>
                  </div>
                </div>
              </Match>
              <Match when={contentIndex() === 1} >
                <div id="meth-container" class="flex flex-col overflow-hidden max-h-max bg-white rounded-b border-x border-b border-sky-400 p-2 shadow">
                  <Button title='Add methode' onclick={pushMethode} />
                  <div class="overflow-y-auto h-full">
                    <For each={currentClass().methodes}>
                      {(methode, iMethode) => {
                        return (<UMLMethodeContainer
                          index={iMethode()}
                          methode={methode}
                          onDrop={e => dropMethode(iMethode(), e)}
                          update={updateView}
                          delete={() => popMethode(iMethode())}
                          onPushParameter={() => pushParameter(iMethode())}>

                          <For each={currentClass().methodes[iMethode()].parameters}>
                            {(param, iParam) => <UMLParameterContainer
                              param={param}
                              popParameter={() => popParameter(iMethode(), iParam())}
                              update={updateView}
                            />}
                          </For>
                        </UMLMethodeContainer>)
                      }}
                    </For>
                  </div>
                </div>
              </Match>
              <Match when={contentIndex() === 2}>
                <div id="meth-container" class="flex flex-col overflow-hidden max-h-max bg-white rounded-b border-x border-b border-sky-400 p-2 shadow">
                  <div class="overflow-y-auto h-full">
                    <For each={store.classes}>
                      {(umlClass, iUmlClass) => {
                        if(umlClass.uuid === currentClass().uuid)
                          return;
                        return (
                          <div 
                            class="relative flex flex-row bg-white rounded border border-sky-400 p-2 mb-2 shadow">
                            <CheckBoxSlim 
                              id={`static-derive-${umlClass.name}`} 
                              value={store.derives.findIndex(x => x.children.uuid === currentClass().uuid && x.parent.uuid === umlClass.uuid) !== -1} 
                              title={umlClass.name} 
                              onChanges={(e) => {e.currentTarget.checked ? pushDerive(iUmlClass()) : deleteDerive(iUmlClass()) }} />
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
    </div>
  );
};

export default App;