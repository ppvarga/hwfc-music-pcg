import { HigherValues } from "./HigherValues"

export type Grabber<T> = {
  grab: (higherValues: HigherValues) => T;
  configText: () => string;
}