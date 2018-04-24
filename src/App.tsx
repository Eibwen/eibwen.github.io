import * as React from 'react';
import './App.css';
import { process } from './data-processor';
import resumeData from './data/resumeData.json';
import { DocElement, Section } from './models/section'
import { IWorkHistory } from './models/workHistory'

import logo from './logo.svg';

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



        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
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
    const style = section.style || 'paragraph';
    const items = section.items || [];
    const positions = section.positions || [];

    const itemsElements = style === 'paragraph'
      ? this.renderItemsParagraph(items)
      : this.renderItemsBullets(items);

    return (
      <div>
        {this.renderElement(section.title)}
        {itemsElements}
        {this.renderWorkHistory(positions)}
      </div>
    );
  }
  private renderElement(ele: DocElement, Parent: string = 'div'): JSX.Element {
    const EleTag = ele.element || 'div';
    let text = ele.text;
    let rendered = null;
    const preprocess = ele.preprocess || null;

    if (preprocess === 'markdown') {
      // TODO import and use a markdown renderer...
      // text = 'markdown:' + text;

      const parsed = this.manualMarkdownLinkParser(text);
      text = parsed[0];
      rendered = parsed[1];
    } else if (preprocess === null) {
      // Do nothing extra
    } else {
      // default case, of unrecognized
      throw new Error('Unrecognized preprocess type: ' + preprocess);
    }

    const clsName = ele.className ? ele.className + ' ' : '';
    const cls = clsName + text.replace(/ /g, '-')
                    .replace(/[^\w-]/g, '')
                    .toLowerCase()
                    .substring(0, 50);

    return (
      <Parent className={cls}>
        <EleTag>
          {text}
          {rendered}
        </EleTag>
      </Parent>
    );

    // //TODO is this really how to do this??? Need to find dynamic creation
    // switch (eleTag) {
    //   case null:
    //     break;
    //   case 'h1':
    //     text = <h1>{text}</h1>;
    // }

    // var output = null;
    // switch (parent) {
    //   case 'div':
    //     output = <div>{text}</div>;
    //     break;
    //   case 'li':
    //     output = <li>{text}</li>;
    //     break;
    //   default:
    //     throw new Error('Unknown parent element: ' + parent);
    // }

    // return output;
  }
  private manualMarkdownLinkParser(text: string) : [string, JSX.Element|null] {
    // text = text.replace(/\[(.+?)\]\((.+?)\)/g, "<a href=\"$2\">$1</a>");
    const matches = /(^.*?)\[(.+?)\]\((.+?)\)(.*?$)/g.exec(text);
    if (matches) {
      const component = (<span>{matches[1]}<a href={matches[3]}>{matches[2]}</a>{matches[4]}</span>)
      return ['', component];
    }

    return ['TODO markdown:' + text, null];
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
