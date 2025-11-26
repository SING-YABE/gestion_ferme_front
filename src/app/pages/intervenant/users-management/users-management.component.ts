import {Component, OnInit} from '@angular/core';
import {FlexModule} from "@angular/flex-layout";
import {InputTextModule} from "primeng/inputtext";
import {ConfirmationService, PrimeTemplate} from "primeng/api";
import {TableModule} from "primeng/table";
import {UserImporterComponent} from "./user-importer/user-importer.component";
import {UserService} from "../../../@core/service/user.service";
import {ToastrService} from "ngx-toastr";
import {UserEditorComponent} from "./user-editor/user-editor.component";
import {ButtonDirective} from "primeng/button";
import {AppService} from "../../../@core/service/app.service";
import {emptyPage, PageResponse} from "../../../@core/model/page-response.model";
import {CommonModule, DatePipe} from "@angular/common";
import { Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import {ConfirmDialogModule} from "primeng/confirmdialog";
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [
    FormsModule,
    FlexModule,
    InputTextModule,
    PrimeTemplate,
    TableModule,
    UserImporterComponent,
    ButtonDirective,
    DatePipe,
    DialogModule,
    CommonModule,
    ConfirmDialogModule,
    UserEditorComponent
],
  providers: [ConfirmationService],
  templateUrl: './users-management.component.html',
  styleUrl: './users-management.component.scss'
})
export class UsersManagementComponent implements OnInit{

  usersPage: PageResponse = emptyPage();
  pageSize = 10;
  loading = false;
  user: any;
  users: any[] = [];
  searchTerm: string = '';
  currentPageInfo : any;
  searchQuery: string = '';
  searchTimeout: any;
  
  selectedUser: any = null;
displayUserModal: boolean = false;
displayUserEditorModal: boolean = false;
searchSubject: Subject<string> = new Subject<string>();
  searchSubscription: Subscription | undefined;
  constructor(
    private us: UserService,
    private toastr: ToastrService,
    private as: AppService,
    private router: Router,
    private cs: ConfirmationService,
    private userService: UserService,

  ) {
  }



  ngOnInit(): void {
    this.as.setTitle("Intervenants / Utilisateurs");
    
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm = term;
      if (this.currentPageInfo) {
        this.currentPageInfo.first = 0;
      }
      this.loadData(0, this.pageSize);
    });
    
    this.loadData();
  }


 // recherche
//  onSearch() {
//   if (this.currentPageInfo) {
//     this.currentPageInfo.first = 0;
//   }
//   this.loadData(0, this.pageSize);
// }


loadData(page = 0, size = 10) {
  this.loading = true;
  this.us.getUsers(page, size, this.searchTerm).subscribe({
    next: (data: any) => {
      this.usersPage = data;
      this.loading = false;
    },
    error: err => {
      this.toastr.error(err.message);
      this.loading = false;
    }
  });
}

ngOnDestroy(): void {
  if (this.searchSubscription) {
    this.searchSubscription.unsubscribe();
  }
}

  paginate($event: any) {
    this.currentPageInfo = $event;
    this.pageSize = $event.rows;
    this.loadData($event.first / $event.rows, this.pageSize);
  }


  // showUserDetails(): void {
  //   this.router.navigate(['/user-details']);
  // }

  // showUserDetails(user: any) {
  //   console.log('Détails de l\'utilisateur sélectionné:', user); // Affiche les détails de l'utilisateur dans la console
  //   this.selectedUser = user;
  //   this.displayUserModal = true;
  // }

  showUserDetails(user: any) {
    console.log('Détails de l\'utilisateur sélectionné:', user);
    this.selectedUser = user;
    this.displayUserModal = true;
    console.log('Modal visible:', this.displayUserModal);  
  }

  handleDelete(template: any) {
    this.cs.confirm({
      header: 'Attention!',
      message: 'Voulez vous vraiment supprimer cet Utilisateur ?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui je confirme',
      rejectLabel: 'Non',
      defaultFocus: 'reject',
      acceptButtonStyleClass: 'p-button-danger outlined p-button-sm',
      rejectButtonStyleClass: 'p-button-sm mr-2',
      accept: () => {
        this.us.deleteById(template).subscribe({
          next: () => {
            this.toastr.success("Utilisateur supprimé avec succès !");
            this.loadData();
          },
          error: error => {
            this.toastr.error(error.error.message??error.message);
          }
        })
      },
      reject: () => {}
    })
  }


  // editUser(user: any){
  //   this.selectedUser = user; // Définit l'utilisateur à modifier
  //   console.log("Editer un utilisateur")
  //   console.log('Détails de l\'utilisateur sélectionné:', user);

  // }

  loadDataEdit(page = 0, size = 10) {

  }



// editUser(user: any) {
//   this.selectedUser = user;  // Définit l'utilisateur à modifier
//   this.displayUserEditorModal = true;  // Ouvre la boîte de dialogue

//   console.log(user)
// }

loadUsers() {
  this.loading = true;
  this.userService.getUsers().subscribe({
    next: (data: any) => {
      this.usersPage = data;
      this.loading = false;
    },
    error: (err) => {
      this.toastr.error('Erreur lors du chargement des utilisateurs');
      this.loading = false;
    }
  });
}

editUser(user: any) {
  console.log("user selectionée: ",user)
  this.selectedUser = user;
  this.displayUserEditorModal = true;
}

// Met à jour la liste des utilisateurs après une modification
handleUpdate() {
  this.toastr.success("Utilisateur modifié avec succès !");
  this.loadUsers();
  this.displayUserEditorModal = false;
}


// handleUpdate(page = 0, size = 10) {
//   this.loading = true;
//   this.paginate(this.currentPageInfo);
// }
// Méthode pour la recherche
onSearchInput(event: any): void {
  const term = event.target.value;
  this.searchSubject.next(term);
}

        // Méthode pour effectuer la recherche
       
            // pagination avec recherche
handleNext($event: any) {
  this.pageSize = $event.rows;
  const page = $event.first / $event.rows;
  
  if (this.searchQuery && this.searchQuery.trim() !== '') {

    this.us.searchUsersBydisplayName(this.searchQuery, page, this.pageSize).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.users = response.data;
          
        }
        this.loading = false;
      },
      error: (err: any) => {
        this.toastr.error(err.message || 'Erreur lors de la pagination des résultats de recherche');
        this.loading = false;
      }
    });
  } else {
    // Si pas de recherche active
    this.loadData(page, $event.rows);
  }
}
}















