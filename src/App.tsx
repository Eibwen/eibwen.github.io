import * as React from 'react';
import './App.css';
import { process } from './data-processor';
import resumeData from './data/resumeData.json';
import { DocElement, IDocElement, Section } from './models/section'
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
      <div key={this.slugifyString(section.title.text)} className={noPrint ? "no-print" : undefined}>
        {this.renderElement(section.title)}
        {itemsElements}
        {this.renderWorkHistory(positions)}
      </div>
    );
  }
  private slugifyString(text: string): string {
    return text.replace(/ /g, '-')
              .replace(/[^\w-]/g, '')
              .toLowerCase()
              .substring(0, 50);
  }
  private renderElement(ele: IDocElement, Parent: string = 'div'): JSX.Element {
    const EleTag = ele.element;
    const text = ele.text;
    let rendered = null;
    const preprocess = ele.preprocess || null;

    const wrapInParent = (child: JSX.Element | string) => {
      // const clsName = ele.className ? ele.className + ' ' : '';
      const slugified = this.slugifyString(text);
      const classArray = [ele.className, slugified];
      if (ele.noPrint) {
        classArray.push("no-print");
      }

      return (
        <Parent id={slugified} key={slugified} className={classArray.filter(x => x).join(" ")}>
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
  private renderItemsParagraph(items: DocElement[]): JSX.Element | null {
    if (!items || items.length === 0) {
      return null;
    }
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
  private renderWorkHistory(history: IWorkHistory[]): JSX.Element[] | null {
    if (!history || history.length === 0) {
      return null;
    }

    // TODO do I want the company names even larger?
    const workHistoryComponents = history.map(x => (
      <div key={this.slugifyString(x.name)}>
        <h4>{x.name} {this.buildLocation(x)} {this.buildTenure(x)}</h4>
        <div className='job-position'>{x.position}</div>
        {this.buildJobDescription(x)}
      </div>
    ));

    return workHistoryComponents;
  }
  private buildLocation(x: IWorkHistory) : JSX.Element {
    return (<span className='minor-detail job-location'>{x.location}</span>);
  }
  private buildTenure(x: IWorkHistory) : JSX.Element {
    
    const startDate = new Date(x.start);
    const endDate = x.end ? new Date(x.end) : new Date();
    const msWorkingThere = endDate.getTime() - startDate.valueOf();

    return (
      <span className='minor-detail tenure' title={this.humanizeYearsMonths(msWorkingThere)}>{x.start} - {x.end}</span>
    );
  }
  private buildJobDescription(history: IWorkHistory) : JSX.Element[] {
    const items = history.description;
    if (!items || items.length === 0) {
      return [];
    }
    return items.map(x => this.renderElement(new DocElement(x)));
  }
  private humanizeYearsMonths(msTimespan: number) : string {
    const dayInMs = 24 * 60 *60 * 1000;
    const monthInMs = dayInMs * 30;
    const yearInMs = dayInMs * 365.25;

    const years = Math.floor(msTimespan / yearInMs);
    const monthsRaw = (msTimespan % yearInMs) / monthInMs;
    // Basically going to assume inclusive range... and only adding .25 instead of .5, idk
    //  TODO unit test to figure out if this is the behavior we want
    const months = Math.ceil(monthsRaw + 0.25);

    return years + " yrs " + months + " mos";
  }
}

export default App;
