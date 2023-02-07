import { Component, createEffect, createSignal, For, JSX, on, onMount, Show } from 'solid-js';
import { createStore } from "solid-js/store";
import { Button } from './api/Button';
import { CheckBox } from './api/CheckBox';
import { ContextMenu, ItemInfo } from './api/ContextMenu';
import { drawTextHCenter, mesureText, drawRectangle, drawTextHLeft, Point } from './api/DrawUtils';
import { Field } from './api/Field';
import { UMLAttribute, UMLAttributeContainer } from './api/UMLAttribute';
import { UMLClass } from './api/UMLClass';
import { UMLMethode, UMLMethodeContainer } from './api/UMLMethode';

const [store, setStore] = createStore<
  { 
    classes:UMLClass[],
    mouse: Point, 
    readyToMove: boolean 
  }>({
  classes: [],
  mouse: { x: 0, y: 0 },
  readyToMove: false
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


const Label: Component<{ title: string }> = (props) =>
  <label class=" text-sm font-medium text-gray-700 w-100-full">{props.title}</label>


var canDraw: boolean = true;
var changingsObserved: boolean = true;

const App: Component = () => {
  const [currentClass, setCurrentClass] = createSignal<UMLClass>(undefined, { equals: false });
  const [isContextMenuOpen, setContextMenuOpen] = createSignal<boolean>(false);
  const [locationContextMenu, setLocationContextMenu] = createSignal<Point>(undefined);
  
  let canvas: HTMLCanvasElement;


  const contextMenuItems:ItemInfo[] = [
  {
      title: "Add Class",
      onclick: (e) => {
        const newClass = new UMLClass(locationContextMenu());
        setStore( "classes", store.classes.length, newClass);
        updateView();
      }
    }, {
      title: "Save image",
      onclick: (e) => {
          const link = document.createElement("a");
          link.download = 'download.png';
          link.href = canvas.toDataURL();
          link.click();
          link.remove();
      }
    }
  ]
  

  
  onMount(() => {
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
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.width);

      const clusterSize = 24;

      const patternCanvas = document.createElement("canvas");
      patternCanvas.width = clusterSize;
      patternCanvas.height = clusterSize;
      

      const patternCanvasContext = patternCanvas.getContext("2d");
      patternCanvasContext.strokeStyle = "#0f172a99";
      patternCanvasContext.moveTo(clusterSize, 0);
      patternCanvasContext.lineTo(clusterSize, clusterSize);
      patternCanvasContext.lineTo(0, clusterSize);
      patternCanvasContext.stroke();

      const bgPattern = ctx.createPattern(patternCanvas, "repeat");
      ctx.fillStyle = bgPattern;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.width);

      ctx.strokeStyle = "black";
      ctx.fillStyle = "white";
      ctx.font = "16px Arial";
      for (var umlClass of store.classes) {
        var xPadding = 16;

        var titleSize = mesureText(ctx, umlClass.toString());
        var attrSizes = umlClass.attributes.map(x => mesureText(ctx, x.toString()));
        var methSizes = umlClass.methodes.map(x => mesureText(ctx, x.toString()));

        var maxHeaderBoxSize = titleSize.height + 8;
        var maxBoxWidth = Math.max(
          titleSize.width + xPadding,
          ...methSizes.map(x => x.width + xPadding),
          ...attrSizes.map(x => x.width + xPadding));
        var maxAttrBoxHeight = Math.max(attrSizes.reduce((p, c) => p + c.height, 0), 10);
        var maxMethBoxHeight = Math.max(methSizes.reduce((p, c) => p + c.height, 0), 10);

        drawRectangle(ctx, umlClass.x, umlClass.y, maxBoxWidth, maxHeaderBoxSize, "black", "white");
        drawTextHCenter(ctx, umlClass.x , umlClass.y + 4, maxBoxWidth, xPadding, titleSize, "black");

        var yOffset = umlClass.y + maxHeaderBoxSize;
        drawRectangle(ctx, umlClass.x, yOffset, maxBoxWidth, maxAttrBoxHeight, "black", "white");
        for (var attr of attrSizes) {
          drawTextHLeft(ctx, umlClass.x, yOffset, xPadding, attr, "black");
          yOffset += attr.height;
        }

        yOffset = umlClass.y + maxHeaderBoxSize + maxAttrBoxHeight;

        drawRectangle(ctx, umlClass.x, yOffset, maxBoxWidth, maxMethBoxHeight, "black", "white");
        for (var meth of methSizes) {
          drawTextHLeft(ctx, umlClass.x, yOffset, xPadding, meth, "black");
          yOffset += meth.height;
        }

        umlClass.width = maxBoxWidth;
        umlClass.height = maxHeaderBoxSize + maxAttrBoxHeight + maxMethBoxHeight;

        ctx.fillStyle = "red";
        ctx.fillRect(umlClass.x, umlClass.y + umlClass.height, umlClass.width, 1);
      }

      changingsObserved = false;
    }
    requestAnimationFrame(() => render(ctx));
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

  function updateMousePos(mouseEvent: MouseEvent) {
    setStore("mouse", (mouse) => {
      mouse.x = mouseEvent.x;
      mouse.y = mouseEvent.y;
      return mouse;
    });
  }

  function onCanvasMouseDown(e: MouseEvent) {
    setCurrentClass();
    if (e.buttons === 1) {
      updateMousePos(e);
      for (var umlClass of store.classes) {
        if (umlClass.x <= e.x && e.x <= umlClass.x + umlClass.width
          && umlClass.y <= e.y && e.y <= umlClass.y + umlClass.height) {
          updateReadyToMove(true);
          setCurrentClass(umlClass);
        }
      }
    }

  }

  function onCanvasMouseMove(e: MouseEvent) {
    if (currentClass() && e.buttons === 1 && store.readyToMove) {
      var deltaX = e.x - store.mouse.x;
      var deltaY = e.y - store.mouse.y;

      currentClass().x += deltaX;
      currentClass().y += deltaY;

      setCurrentClass(currentClass());
      updateView();
    }

    updateMousePos(e);
  }

  function onCanvasMouseUp(e: MouseEvent) {
    if (currentClass() && e.buttons === 0 && store.readyToMove) {
      updateReadyToMove(false);
    }
  }

  function onCanvasContextMenu(e:MouseEvent) {
    e.preventDefault();
    setLocationContextMenu({x: e.x, y: e.y});
    setContextMenuOpen(true);
  }


  return (
    <div
      onClick={e => {
        if(isContextMenuOpen()){
          setContextMenuOpen(false);
        }
      }}
      class="relative min-h-screen max-h-screen">
      <ContextMenu hidden={!isContextMenuOpen()} items={contextMenuItems} location={locationContextMenu()}/>

      <canvas
        ref={canvas} id="canny"
        class='absolute bg-transparent w-full h-full'
        onmousedown={onCanvasMouseDown}
        onmousemove={onCanvasMouseMove}
        onmouseup={onCanvasMouseUp}
        onContextMenu={onCanvasContextMenu}
        onchange={() => {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
          updateView();
        }} />

      <Show when={currentClass()}>
        <div id="side-nav" class="fixed flex min-h-screen max-h-screen top-0 right-0 p-4 min-w-[269px]">
          <div class="flex grow flex-col gap-4 ">
            <div class="bg-white rounded border border-sky-400 px-4 py-2 shadow">
              <Label title="Class" />
              <Field title='Name'
                initValue={currentClass().name}
                onInputChange={e => { currentClass().name = e.currentTarget.value; updateView() }} />
              <CheckBox id="static" title="Abstract" value={currentClass().isAbstract} onChanges={updateIsStatic} />
            </div>
            <div id="attr-container" class="
              flex flex-col h-full
              overflow-hidden max-h-max bg-white rounded border border-sky-400 px-2 py-2 shadow">
              <Label title="Attributes" />
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
            <div id="meth-container" class="
              flex flex-col h-full
              overflow-hidden max-h-max bg-white rounded border border-sky-400 px-2 py-2 shadow">
              <Label title="Methodes" />
              <Button title='Add methode' onclick={pushMethode} />
              <div class="overflow-y-auto h-full">
                <For each={currentClass().methodes}>
                  {(meth, i) => <UMLMethodeContainer
                    index={i()}
                    methode={meth}
                    onDrop={e => dropMethode(i(), e)}
                    update={updateView}
                    delete={() => popMethode(i())} />}
                </For>
              </div>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default App;
