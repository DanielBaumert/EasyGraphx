import { vec2, Vec2 } from "wgpu-matrix";

export type Color = Float32Array;

export const BLACK: Color = new Float32Array([0.0, 0.0, 0.0, 1.0]);
export const WHITE: Color = new Float32Array([1.0, 1.0, 1.0, 1.0]);



export type LineType = {
  0: "solid";
  1: "dashed";
  2: "dotted";
}

export type LineMode = {
  0: "inner";
  1: "center";
  2: "outer";
}

export type Line = {
  objectType: 0;
  start: Vec2;
  end: Vec2;
  color: Color;
  width: number;
  mode: LineMode;
  type: LineType;
}

export type Rectanlge = {
  objectType: 1;
  start: Vec2;
  end: Vec2;
  color: Color;
  width: number;
  mode: LineMode;
  type: LineType;
}






const isWebGPUSupported = () => navigator.gpu

const getGPUAdapter = async () : Promise<GPUAdapter>  => {
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    throw Error("No GPU adapter found.");
  }
  return adapter;
}

const getGPUDevice = async (adapter : GPUAdapter) : Promise<GPUDevice> => {
  const device = await adapter.requestDevice();
  if (!device) {
    throw Error("No GPU device found.");
  }
  return device;
}


const createBackgroundShader = (device : GPUDevice) => {
  const shader = `
@group(0) @binding(0)

  
  `;

  const vertices = new Float32Array([
    -1, -1, // Triangle 1
     0, -1,
     0,  0,

    -1, -1, // Triangle 2
     1,  1,
    -1,  1,
  ]);

  const vertexBuffer = device.createBuffer({
    label: "Cell vertices",
    size: vertices.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  });

  device.createShaderModule({
    code: shader,
  });

  return shader;
}


const configureContext = (context, device) => {
  context.configure({
    device: device,
    format: navigator.gpu.getPreferredCanvasFormat(),
    alphaMode: 'premultiplied',
  });
}

export const InitWebGpu = async (canvas: HTMLCanvasElement) => { 

 if (!isWebGPUSupported()) {
    throw Error("WebGPU not supported.");
  }

  const adapter = await getGPUAdapter();
  const device = await getGPUDevice(adapter);


  const context = canvas.getContext("webgpu");

  configureContext(context, device);
  
  const encoder = device.createCommandEncoder();
  const pass = encoder.beginRenderPass({
    colorAttachments: [{
       view: context.getCurrentTexture().createView(),
       loadOp: "clear",
       storeOp: "store",
       clearValue: { r: 0, g: 0, b: 0.4, a: 1 }, // New line
    }]
  });

  pass.end();
  const commandBuffer = encoder.finish();
  device.queue.submit([commandBuffer]);
}