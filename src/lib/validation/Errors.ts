export type Errors<Model> = {
  [key in keyof Model]?: null | string | Errors<Model[key]>;
}
