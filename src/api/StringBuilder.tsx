export interface IStringBuilder { 
    write(line:string): StringBuilder;
    newline(): StringBuilder;
    writeln(line:string): StringBuilder;
    asString(): string;
}

export class StringBuilder {
    private _lines: string[] = [];
  
    write(line: string = ""): StringBuilder {
      this._lines.push(line);
      return this;
    }
  
    newline(): StringBuilder {
      this._lines.push("\n");
      return this;
    }
  
    writeln(line: string = ""): StringBuilder {
      this._lines.push(line);
      this._lines.push("\n");
      return this;
    }
  
    toString(): string {
      return this._lines.join("");
    }
}