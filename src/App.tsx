import { fromJSON } from 'postcss';
import { cancelCallback, Component, createEffect, createSignal, For, JSX, on, onMount, Show } from 'solid-js';
import { createStore } from "solid-js/store";
import { Button } from './api/Button';
import { CheckBox } from './api/CheckBox';
import { ContextMenu, ItemInfo } from './api/ContextMenu';
import { drawTextHCenter, measureText, drawRectangle, drawTextHLeft, Point, SingleTextBlock, strokeRectangle } from './api/DrawUtils';
import { Field } from './api/Field';
import { UMLAttribute, UMLAttributeContainer } from './api/UMLAttribute';
import { UMLClass } from './api/UMLClass';
import { UMLMethode, UMLMethodeContainer } from './api/UMLMethode';

const [store, setStore] = createStore<
  { 
    classes:UMLClass[],
    mouse: Point, 
    readyToMove: boolean,
    viewOffset: Point
  }>({
  classes: [],
  mouse: { x: 0, y: 0 },
  readyToMove: false,
  viewOffset: {x: 0, y: 0}
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

var changingsObserved: boolean = true;

const App: Component = () => {
  const [currentClass, setCurrentClass] = createSignal<UMLClass>(undefined, { equals: false });
  const [isContextMenuOpen, setContextMenuOpen] = createSignal<boolean>(false);
  const [locationContextMenu, setLocationContextMenu] = createSignal<Point>(undefined);
  
  let frameNumber: number;
  let canvas: HTMLCanvasElement;

  const contextMenuItems:ItemInfo[] = [
  {
      title: "Add Class",
      onclick: (e) => {
        const newClass = new UMLClass(locationContextMenu());
        setStore("classes", store.classes.length, newClass);
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
    }, {
      title: "Save state",
      onclick: (e) => {
          const link = document.createElement("a");
          var file = new Blob(
            [JSON.stringify(store.classes)], 
            {type: 'application/json;charset=utf-8'});
          link.download = 'config.json';
          link.href = URL.createObjectURL(file);
          link.click();
          link.remove();
      }
    }, {
      title: "Load saved state",
      onclick:  (e) => {
          var fileLoader = document.createElement("input");
          fileLoader["type"] = "file";
          fileLoader["accept"] = "application/json";
          fileLoader.addEventListener('change', async e => {
            if(fileLoader.files.length > 1){
              return;
            } 

            if(fileLoader.files.length != 1){
              return;
            }
            var file = fileLoader.files[0];
            var buffer = await file.arrayBuffer();
            var content = new TextDecoder("utf-8").decode(buffer);
            var jsonArray = JSON.parse(content);
            setStore("classes", []);
            for(var element of jsonArray){ 
              const cls = new UMLClass({
                x: element["x"] ?? 0,
                y: element["y"] ?? 0
              });
              cls.name = element["name"],
              cls.width = element["width"];
              cls.height = element["height"];
              cls.isAbstract =  element["isAbstract"] ?? false;
              cls.attributes = [];
              for(var attrElement of element["attributes"] ?? [])
              {
                 const attr:UMLAttribute = new UMLAttribute();
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
              for(var methElement of element["methodes"] ?? []) { 
                const meth:UMLMethode = new UMLMethode();

                meth.isStatic = methElement["isStatic"] ?? false;
                meth.name = methElement["name"] ?? "methode";
                meth.returnType = methElement["returnType"] ?? undefined;
                meth.accessModifier = methElement["accessModifier"] ?? undefined;
                meth.parameters = methElement["parameters"] ?? undefined;
                
                cls.methodes.push(meth);
              }

              setStore(
                "classes",
                store.classes.length, 
                cls);
            }
            
            updateView();
          })
          fileLoader.click();
          fileLoader.remove();
      }
    }
  ]

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
      
      const clusterSize = 24;
      const clusterColor = "#00505033";
      const xClusterShift = (store.viewOffset.x % clusterSize);
      const yClusterShift = (store.viewOffset.y % clusterSize);

      for(var x = 0 + xClusterShift; x < canvas.width; x+=clusterSize){ 
        strokeRectangle(ctx, x, 0, 0.5, canvas.height, clusterColor);
      }
      for(var y = 0 + yClusterShift; y < canvas.height; y+=clusterSize){ 
        strokeRectangle(ctx, 0, y, canvas.width, 0.5, clusterColor);
      }

      ctx.strokeStyle = "black";
      ctx.fillStyle = "white";
      ctx.font = "16px Arial";
      for (var umlClass of store.classes) {
        var xPadding = 16;

        var titleSize = measureText(ctx, umlClass.toString());
        var attrSizes = umlClass.attributes?.map(x => { 
          var measuredText = measureText(ctx, x.toString());
          if(measuredText instanceof SingleTextBlock){ 
            measuredText.decoration.underline = x.isStatic ?? false;
          }
          return measuredText;
        }) ?? [];
        var methSizes = umlClass.methodes?.map(x => { 
          var measuredText = measureText(ctx, x.toString());
          if(measuredText instanceof SingleTextBlock){ 
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

        const xClassOffset =  store.viewOffset.x + umlClass.x;
        const yClassOffset =  store.viewOffset.y + umlClass.y;

        drawRectangle(ctx, xClassOffset, yClassOffset, maxBoxWidth, maxHeaderBoxSize, "black", "white");
        drawTextHCenter(ctx, xClassOffset , yClassOffset + 4, maxBoxWidth, xPadding, titleSize, "black");

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
        const mouseViewX = e.x - store.viewOffset.x;
        const mouseViewY = e.y - store.viewOffset.y;

        if (umlClass.x <= mouseViewX && mouseViewX <= umlClass.x + umlClass.width
          && umlClass.y <= mouseViewY && mouseViewY <= umlClass.y + umlClass.height) {
          updateReadyToMove(true);
          setCurrentClass(umlClass);
        }
      }
    }

  }

  function onCanvasMouseMove(e: MouseEvent) {
    if (e.buttons === 1) {
      var deltaX = e.x - store.mouse.x;
      var deltaY = e.y - store.mouse.y;
      if(currentClass() && store.readyToMove) {
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
        class='absolute bg-transparent'
        onmousedown={onCanvasMouseDown}
        onmousemove={onCanvasMouseMove}
        onmouseup={onCanvasMouseUp}
        onContextMenu={onCanvasContextMenu}/>
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
