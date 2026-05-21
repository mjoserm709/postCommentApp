import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'humanizeDate',
  standalone: true,
})
export class HumanizeDatePipe implements PipeTransform {
  transform(value?: string | Date): string {
    if (!value) {
      return 'sin fecha';
    }

    const date = new Date(value);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (Number.isNaN(seconds)) {
      return 'sin fecha';
    }

    if (seconds < 60) {
      return 'hace un momento';
    }

    const units = [
      { label: 'ano', plural: 'anos', seconds: 31536000 },
      { label: 'mes', plural: 'meses', seconds: 2592000 },
      { label: 'dia', plural: 'dias', seconds: 86400 },
      { label: 'hora', plural: 'horas', seconds: 3600 },
      { label: 'minuto', plural: 'minutos', seconds: 60 },
    ];

    const unit = units.find((item) => seconds >= item.seconds)!;
    const amount = Math.floor(seconds / unit.seconds);
    return `hace ${amount} ${amount === 1 ? unit.label : unit.plural}`;
  }
}
