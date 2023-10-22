export var changingsObserved: boolean = true;

var endUpdateViewCalls : VoidFunction[] = [];

export function startUpdateView(afterEnd: VoidFunction = undefined) {
    console.log("startUpdateView");
    endUpdateViewCalls.push(afterEnd);
    changingsObserved = true;
}

export function getUpdateViewState() {
    return changingsObserved;
}

export function endUpdateView() {
    console.log("endUpdateView")
    changingsObserved = false;

    var call : VoidFunction = undefined;
    while((call = endUpdateViewCalls.pop()) !== undefined){
        call();
    }
}