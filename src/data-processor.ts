// <reference path='models/workHistory.ts'/>
import sectionParse from './models/importingSections';
import { Section } from './models/section'


export function* process(data: any[]): IterableIterator<Section> {
  // Basically just try casting the input array to be typed
  //   Slight data processing in the creator method
  for (const item of data) {
    yield sectionParse(item)
  }
}
