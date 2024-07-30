import { vec2, Vec2 } from "wgpu-matrix";

export type Color = Float32Array;

export const BLACK: Color = new Float32Array([0.0, 0.0, 0.0, 1.0]);
export const WHITE: Color = new Float32Array([1.0, 1.0, 1.0, 1.0]);


const GPUColors = { 
  BLACK: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
  WHITE: { r: 1.0, g: 1.0, b: 1.0, a: 1.0 },
}

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

const shader_background = `
const space : f32 = 2.0f / 64.0f;
const width : f32 = 2.0f / 1920.0f;
const moveOffset : f32 = 1.0f % space;

struct ScreenInfo { 
  size: vec2f,
  offset: vec2f,
  grid: vec2f, // x => size, y => subdevision
  color: vec4f
};

@group(0) @binding(0) var<uniform> screenInfo : ScreenInfo;

@vertex
fn vs(
  @builtin(vertex_index) VertexIndex : u32
) -> @builtin(position) vec4f {

  let offset : f32 = floor(f32(VertexIndex / 6)) * space + moveOffset;

  var pos = array<vec2f, 6>(
    vec2(-1.0f + offset,        -1),
    vec2(-1.0f + offset,         1),
    vec2(-1.0f + offset + width, 1),

    vec2(-1.0f + offset,         -1),
    vec2(-1.0f + offset + width,  1),
    vec2(-1.0f + offset + width, -1 + width)
  );

  return vec4f(pos[VertexIndex % 6], 0.0, 1.0);
}

@fragment
fn fs() -> @location(0) vec4f {
  return vec4(1.0, 0.0, 0.0, 1.0);
}`

type WebGPUContext = {
  adapter?: GPUAdapter;
  device?: GPUDevice;
  context?: GPUCanvasContext;
  textureFormat?: GPUTextureFormat;

}

const webGpuContex : WebGPUContext = { }

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

const configureContext = () => {
  webGpuContex.context.configure({
    device: webGpuContex.device,
    format: webGpuContex.textureFormat = navigator.gpu.getPreferredCanvasFormat(),
    alphaMode: 'premultiplied',
  });
}

export const InitWebGpu = async (canvas: HTMLCanvasElement) => { 

 if (!isWebGPUSupported()) {
    throw Error("WebGPU not supported.");
  }
  webGpuContex.adapter = await getGPUAdapter();
  webGpuContex.device = await getGPUDevice(webGpuContex.adapter);
  webGpuContex.context = canvas.getContext("webgpu");

  configureContext();
  
  const shader = webGpuContex.device.createShaderModule({
    code: shader_background,
  });

  
  const pipeline = webGpuContex.device.createRenderPipeline({
    label: "Background Pipeline",
    layout: 'auto',
    vertex: {
      module: shader,
      entryPoint: 'vs',
    },
    fragment: {
      module: shader,
      entryPoint: 'fs',
      targets: [{ format: webGpuContex.textureFormat }],
    },
    primitive: {
      topology: 'triangle-list',
    }
  });

  const screenInfoSize = 
    2 * 4 + // size
    2 * 4 + // offset
    2 * 4 + // grid
    4 * 4;  // color

  const screenInfo = webGpuContex.device.createBuffer({
    label: "Screen Info",
    size: screenInfoSize,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const aspect = canvas.width / canvas.height;

  const uniformValues = new Float32Array(screenInfoSize / 4);
  uniformValues.set([canvas.width / aspect, canvas.height], 0);
  uniformValues.set([0, 0], 2);
  uniformValues.set([64, 64], 4);
  uniformValues.set([1, 0, 0, 1], 6);

  const bindGroup = webGpuContex.device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [{
      binding: 0,
      resource: {
        buffer: screenInfo
      }
    }]
  })

  const frame = () => { 

    const commandEncoder = webGpuContex.device.createCommandEncoder();
    const textureView = webGpuContex.context.getCurrentTexture().createView();

    webGpuContex.device.queue.writeBuffer(screenInfo, 0, uniformValues);

    const renderPassDescriptor: GPURenderPassDescriptor = {
      colorAttachments: [
        {
          view: textureView,
          clearValue: [0.0, 0.0, 0.0, 1.0],
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
    };

    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
    passEncoder.setPipeline(pipeline);
    passEncoder.setBindGroup(0, bindGroup);
    passEncoder.draw(6 * 65);
    passEncoder.end();

    webGpuContex.device.queue.submit([commandEncoder.finish()]);
   /// requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}