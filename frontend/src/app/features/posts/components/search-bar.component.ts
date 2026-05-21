import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  template: `
    <label class="search-shell">
      <span>Buscar</span>
      <input
        class="form-control"
        [value]="value"
        (input)="valueChange.emit(($any($event.target).value ?? '').toString())"
        placeholder="Busca por titulo, resumen o tag"
      >
    </label>
  `,
  styles: [`
    .search-shell {
      display: grid;
      gap: 8px;
    }

    span {
      color: #475569;
      font-size: 0.85rem;
      font-weight: 800;
      text-transform: uppercase;
    }
  `],
})
export class SearchBarComponent {
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();
}
