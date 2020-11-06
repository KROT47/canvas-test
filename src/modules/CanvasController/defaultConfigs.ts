export type DefaultConfigsType = {
  drawImage: {
    x?: number;
    y?: number;
    w?: number;
    h?: number;
    sizeRatio?: number;
  };
};

const DefaultConfigs: DefaultConfigsType = {
  drawImage: {
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    sizeRatio: 1,
  },
};

export function getConfig<
  T extends keyof DefaultConfigsType,
  C = DefaultConfigsType[T]
>(configKey: T, userConfig: C): C {
  return {
    ...DefaultConfigs[configKey],
    ...userConfig,
  };
}
