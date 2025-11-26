import {Component, forwardRef, Input, OnInit} from '@angular/core';
import {UserService} from "../../@core/service/user.service";
import {faUser} from "@fortawesome/free-solid-svg-icons";
import {BadgeModule} from "primeng/badge";
import {DropdownModule} from "primeng/dropdown";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {InputTextModule} from "primeng/inputtext";
import {PrimeTemplate} from "primeng/api";
import {FormsModule, NG_VALUE_ACCESSOR} from "@angular/forms";

@Component({
  selector: 'app-user-filter',
  standalone: true,
  imports: [
    BadgeModule,
    DropdownModule,
    FaIconComponent,
    InputTextModule,
    PrimeTemplate,
    FormsModule
  ],
  templateUrl: './user-filter.component.html',
  styleUrl: './user-filter.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UserFilterComponent),
      multi: true
    }
  ]
})
export class UserFilterComponent implements OnInit{

  @Input() optionLabel: string = '';
  @Input() optionValue: string = '';

  value: string = '';
  disabled: boolean = false;
  touched: boolean = false;

  protected readonly faUser = faUser;
  users: any[] = [];

  constructor(
    private us: UserService
  ) {}

  ngOnInit(): void {
  }

  handleFilter($event: any) {
    this.findUser($event.target.value);
  }

  private findUser(query: string) {
    this.us.searchUserFromLdap(query).subscribe({
      next: (data: any) => {
        this.users = data;
      }
    });
  }

  // Function to call when the input changes
  onChange = (value: string) => {};

  // Function to call when the input is touched
  onTouched = () => {};

  // Write value to the element
  writeValue(value: string): void {
    this.value = value;
  }

  // Register callback function that should be triggered when value changes
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  // Register callback function that should be triggered when input is touched
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  // Sets the disabled state
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // Handle blur events
  onBlur(): void {
    if (!this.touched) {
      this.touched = true;
      this.onTouched();
    }
  }

  onDropdownChange($event: any): void {
    this.value = $event.value;
    this.onChange(this.value);
  }
}
