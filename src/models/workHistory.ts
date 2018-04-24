import { IDocElement } from './section'

export interface IWorkHistory {
  name: string;
  position: string;
  location: string;
  start: string;
  end: string;
  description: Array<IDocElement | string>;
}