import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

interface RuntimeConfig {
  apiBaseUrl?: string;
}

@Injectable({
  providedIn: 'root',
})
export class RuntimeConfigService {
  private config: RuntimeConfig = {
    apiBaseUrl: environment.apiBaseUrl,
  };

  async load(): Promise<void> {
    try {
      const response = await fetch('/app-config.json', { cache: 'no-store' });
      if (!response.ok) {
        return;
      }

      const runtimeConfig = (await response.json()) as RuntimeConfig;
      this.config = { ...this.config, ...runtimeConfig };
    } catch {
      // Keep environment defaults when runtime config is unavailable.
    }
  }

  get apiBaseUrl(): string {
    return this.config.apiBaseUrl ?? environment.apiBaseUrl;
  }
}
