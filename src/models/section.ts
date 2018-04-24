import { IWorkHistory } from './workHistory'

/* tslint:disable-next-line:interface-name */
export interface Section {
  title: DocElement;
  style: string;
  items: DocElement[];
  positions: IWorkHistory[];
}
export interface IDocElement {
  text: string;
  element: string;
  className: string;
  preprocess: string;
}
export class DocElement implements IDocElement {
  public text: string;
  public element: string;
  public className: string;
  public preprocess: string;  // This is why I like the idea of jsonschema being involved... can say no extra properties that get missed

  constructor(data: string | IDocElement) {
    if (typeof(data) === "string") {
      this.text = data;
    } else {
      // Basically cast to this then...
      this.text = data.text;
      this.element = data.element;
      this.preprocess = data.preprocess;
    }
  }
}