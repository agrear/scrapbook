export type RadioGroupContext = {
  name: string,
  group: any,
  onChange: (
    event: Event & { currentTarget: EventTarget & HTMLInputElement }
  ) => void
};

export const key = {};
