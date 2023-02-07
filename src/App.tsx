import { Component, createEffect, createSignal, For, JSX, on, onMount, Show } from 'solid-js';
import { createStore } from "solid-js/store";
import { CheckBox } from './api/CheckBox';
import { drawTextHCenter, mesureText, drawRectangle, drawTextHLeft, Point } from './api/DrawUtils';
import { Field } from './api/Field';
import { UMLAttribute, UMLAttributeContainer } from './api/UMLAttribute';
import { UMLClass } from './api/UMLClass';


const [store, setStore] = createStore<{ classes: UMLClass[], mouse: Point, readyToMove: boolean }>({
  classes: [],
  mouse: { x: 0, y: 0 },
  readyToMove: false
});


var exampleClass = new UMLClass();
exampleClass.isAbstract = true;
exampleClass.attributes.push(new UMLAttribute());

setStore(
  "classes",
  (classes) => {
    classes.push(exampleClass)
    return classes;
  });

const Label: Component<{ title: string }> = (props) =>
  <label class=" text-sm font-medium text-gray-700">{props.title}</label>

const Button: Component<{ title: string, onclick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> }> = (props) => (
  <button class="
        py-1 w-full rounded mb-1 
        border border-gray-200 
        text-sm font-medium text-gray-700 
        hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-500 hover:text-white hover:shadow"
    onclick={props.onclick}>
    {props.title}
  </button>)

var canDraw: boolean = true;
var changingsObserved: boolean = true;


const App: Component = () => {
  const [currentClass, setCurrentClass] = createSignal<UMLClass>(undefined, { equals: false });
  let canvas: HTMLCanvasElement;
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

      ctx.fillStyle = "white";
      ctx.strokeStyle = "black";
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.width);
      ctx.font = "16px Arial";


      for (var umlClass of store.classes) {
        var xPadding = 16;

        var titleSize = mesureText(ctx, umlClass.toString());
        var attrSizes = umlClass.attributes.map(x => mesureText(ctx, x.toString()));

        var maxHeaderBoxSize = titleSize.height;
        var maxBoxWidth = Math.max(titleSize.width + xPadding, ...attrSizes.map(x => x.width + xPadding));
        var maxAttrBoxHeight = attrSizes.reduce((p, c) => p + c.height, 0);

        drawRectangle(ctx, umlClass.x, umlClass.y, maxBoxWidth, maxHeaderBoxSize, "black", "white");
        drawTextHCenter(ctx, umlClass.x, umlClass.y, maxBoxWidth, xPadding, titleSize, "black");

        var yOffset = umlClass.y + maxHeaderBoxSize;
        drawRectangle(ctx, umlClass.x, yOffset, maxBoxWidth, maxAttrBoxHeight, "black", "white");
        for (var attr of attrSizes) {
          drawTextHLeft(ctx, umlClass.x, yOffset, xPadding, attr, "black");
          yOffset += attr.height;
        }

        umlClass.width = maxBoxWidth;
        umlClass.height = maxHeaderBoxSize + maxAttrBoxHeight;

        ctx.fillStyle = "red";
        ctx.fillRect(umlClass.x, umlClass.y + umlClass.height, umlClass.width, 1);
      }

      changingsObserved = false;
    }
    requestAnimationFrame(() => render(ctx));


  }

  // function emptyCurrentClass() { 
  //   setCurrentClass(
  //     ,
  //     (attrs) => { 
  //       attrs.push(attr);
  //       return attrs;
  //     } 
  //   )
  // }

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

  function updateReadyToMove(state: boolean) {
    setStore("readyToMove", (readyToMove) => {
      readyToMove = state;
      return readyToMove;
    });
  }

  function updateIsStatic(e:Event){ 
    if(e.currentTarget instanceof HTMLInputElement){ 
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

  // createEffect(
  //   on(
  //     () => currentClass(),
  //     (value) => {
  //       return value;
  // }));

  return (
    <div class="relative min-h-screen">
      <svg class="absolute h-screen w-full">
        <defs>
          <pattern id="bg-image" patternUnits="userSpaceOnUse" width="32" height="32" stroke="#0f172a" stroke-opacity=".2">
            <path fill="none" d="M0 .5H31.5V32" />
          </pattern>
        </defs>
        <rect fill="url(#bg-image)" stroke="black" width="100%" height="100%" />
      </svg>

      <canvas
        ref={canvas} id="canny"
        class='absolute bg-transparent w-full h-full'
        onmousedown={onCanvasMouseDown}
        onmousemove={onCanvasMouseMove}
        onmouseup={onCanvasMouseUp}
        onchange={() => {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
          updateView();
        }} />

      <Show when={currentClass()}>
        <div id="side-nav" class="fixed top-0 right-0 gap-4 flex flex-col m-4">
          <div class="bg-white rounded border border-sky-400 px-4 py-2 shadow">
            <Label title="Class" />
            <Field title='Name'
              initValue={currentClass().name}
              onInputChange={e => { currentClass().name = e.currentTarget.value; updateView() }} />
            <CheckBox title="Abstract" value={currentClass().isAbstract} onChanges={updateIsStatic} />
          </div>
          <div id="attr-container" class="bg-white rounded border border-sky-400 px-2 py-2 shadow">
            <Label title="Attributes" />
            <For each={currentClass().attributes}>
              {(attr, i) => <UMLAttributeContainer
                index={i()}
                attr={attr}
                onDrop={e => dropAttribute(i(), e)}
                update={updateView}
                delete={() => popAttribute(i())} />}
            </For>
            <Button title='Add attribute' onclick={pushAttribute} />
          </div>
        </div>
      </Show>
    </div>
  );
};

export default App;
