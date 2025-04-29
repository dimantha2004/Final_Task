import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Employee } from '../../models/employee.model';
import { EmployeeService } from '../../services/employee.service';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css']
})
export class EmployeeListComponent implements OnInit {
  employees$!: Observable<Employee[]>;
  filteredEmployees$!: Observable<Employee[]>;
  
  // Search properties
  searchTerm: string = '';
  searchField: string = 'all';
  private searchTerms = new BehaviorSubject<string>('');
  private searchFields = new BehaviorSubject<string>('all');
  
  // Alert messages
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(private employeeService: EmployeeService) { }

  ngOnInit(): void {
    this.loadEmployees();
    
    // Create filtered employees observable that combines the original list with search terms
    this.filteredEmployees$ = combineLatest([
      this.employees$,
      this.searchTerms,
      this.searchFields
    ]).pipe(
      map(([employees, term, field]) => this.filterEmployees(employees, term, field))
    );
  }

  loadEmployees(): void {
    this.employees$ = this.employeeService.getEmployees();
  }

  // Search methods
  applySearch(): void {
    this.searchTerms.next(this.searchTerm);
    this.searchFields.next(this.searchField);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.searchField = 'all';
    this.applySearch();
  }

  // Filter employees based on search term and selected field
  private filterEmployees(employees: Employee[], term: string, field: string): Employee[] {
    if (!term.trim()) {
      return employees;
    }
    
    const searchText = term.toLowerCase();
    
    return employees.filter(employee => {
      if (field === 'all') {
        // Search across all fields
        return (
          employee.name?.toLowerCase().includes(searchText) ||
          employee.email?.toLowerCase().includes(searchText) ||
          employee.department?.toLowerCase().includes(searchText)
        );
      } else {
        // Search in the specific field
        const value = employee[field as keyof Employee];
        return value && typeof value === 'string' 
          ? value.toLowerCase().includes(searchText) 
          : false;
      }
    });
  }

  deleteEmployee(id: number): void {
    if (confirm('Are you sure you want to delete this employee?')) {
      this.employeeService.deleteEmployee(id).subscribe({
        next: () => {
          this.successMessage = 'Employee deleted successfully';
          this.loadEmployees();
          setTimeout(() => this.successMessage = null, 3000);
        },
        error: (error) => {
          this.errorMessage = `Error: ${error.message || 'Could not delete employee'}`;
          setTimeout(() => this.errorMessage = null, 5000);
        }
      });
    }
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  clearMessages(): void {
    this.successMessage = null;
    this.errorMessage = null;
  }
}