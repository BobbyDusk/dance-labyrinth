export class Observable {
  private observers: Array<(data?: any) => void> = [];

  subscribe(observer: (data?: any) => void): void {
    this.observers.push(observer);
  }

  unsubscribe(observer: (data?: any) => void): void {
    this.observers = this.observers.filter(obs => obs !== observer);
  }

  notify(data?: any): void {
    this.observers.forEach(observer => observer(data));
  }
}

export class StaticObservable {
  private static observers: Array<(data?: any) => void> = [];

  static subscribe(observer: (data?: any) => void): void {
    StaticObservable.observers.push(observer);
  }

  static unsubscribe(observer: (data?: any) => void): void {
    StaticObservable.observers = StaticObservable.observers.filter(obs => obs !== observer);
  }

  static notify(data?: any): void {
    StaticObservable.observers.forEach(observer => observer(data));
  }

}
