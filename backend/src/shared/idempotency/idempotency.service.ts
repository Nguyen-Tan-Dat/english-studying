export class IdempotencyService {
  private readonly values = new Map<string, unknown>();
  get<T>(key: string): T | undefined { return this.values.get(key) as T | undefined; }
  set(key: string, value: unknown) { this.values.set(key, value); }
}
