
enum ContextOpenMode {
  Default   = 0,
  MirroredX = 1 << 0,
  MirroredY = 1 << 1,
  Mirrored = MirroredY | MirroredX
}

export default ContextOpenMode;
