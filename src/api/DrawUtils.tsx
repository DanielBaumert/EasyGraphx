export type Point = { 
    x:number;
    y:number;
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

export function drawTextHLeft(
    ctx: CanvasRenderingContext2D, 
    xBox: number, yBox: number, 
    xPadding: number, 
    text: ITextBlock<string|SingleTextBlock[]>, 
    color: string|CanvasGradient|CanvasPattern): void
{
    ctx.fillStyle = color;
    if(text instanceof SingleTextBlock ) { 
        ctx.fillText(text.value, xBox+ (xPadding / 2), yBox  + text.baseline);
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

    constructor(value:string, baseline:number, width:number, height:number) { 
        this.value = value;
        this.baseline = baseline;
        this.width = width;
        this.height = height;
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

export function mesureText(ctx:CanvasRenderingContext2D, value:string) : ITextBlock<string|SingleTextBlock[]> { 
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
    ctx.fillStyle = strokeColor;
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

export function strokeRectangle(
    ctx:CanvasRenderingContext2D, 
    x: number, y: number, 
    w: number, h: number, 
    color: string|CanvasGradient|CanvasPattern) : void
{
    ctx.fillStyle = color;
    ctx.strokeRect(x, y, w, h);
}