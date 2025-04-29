import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Employee, Department } from '../../models/employee.model';
import { EmployeeService } from '../../services/employee.service';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.css']
})
export class EmployeeFormComponent implements OnInit {
  employeeForm!: FormGroup;
  isEditMode = false;
  employeeId?: number;
  departments = Object.values(Department);
  submitted = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.initForm();
    
    this.route.params.subscribe(params => {
      if (params['id'] && params['id'] !== 'new') {
        this.isEditMode = true;
        this.employeeId = +params['id'];
        this.loadEmployee(this.employeeId);
      }
    });
  }

  initForm(): void {
    this.employeeForm = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-Z ]+$/)
      ]],
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      department: ['', Validators.required]
    });
  }

  loadEmployee(id: number): void {
    this.employeeService.getEmployee(id).subscribe({
      next: (employee) => {
        this.employeeForm.patchValue({
          name: employee.name,
          email: employee.email,
          department: employee.department
        });
      },
      error: (error) => {
        this.errorMessage = `Error loading employee: ${error.message}`;
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;
    
    if (this.employeeForm.invalid) {
      return;
    }

    const employeeData: Employee = this.employeeForm.value;

    if (this.isEditMode && this.employeeId) {
      this.employeeService.updateEmployee(this.employeeId, employeeData).subscribe({
        next: () => {
          this.router.navigate(['/employees'], { 
            queryParams: { successMsg: 'Employee updated successfully' } 
          });
        },
        error: (error) => {
          if (error.status === 400 && error.error.errors) {
            // Handle validation errors
            const validationErrors = error.error.errors;
            Object.keys(validationErrors).forEach(key => {
              const formControl = this.employeeForm.get(key);
              if (formControl) {
                formControl.setErrors({ serverError: validationErrors[key] });
              }
            });
          } else {
            this.errorMessage = error.error.message || 'Failed to update employee';
          }
        }
      });
    } else {
      this.employeeService.createEmployee(employeeData).subscribe({
        next: () => {
          this.router.navigate(['/employees'], { 
            queryParams: { successMsg: 'Employee created successfully' } 
          });
        },
        error: (error) => {
          if (error.status === 400 && error.error.errors) {
            // Handle validation errors
            const validationErrors = error.error.errors;
            Object.keys(validationErrors).forEach(key => {
              const formControl = this.employeeForm.get(key);
              if (formControl) {
                formControl.setErrors({ serverError: validationErrors[key] });
              }
            });
          } else {
            this.errorMessage = error.error.message || 'Failed to create employee';
          }
        }
      });
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.employeeForm.get(controlName);
    
    if (!control || !control.errors || !control.touched) {
      return '';
    }
    
    if (control.errors['required']) {
      return `${this.formatControlName(controlName)} is required`;
    }
    
    if (control.errors['email']) {
      return 'Please enter a valid email address';
    }
    
    if (control.errors['maxlength']) {
      return `${this.formatControlName(controlName)} must be less than ${control.errors['maxlength'].requiredLength} characters`;
    }
    
    if (control.errors['pattern']) {
      return `${this.formatControlName(controlName)} can only contain alphabetic characters and spaces`;
    }
    
    if (control.errors['serverError']) {
      return control.errors['serverError'];
    }
    
    return 'Invalid input';
  }

  formatControlName(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  dismissError(): void {
    this.errorMessage = null;
  }
}