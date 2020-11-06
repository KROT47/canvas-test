export const loadImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.src = url;

    image.onload = () => resolve(image);
    image.onerror = () => reject(`Can not load image '${url}'`);
  });

export const debounce = (
  f: (...args: Array<any>) => void,
  ms: number
): (() => void) => {
  let isCooldown = false;

  return function () {
    if (isCooldown) return;

    // @ts-ignore
    f.apply(this, arguments);

    isCooldown = true;

    setTimeout(() => (isCooldown = false), ms);
  };
};
