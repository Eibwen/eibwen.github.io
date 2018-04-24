import { DocElement, IDocElement, Section } from './section'
import { IWorkHistory } from './workHistory'

interface ISectionTransform {
  title: IDocElement | string;
  noPrint: boolean;
  style: string;
  items: Array<IDocElement | string>;
  positions: IWorkHistory[];
}

const SECTION_PARSE = (data: ISectionTransform): Section => {
  if (typeof(data) !== 'object') {
    throw new Error("Only able to parse from JS Objects, found: " + typeof(data));
  }

  const output = {} as Section

  output.title = new DocElement(data.title);
  output.noPrint = data.noPrint || false;
  output.style = data.style;
  output.items = data.items
                ? data.items.map(x => new DocElement(x))
                : [];
  output.positions = data.positions;

  return output;
};

export default SECTION_PARSE;