/** Live iframes on the stage, so tools (postMessage tester) can reach them. */
const frames = new Map<string, HTMLIFrameElement>();

export const registerFrame = (label: string, el: HTMLIFrameElement | null) => {
  if (el) frames.set(label, el);
  else frames.delete(label);
};

export const liveFrames = () => [...frames.entries()];

/** Pending "resize after load" experiment: the height to grow to once the frame loads. */
let pendingGrow: number | null = null;
export const armGrowAfterLoad = (height: number) => {
  pendingGrow = height;
};
export const takeGrowAfterLoad = () => {
  const h = pendingGrow;
  pendingGrow = null;
  return h;
};
