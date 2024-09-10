import { Math2 } from "../Math2";
import { MultiTextBlock, SingleTextBlock } from "./TextBlock";


export function drawTextHCenter(
  ctx: CanvasRenderingContext2D,
  xBox: number, yBox: number,
  wBox: number,
  xPadding: number,
  text: SingleTextBlock | MultiTextBlock,
  color: string | CanvasGradient | CanvasPattern): void {
  ctx.fillStyle = color;
  if ('decoration' in text) {
    let xCenter = xBox + (xPadding / 2) + (wBox - text.width - xPadding) / 2;
    ctx.fillText(text.value, xCenter, yBox + text.baseline);
  } else {
    for (let singleLine of text.value) {
      let xCenter = xBox + (xPadding / 2) + (wBox - singleLine.width - xPadding) / 2;
      ctx.fillText(singleLine.value, xCenter, yBox + singleLine.baseline);
      yBox += singleLine.height;
    }
  }
}

// draw text left alignt
export function drawTextHLeft(
  ctx: CanvasRenderingContext2D,
  xBox: number, yBox: number,
  xPadding: number,
  text: SingleTextBlock | MultiTextBlock,
  color: string | CanvasGradient | CanvasPattern): void {
  ctx.fillStyle = color;
  if ('decoration' in text ) {
    let xText = xBox + (xPadding / 2);
    let yText = yBox + text.baseline;
    ctx.fillText(text.value, xText, yText);
    if (text.decoration.underline) {
      ctx.strokeRect(xText, yText + 2, text.width, .5);
    }
  } else {
    for (let singleRow of text.value) {
      ctx.fillText(singleRow.value, xBox + xPadding, yBox + singleRow.baseline);
      yBox += singleRow.height;
    }
  }
}



export function measureText(ctx: CanvasRenderingContext2D, value?: string): SingleTextBlock | MultiTextBlock {
  if (value?.includes("\n") === true) {
    let width = 0;
    let height = 0;

    let rows : SingleTextBlock[] = value.split('\n')
      .map(value => {
        let rowMesure = ctx.measureText(value);
        const baseLine = rowMesure.fontBoundingBoxAscent;
        const stHeight = baseLine + rowMesure.fontBoundingBoxDescent;

        width = Math.max(width, rowMesure.width);
        height += stHeight;

        return {
          value: value,
          baseline: baseLine,
          width: rowMesure.width,
          height: stHeight
         } as SingleTextBlock;
      });

    return { 
      value: rows,
      width: width,
      height: height
    } as MultiTextBlock;
  }


  let textMesure = ctx.measureText(value);
  let textHeight = textMesure.fontBoundingBoxAscent + textMesure.fontBoundingBoxDescent;

  return { 
    value: value, 
    baseline : textMesure.fontBoundingBoxAscent,
    width : textMesure.width, 
    height : textHeight,
    decoration: { underline: false }
  } as SingleTextBlock;
}

export function drawRectangle(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  strokeColor: string | CanvasGradient | CanvasPattern,
  fillColor: string | CanvasGradient | CanvasPattern) : void {
  ctx.strokeStyle = strokeColor;
  ctx.strokeRect(x, y, w, h);

  ctx.fillStyle = fillColor;
  ctx.fillRect(x, y, w, h);
}

export function fillRectangle(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  color: string | CanvasGradient | CanvasPattern) : void {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

export function fillTriangle(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  alpha: number,
  strokeColor: string | CanvasGradient | CanvasPattern,
  fillColor: string | CanvasGradient | CanvasPattern) : void {
  let asin = Math.sin(alpha);
  let acos = Math.cos(alpha);

  let hCenter = h * .5;
  //      p1
  //      /|
  // p2  . |
  //      \|
  //      p3
  let p1 = rotate(w, -hCenter, asin, acos);
  let p2 = { x: 0, y: 0 }; // anchor
  let p3 = rotate(w, hCenter, asin, acos);

  ctx.beginPath();
  ctx.strokeStyle = strokeColor;
  ctx.fillStyle = fillColor;

  // x += w;
  // y += hCenter;

  ctx.moveTo(x + p1.x, y + p1.y);
  ctx.lineTo(x + p2.x, y + p2.y);
  ctx.lineTo(x + p3.x, y + p3.y);
  ctx.closePath();

  ctx.stroke();
  ctx.fill();
}

export function drawArrow(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  alpha: number,
  strokeColor: string | CanvasGradient | CanvasPattern,
  fillColor: string | CanvasGradient | CanvasPattern): void {
  let asin = Math.sin(alpha);
  let acos = Math.cos(alpha);

  let hCenter = h * .5;
  //      p1
  //      / 
  // p2  . 
  //      \ 
  //      p3
  let p1 = rotate(w, -hCenter, asin, acos);
  let p2 = { x: 0, y: 0 }; // anchor
  let p3 = rotate(w, hCenter, asin, acos);

  ctx.beginPath();
  ctx.strokeStyle = strokeColor;
  ctx.fillStyle = fillColor;

  // x += w;
  // y += hCenter;

  ctx.moveTo(x + p1.x, y + p1.y);
  ctx.lineTo(x + p2.x, y + p2.y);
  ctx.lineTo(x + p3.x, y + p3.y);

  ctx.stroke();
}

function rotate(x: number, y: number, alphaSin: number, alphaCos: number): { x: number, y: number; } {
  return {
    x: (x * alphaCos) - (y * alphaSin),
    y: (x * alphaSin) + (y * alphaCos)
  };
}


export function fillContainment(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  alpha: number,
  strokeColor: string | CanvasGradient | CanvasPattern,
  fillColor: string | CanvasGradient | CanvasPattern): void {
  let asin = Math.sin(alpha);
  let acos = Math.cos(alpha);

  let hCenter = h * .5;
  let wCenter = w * .5;
  //      p1               p1 origion
  //      /|\
  // p3  --|-- p4
  //      \|/
  //      p2
  let p1 = { x: 0, y: 0 };
  let p2 = rotate(w, 0, asin, acos);

  let p3 = rotate(wCenter, hCenter, asin, acos);
  let p4 = rotate(wCenter, -hCenter, asin, acos);

  let r1 = rotate(wCenter, 0, asin, acos);

  ctx.beginPath();
  ctx.strokeStyle = strokeColor;
  ctx.fillStyle = fillColor;

  // x += w;
  // y += hCenter;

  ctx.arc(x + r1.x, y + r1.y, hCenter, 0, Math2.RAD360);
  ctx.stroke();
  ctx.fill();

  ctx.moveTo(x + p1.x, y + p1.y);
  ctx.lineTo(x + p2.x, y + p2.y);

  ctx.moveTo(x + p3.x, y + p3.y);
  ctx.lineTo(x + p4.x, y + p4.y);
  ctx.closePath();

  ctx.stroke();
}

export function fillCrystal(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  alpha: number,
  strokeColor: string | CanvasGradient | CanvasPattern,
  fillColor: string | CanvasGradient | CanvasPattern): void {
  let asin = Math.sin(alpha);
  let acos = Math.cos(alpha);

  let hCenter = h * .3;
  let wCenter = w * .5;
  //      p1               p1 origion
  //      /\
  // p3  :  : p4
  //      \/
  //      p2
  let p3 = { x: 0, y: 0 };
  let p1 = rotate(wCenter, hCenter, asin, acos);
  let p4 = rotate(w, 0, asin, acos);
  let p2 = rotate(wCenter, -hCenter, asin, acos);

  ctx.beginPath();
  ctx.strokeStyle = strokeColor;
  ctx.fillStyle = fillColor;

  // x += w;
  // y += hCenter;
  ctx.moveTo(x + p3.x, y + p3.y);
  ctx.lineTo(x + p1.x, y + p1.y);
  ctx.lineTo(x + p4.x, y + p4.y);
  ctx.lineTo(x + p2.x, y + p2.y);
  ctx.closePath();

  ctx.stroke();
  ctx.fill();

}

export function drawNone(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  alpha: number,
  strokeColor: string | CanvasGradient | CanvasPattern,
  fillColor: string | CanvasGradient | CanvasPattern): void { }

export function strokeRectangle(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  color: string | CanvasGradient | CanvasPattern): void {
  ctx.strokeStyle = color;
  ctx.strokeRect(x, y, w, h);
}

export function drawLine(
  ctx: CanvasRenderingContext2D,
  xStart: number, yStart: number,
  xEnd: number, yEnd: number,
  lineWidth: number,
  color: string | CanvasGradient | CanvasPattern) {
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.moveTo(xStart, yStart);
  ctx.lineTo(xEnd, yEnd);
  ctx.stroke();

  // reset
  ctx.lineWidth = 1;
}

export function drawDotLine(
  ctx: CanvasRenderingContext2D,
  xStart: number, yStart: number,
  xEnd: number, yEnd: number,
  lineWidth: number,
  color: string | CanvasGradient | CanvasPattern) {
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.setLineDash([8, 4]);
  ctx.moveTo(xStart, yStart);
  ctx.lineTo(xEnd, yEnd);
  ctx.stroke();

  // reset
  ctx.lineWidth = 1;
  ctx.setLineDash([]);
}

