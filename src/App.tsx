import * as React from 'react';
import './App.css';
import { process } from './data-processor';
import resumeData from './data/resumeData.json';
import { DocElement, Section } from './models/section'
import { IWorkHistory } from './models/workHistory'

/* tslint:disable-next-line:no-empty-interface */
interface IProps {
}
interface IState {
  document: Section[];
}
class App extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    
    this.state = {
      document: Array.from(process(resumeData)) || []
    };

    // this.methodNeedingBind = this.methodNeedingBind.bind(this);
    this.buildSection = this.buildSection.bind(this);
  }

  public render() {

    return (
      <div className="App">


        {this.buildSections()}


      </div>
    );
  }

  private buildSections() {
    const sections = this.state.document
            ? this.state.document.map(this.buildSection)
            : null;

    return (
      <div>
        {sections}
      </div>
    );
  }
  private buildSection(section: Section): JSX.Element {
    const noPrint = section.noPrint;
    const style = section.style || 'paragraph';
    const items = section.items || [];
    const positions = section.positions || [];

    const itemsElements = style === 'paragraph'
      ? this.renderItemsParagraph(items)
      : this.renderItemsBullets(items);

    return (
      <div className={noPrint ? "no-print" : undefined}>
        {this.renderElement(section.title)}
        {itemsElements}
        {this.renderWorkHistory(positions)}
      </div>
    );
  }
  private renderElement(ele: DocElement, Parent: string = 'div'): JSX.Element {
    const EleTag = ele.element;
    const text = ele.text;
    let rendered = null;
    const preprocess = ele.preprocess || null;

    const wrapInParent = (child: JSX.Element | string) => {
      // const clsName = ele.className ? ele.className + ' ' : '';
      const slugified = text.replace(/ /g, '-')
                            .replace(/[^\w-]/g, '')
                            .toLowerCase()
                            .substring(0, 50);
      const classArray = [ele.className, slugified];
      if (ele.noPrint) {
        classArray.push("no-print");
      }

      return (
        <Parent className={classArray.filter(x => x).join(" ")}>
          {child}
        </Parent>
      );
    };

    if (preprocess === 'markdown') {
      // TODO import and use a markdown renderer...
      // text = 'markdown:' + text;

      const markdown = this.replaceMarkdownLinksWithComponents(text, EleTag || 'span') as JSX.Element;
      rendered = wrapInParent(markdown);
    } else if (preprocess === null) {
      // Do nothing extra
      rendered = (EleTag ? wrapInParent(<EleTag>{text}</EleTag>) : wrapInParent(text));
    } else {
      // default case, of unrecognized
      throw new Error('Unrecognized preprocess type: ' + preprocess);
    }

    return rendered;
  }
  private replaceMarkdownLinksWithComponents(text: string, EleTag: string) : JSX.Element | null {
    if (!text) {
      return null;
    }
    const matches = /(^.*?)\[(.+?)\]\((.+?)\)(.*?$)/g.exec(text);
    let component = (<EleTag>{text}</EleTag>);

    if (matches) {
      component = (<EleTag>{matches[1]}<a href={matches[3]}>{matches[2]}</a>{this.replaceMarkdownLinksWithComponents(matches[4], 'span')}</EleTag>);
    }
    return component;
  }
  private renderItemsParagraph(items: DocElement[]): JSX.Element {
    const renderedItems = items.map(x => this.renderElement(x));

    return (
      <div className={"paragraph"}>
      {renderedItems}
      </div>
    );
  }
  private renderItemsBullets(items: DocElement[]): JSX.Element {
    const renderedItems = items.map(x => this.renderElement(x, 'li'));

    return (
      <ul>
      {renderedItems}
      </ul>
    );
  }
  private renderWorkHistory(history: IWorkHistory[]): JSX.Element | null {
    // throw new Error("Method not implemented.");
    // TODO build this
    return (history && history.length > 0)
              ? <div>TODO need to implement the renderWorkHistory method, see <a href='/data/resumeData.json'>/data/resumeData.json?</a></div>
              : null;
  }
}

export default App;
