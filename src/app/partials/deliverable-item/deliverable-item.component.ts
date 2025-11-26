import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {faFolder} from "@fortawesome/free-solid-svg-icons";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {PhaseService} from "../../@core/service/phase.service";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-deliverable-item',
  standalone: true,
  imports: [
    FaIconComponent
  ],
  templateUrl: './deliverable-item.component.html',
  styleUrl: './deliverable-item.component.scss'
})
export class DeliverableItemComponent implements OnChanges, OnInit {
  @Input()
  deliverable: any;

  @Input() selected: boolean = false;

  @Output() onSelected = new EventEmitter<any>();

  constructor(
    private deliverableService: PhaseService,
    private toastr: ToastrService
  ) {}

  protected readonly faFolder = faFolder;

  ngOnInit(){

  }

  handleSelect() {
    this.onSelected.emit(this.deliverable);
  }

  ngOnChanges(changes: SimpleChanges): void {
  }
}
