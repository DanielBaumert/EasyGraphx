export var changingsObserved: boolean = true;

var endUpdateViewCalls: VoidFunction[] = [];

export function startUpdateView(afterEnd: VoidFunction = undefined) {
  endUpdateViewCalls.push(afterEnd);
  changingsObserved = true;
}

export function getUpdateViewState() {
  return changingsObserved;
}

export function endUpdateView() {
  changingsObserved = false;

  var call: VoidFunction = undefined;
  while ((call = endUpdateViewCalls.pop()) !== undefined) {
    call();
  }
}