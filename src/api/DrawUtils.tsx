export const HALF_CIRCLE = Math.PI
export const FULL_CIRCLE = 2 * Math.PI

export type Point = { 
    x:number;
    y:number;
}

export type TextDecoration = { 
    underline:boolean
}

export function drawTextHCenter(
    ctx: CanvasRenderingContext2D, 
    xBox: number, yBox: number, 
    wBox: number,
    xPadding: number, 
    text: ITextBlock<string|SingleTextBlock[]>, 
    color: string|CanvasGradient|CanvasPattern): void
{
    ctx.fillStyle = color;
    if(text instanceof SingleTextBlock ) { 
        var xCenter = xBox  + (xPadding / 2) + (wBox - text.width - xPadding) / 2;
        ctx.fillText(text.value, xCenter, yBox + text.baseline);
    } 
    else if(text instanceof MultiTextBlock) 
    { 
        for(var singleRow of text.value){ 
            var xCenter = xBox  + (xPadding / 2) + (wBox - singleRow.width - xPadding) / 2;
            ctx.fillText(singleRow.value, xCenter, yBox + singleRow.baseline);
            yBox += singleRow.height;
        }
    }
}

// draw text left alignt
export function drawTextHLeft(
    ctx: CanvasRenderingContext2D, 
    xBox: number, yBox: number, 
    xPadding: number, 
    text: ITextBlock<string|SingleTextBlock[]>, 
    color: string|CanvasGradient|CanvasPattern): void
{
    ctx.fillStyle = color;
    if(text instanceof SingleTextBlock ) { 
        var xText = xBox + (xPadding / 2);
        var yText = yBox + text.baseline;
        ctx.fillText(text.value, xText, yText);
        if(text.decoration.underline){ 
            console.log("static");
            ctx.strokeRect(xText, yText + 2, text.width, .5);
        }
    } 
    else if(text instanceof MultiTextBlock) 
    { 
        for(var singleRow of text.value){ 
            ctx.fillText(singleRow.value, xBox + xPadding, yBox + singleRow.baseline);
            yBox += singleRow.height;
        }
    }
}

export interface ITextBlock<T> {
    value: T; 
    width:number;
    height: number;
}

export class SingleTextBlock implements ITextBlock<string> {
    value: string;
    baseline: number;
    width: number;
    height: number;
    decoration: TextDecoration;

    constructor(value:string, baseline:number, width:number, height:number) { 
        this.value = value;
        this.baseline = baseline;
        this.width = width;
        this.height = height;
        this.decoration = {underline:false};
    }
}

export class MultiTextBlock implements ITextBlock<SingleTextBlock[]> { 
    value:SingleTextBlock[];
    baseline: number;
    width:number;
    height: number;

    constructor(value:SingleTextBlock[], width:number, height:number) { 
        this.value = value;
        this.width = width;
        this.height = height;
    }
}

export function measureText(ctx:CanvasRenderingContext2D, value:string) : MultiTextBlock|SingleTextBlock { 
    if (value.includes("\n")) {
        var drawableRows = [];
        var width = 0;
        var height = 0;

        var rows = value.split('\n');
        for (var row of rows) {
            var rowMesure = ctx.measureText(row);
            var rowHeight = rowMesure.fontBoundingBoxAscent + rowMesure.fontBoundingBoxDescent;
            
            drawableRows.push(new SingleTextBlock(row, rowMesure.fontBoundingBoxAscent, rowMesure.width, rowHeight));

            width = Math.max(width, rowMesure.width);
            height += rowHeight;
        }

        return new MultiTextBlock(drawableRows, width, height);
    }


    var textMesure = ctx.measureText(value);
    var textHeight = textMesure.fontBoundingBoxAscent + textMesure.fontBoundingBoxDescent;
    return new SingleTextBlock(value, textMesure.fontBoundingBoxAscent, textMesure.width, textHeight);
}

export function drawRectangle( 
    ctx:CanvasRenderingContext2D, 
    x: number, y: number, 
    w: number, h: number, 
    strokeColor: string|CanvasGradient|CanvasPattern,
    fillColor: string|CanvasGradient|CanvasPattern) : void
{
    ctx.strokeStyle = strokeColor;
    ctx.strokeRect(x, y, w, h);

    ctx.fillStyle = fillColor;
    ctx.fillRect(x, y, w, h);
}

export function fillRectangle(
    ctx:CanvasRenderingContext2D, 
    x: number, y: number, 
    w: number, h: number, 
    color: string|CanvasGradient|CanvasPattern) : void
{
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

export function fillTriangle(
    ctx: CanvasRenderingContext2D,
    x: number, y: number,
    w: number, h: number,
    alpha: number,
    strokeColor: string|CanvasGradient|CanvasPattern,
    fillColor: string|CanvasGradient|CanvasPattern) : void
{ 
    let asin = Math.sin(alpha);
    let acos = Math.cos(alpha);
    
    let hCenter = h * .5;
    //      p1
    //      /|
    // p2  . |
    //      \|
    //      p3
    let p1 = rotate(w, -hCenter, asin, acos);
    let p2 = {x: 0, y: 0}; // anchor
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
    strokeColor: string|CanvasGradient|CanvasPattern,
    fillColor: string|CanvasGradient|CanvasPattern) : void
{ 
    let asin = Math.sin(alpha);
    let acos = Math.cos(alpha);
    
    let hCenter = h * .5;
    //      p1
    //      / 
    // p2  . 
    //      \ 
    //      p3
    let p1 = rotate(w, -hCenter, asin, acos);
    let p2 = {x: 0, y: 0}; // anchor
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

function rotate(x: number, y: number, alphaSin: number, alphaCos: number) : {x: number, y: number}
{ 
    return { 
        x: (x * alphaCos) - (y * alphaSin),
        y: (x * alphaSin) + (y * alphaCos)
    }
}


export function fillContainment(
    ctx: CanvasRenderingContext2D,
    x: number, y: number,
    w: number, h: number,
    alpha: number,
    strokeColor: string|CanvasGradient|CanvasPattern,
    fillColor: string|CanvasGradient|CanvasPattern) : void
{ 
    let asin = Math.sin(alpha);
    let acos = Math.cos(alpha);
    
    let hCenter = h * .5;
    let wCenter = w * .5;
    //      p1               p1 origion
    //      /|\
    // p3  --|-- p4
    //      \|/
    //      p2
    let p1 = {x: 0, y: 0};
    let p2 = rotate(w, 0, asin, acos);

    let p3 = rotate(wCenter, hCenter, asin, acos);
    let p4 = rotate(wCenter, -hCenter, asin, acos);

    let r1 = rotate(wCenter, 0, asin, acos);

    ctx.beginPath();
    ctx.strokeStyle = strokeColor;
    ctx.fillStyle = fillColor;

    // x += w;
    // y += hCenter;
    
    ctx.arc(x + r1.x, y + r1.y, hCenter, 0, FULL_CIRCLE);
    ctx.stroke();
    ctx.fill();

    ctx.moveTo(x + p1.x, y + p1.y);
    ctx.lineTo(x + p2.x, y + p2.y);

    ctx.moveTo(x + p3.x, y + p3.y);
    ctx.lineTo(x + p4.x, y + p4.y);
    ctx.closePath();

    ctx.stroke();
}

export function fillKristal(
    ctx: CanvasRenderingContext2D,
    x: number, y: number,
    w: number, h: number,
    alpha: number,
    strokeColor: string|CanvasGradient|CanvasPattern,
    fillColor: string|CanvasGradient|CanvasPattern) : void
{ 
    let asin = Math.sin(alpha);
    let acos = Math.cos(alpha);
    
    let hCenter = h * .3;
    let wCenter = w * .5;
    //      p1               p1 origion
    //      /\
    // p3  :  : p4
    //      \/
    //      p2
    let p3 = {x: 0, y: 0};
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
    strokeColor: string|CanvasGradient|CanvasPattern,
    fillColor: string|CanvasGradient|CanvasPattern) : void
{ }

export function strokeRectangle(
    ctx:CanvasRenderingContext2D, 
    x: number, y: number, 
    w: number, h: number, 
    color: string|CanvasGradient|CanvasPattern) : void
{
    ctx.strokeStyle = color;
    ctx.strokeRect(x, y, w, h);
}

export function drawLine(
    ctx:CanvasRenderingContext2D, 
    xStart: number, yStart: number, 
    xEnd: number, yEnd: number, 
    lineWidth: number,
    color: string|CanvasGradient|CanvasPattern) 
{ 
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
    ctx:CanvasRenderingContext2D, 
    xStart: number, yStart: number, 
    xEnd: number, yEnd: number, 
    lineWidth: number,
    color: string|CanvasGradient|CanvasPattern) 
{ 
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

