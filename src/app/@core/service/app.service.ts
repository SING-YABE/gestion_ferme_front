import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AppService {

  public title: BehaviorSubject<string> = new BehaviorSubject<string>('Tableau de bord');
  public hideHeader: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor() { }

  setTitle(title: string){
    setTimeout(() => {
      this.title.next(title);
    }, 100);
  }

  setHideHeader(bool: boolean = true){
    setTimeout(() => {
      this.hideHeader.next(bool);
    }, 10);
  }

  getDate(date: string): Date {
    const [day,month,year] = date.split('/').map(Number);
    return new Date(year, month - 1, day);
  }

  excelDateToJSDate(serial: number) {
    const excelEpoch = new Date(1900, 0, 0);
    return new Date(excelEpoch.getTime() + (serial - 1) * 86400000);
  }
}
