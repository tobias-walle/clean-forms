export type Errors<Model> = {
  [key in keyof Model]?: string | Errors<Model[key]>;
};
