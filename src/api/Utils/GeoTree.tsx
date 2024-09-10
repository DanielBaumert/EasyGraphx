
interface Dictionary<T> {
  [key: number]: T;
}
const ring3 = [3,1,2];
const lookUp : Dictionary<{x: Number, y: number}> = {
  1: {x:1, y:1},
  2: {x:1, y:2},
  3: {x:1, y:3},
  4: {x:2, y:1},
  5: {x:2, y:2},
  6: {x:2, y:3},
  7: {x:3, y:1},
  8: {x:3, y:2},
  9: {x:3, y:3}
};




