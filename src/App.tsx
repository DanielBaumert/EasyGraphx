import { Component, createSignal, For, Match, onMount, Show, Switch } from 'solid-js';
import { createStore } from "solid-js/store";
import { Button } from './api/Button';
import { CheckBox } from './api/CheckBox';
import { ContextMenu, NavItem } from './api/ContextMenu';
import { drawTextHCenter, measureText, drawRectangle, drawTextHLeft, Point, SingleTextBlock, drawLine } from './api/DrawUtils';
import { Field } from './api/Field';
import { Label } from './api/Label';
import { UMLAttribute, UMLAttributeContainer } from './api/UMLAttribute';
import { UMLClass } from './api/UMLClass';
import { UMLMethode, UMLMethodeContainer } from './api/UMLMethode';
import { UMLParameter, UMLParameterContainer } from './api/UMLParameter';

type Connector = {
  src: UMLClass,
  dst: UMLClass
};

const [store, setStore] = createStore<
  {
    classes: UMLClass[],
    connections: Connector[]
    mouse: Point,
    readyToMove: boolean,
    viewOffset: Point
  }>({
    classes: [],
    connections: [],
    mouse: { x: 0, y: 0 },
    readyToMove: false,
    viewOffset: { x: 0, y: 0 }
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
  const [currentClass, setCurrentClass] = createSignal<UMLClass>(undefined, { equals: false });
  const [contentIndex, setContextIndex] = createSignal<number>(0);
  const [locationContextMenu, setLocationContextMenu] = createSignal<Point>(undefined);

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
      // Draw background
      {
        const clusterSize = 24;
        const clusterColor = "#00505033";
        const xClusterShift = (store.viewOffset.x % clusterSize);
        const yClusterShift = (store.viewOffset.y % clusterSize);

        for (var x = 0 + xClusterShift; x < canvas.width; x += clusterSize) {
          drawLine(ctx, x, 0, x, canvas.height, clusterColor);
        }
        for (var y = 0 + yClusterShift; y < canvas.height; y += clusterSize) {
          drawLine(ctx, 0, y, canvas.width, y, clusterColor);
        }
      }
      // Draw connections
      {
        for(var connection of store.connections){
          
          
          drawLine(ctx, 
            store.viewOffset.x + connection.src.x + (connection.src.width / 2),
            store.viewOffset.y + connection.src.y + (connection.src.height / 2),
            store.viewOffset.x + connection.dst.x + (connection.dst.width / 2),
            store.viewOffset.y + connection.dst.y + (connection.dst.height / 2),
            "black");
        }
      }
      // Draw classes
      {
        ctx.strokeStyle = "black";
        ctx.fillStyle = "white";
        ctx.font = "16px Arial";
        for (var umlClass of store.classes) {
          var xPadding = 16;

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

          var maxHeaderBoxSize = titleSize.height + 8;
          var maxBoxWidth = Math.max(
            titleSize.width + xPadding,
            ...methSizes?.map(x => x.width + xPadding),
            ...attrSizes?.map(x => x.width + xPadding));
          var maxAttrBoxHeight = Math.max(attrSizes?.reduce((p, c) => p + c.height, 0), 10);
          var maxMethBoxHeight = Math.max(methSizes?.reduce((p, c) => p + c.height, 0), 10);

          const xClassOffset = store.viewOffset.x + umlClass.x;
          const yClassOffset = store.viewOffset.y + umlClass.y;

          drawRectangle(ctx, xClassOffset, yClassOffset, maxBoxWidth, maxHeaderBoxSize, "black", "white");
          drawTextHCenter(ctx, xClassOffset, yClassOffset + 4, maxBoxWidth, xPadding, titleSize, "black");

          var yOffset = yClassOffset + maxHeaderBoxSize;
          drawRectangle(ctx, xClassOffset, yOffset, maxBoxWidth, maxAttrBoxHeight, "black", "white");
          for (var attr of attrSizes) {
            drawTextHLeft(ctx, xClassOffset, yOffset, xPadding, attr, "black");
            yOffset += attr.height;
          }

          yOffset = yClassOffset + maxHeaderBoxSize + maxAttrBoxHeight;

          drawRectangle(ctx, xClassOffset, yOffset, maxBoxWidth, maxMethBoxHeight, "black", "white");
          for (var meth of methSizes) {
            drawTextHLeft(ctx, xClassOffset, yOffset, xPadding, meth, "black");
            yOffset += meth.height;
          }

          umlClass.width = maxBoxWidth;
          umlClass.height = maxHeaderBoxSize + maxAttrBoxHeight + maxMethBoxHeight;
        }
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
    setStore("mouse", mouseEvent);
  }

  function findClassAt(position: { x: number, y: number }): UMLClass {
    for (var i = store.classes.length - 1; i >= 0; i--) {
      const umlClass = store.classes[i];
      const mouseViewX = position.x - store.viewOffset.x;
      const mouseViewY = position.y - store.viewOffset.y;

      if (umlClass.x <= mouseViewX && mouseViewX <= umlClass.x + umlClass.width
        && umlClass.y <= mouseViewY && mouseViewY <= umlClass.y + umlClass.height) {
        return umlClass;
      }
    }

    return undefined;
  }

  /*
   * Canvas
   */
  function onCanvasMouseDown(e: MouseEvent) {
    setCurrentClass();
    if (e.buttons === 1) {
      updateMousePos(e);
      var umlClass = findClassAt(e);
      if (umlClass) {
        updateReadyToMove(true);
        setCurrentClass(umlClass);
      }
    }
  }

  function onCanvasMouseMove(e: MouseEvent) {
    if (e.buttons === 1) {
      var deltaX = e.x - store.mouse.x;
      var deltaY = e.y - store.mouse.y;
      if (currentClass() && store.readyToMove) {
        currentClass().x += deltaX;
        currentClass().y += deltaY;

        setCurrentClass(currentClass());
        updateView();
      } else {
        setStore(
          "viewOffset",
          {
            x: store.viewOffset.x + deltaX,
            y: store.viewOffset.y + deltaY
          })
        updateView();
      }
    }

    updateMousePos(e);
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
    const newClass = new UMLClass(locationContextMenu());
    setStore("classes", store.classes.length, newClass);
    updateView()
  }

  function onContextMenuRemoveClass() {
    setStore(
      "classes",
      store.classes.filter(x => x.uuid !== currentClass().uuid));
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
      [JSON.stringify(store.classes)],
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

      var file = fileLoader.files[0];
      var buffer = await file.arrayBuffer();
      var content = new TextDecoder("utf-8").decode(buffer);
      var jsonArray = JSON.parse(content);

      setStore("classes", []);
      for (var element of jsonArray) {
        const cls = new UMLClass({
          x: element["x"] ?? 0,
          y: element["y"] ?? 0
        });
        cls.name = element["name"],
          cls.width = element["width"];
        cls.height = element["height"];
        cls.isAbstract = element["isAbstract"] ?? false;
        cls.attributes = [];
        for (var attrElement of element["attributes"] ?? []) {
          const attr: UMLAttribute = new UMLAttribute();
          attr.isStatic = attrElement["isStatic"] ?? false;
          attr.isConstant = attrElement["isConstant"] ?? false;
          attr.accessModifier = attrElement["accessModifier"] ?? undefined;
          attr.name = attrElement["name"];
          attr.type = attrElement["type"] ?? undefined;
          attr.multiplicity = attrElement["multiplicity"] ?? undefined;
          attr.defaultValue = attrElement["defaultValue"] ?? undefined;

          cls.attributes.push(attr);
        }
        cls.methodes = [];
        for (var methElement of element["methodes"] ?? []) {
          const meth: UMLMethode = new UMLMethode();

          meth.isStatic = methElement["isStatic"] ?? false;
          meth.name = methElement["name"] ?? "methode";
          meth.returnType = methElement["returnType"] ?? undefined;
          meth.accessModifier = methElement["accessModifier"] ?? undefined;
          meth.parameters = [];

          for (var paramElement of methElement['parameters'] ?? []) {
            const param = new UMLParameter();
            param.name = paramElement["name"] ?? undefined;
            param.type = paramElement["type"] ?? undefined;

            meth.parameters.push(param);
          }

          cls.methodes.push(meth);
        }

        setStore(
          "classes",
          store.classes.length,
          cls);
      }

      updateView();
    });

    fileLoader.click();
    fileLoader.remove();
  }

  setLocationContextMenu({x: 100, y:100});
  onContextMenuAddClass();
  setLocationContextMenu({x: 500, y:500});
  onContextMenuAddClass();

  setStore(
    "connections",
     store.connections.length,
     {
      src: store.classes[0],
      dst: store.classes[1]
    });
  

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
          hidden={currentClass() === undefined}
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
        onmousedown={onCanvasMouseDown}
        onmousemove={onCanvasMouseMove}
        onmouseup={onCanvasMouseUp}
        onContextMenu={onCanvasContextMenu} />
      <Show when={currentClass()}>
        <div id="side-nav" class="fixed flex min-h-screen max-h-screen top-0 right-0 p-4 min-w-[269px]">
          <div class="flex grow flex-col">
            <div class="bg-white rounded border border-sky-400 px-4 py-2 shadow">
            <Label title="Class" />
            <Field title='Property'
              initValue={currentClass().property}
              onInputChange={e => { currentClass().property = e.currentTarget.value; updateView() }} />
            <Field title='Name'
              initValue={currentClass().name}
              onInputChange={e => { currentClass().name = e.currentTarget.value; updateView() }} />
            <CheckBox id="static" title="Abstract" value={currentClass().isAbstract} onChanges={updateIsStatic} />
            </div>
            <div>
              <div class='flex flex-row justify-between'>
                <button class={`py-1 w-full text-sm font-medium text-gray-700 rounded-t
                  ${contentIndex() == 0
                    ? "bg-white border-sky-400 border-x border-t"
                    : "border-gray-400 border-x border-t bg-white hover:border-sky-400 text-gray-400 hover:text-gray-700"}`}
                  onclick={() => setContextIndex(0)}
                >Attributes</button>
                <button class={`tpy-1 w-full text-sm font-medium text-gray-700 rounded-t
                  ${contentIndex() == 1
                    ? "bg-white border-sky-400 border-x border-t"
                    : "border border-gray-400 bg-white border-b-sky-400  hover:border-sky-400 text-gray-400 hover:text-gray-700"}`}
                  onclick={() => setContextIndex(1)}
                >Methodes</button>
                {/* <Button title="" onclick={() => setContextIndex(1)} /> */}
              </div>
            </div>
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
            </Switch>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default App;
