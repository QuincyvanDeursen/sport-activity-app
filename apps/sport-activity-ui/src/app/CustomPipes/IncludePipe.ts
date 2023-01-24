import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'includes',
  pure: true,
})
export class IncludesPipe<T> implements PipeTransform {
  transform(array: T[], item: T): boolean {
    return array.includes(item);
  }
}
