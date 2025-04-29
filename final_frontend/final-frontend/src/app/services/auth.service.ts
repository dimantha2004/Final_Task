import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export interface User {
  id?: string;
  username: string;
  email?: string;
  token?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private apiUrl = '/api';
  
  private mockUsers: RegisterCredentials[] = [
    { username: 'admin', email: 'admin@example.com', password: 'admin123' }
  ];

  constructor(private http: HttpClient) {
    this.loadUserFromLocalStorage();
  }

  private loadUserFromLocalStorage(): void {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        this.currentUserSubject.next(user);
      } catch (e) {
        localStorage.removeItem('currentUser');
      }
    }
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public isAuthenticated(): boolean {
    return !!this.currentUserValue;
  }

  login(credentials: LoginCredentials): Observable<User> {
    
    return this.mockLogin(credentials);
  }

  private mockLogin(credentials: LoginCredentials): Observable<User> {
    const user = this.mockUsers.find(u => 
      u.username === credentials.username && u.password === credentials.password
    );

    if (user) {
      const loggedInUser: User = {
        id: '1',
        username: user.username,
        email: user.email,
        token: 'mock-jwt-token'
      };

      localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
      this.currentUserSubject.next(loggedInUser);
      return of(loggedInUser);
    } else {
      return throwError(() => ({ error: { message: 'Invalid username or password' } }));
    }
  }

  register(credentials: RegisterCredentials): Observable<User> {
    
    return this.mockRegister(credentials);
  }

  private mockRegister(credentials: RegisterCredentials): Observable<User> {
    if (this.mockUsers.some(u => u.username === credentials.username)) {
      return throwError(() => ({ error: { message: 'Username already exists' } }));
    }

    if (this.mockUsers.some(u => u.email === credentials.email)) {
      return throwError(() => ({ error: { message: 'Email already in use' } }));
    }

    this.mockUsers.push(credentials);

    const newUser: User = {
      id: String(this.mockUsers.length),
      username: credentials.username,
      email: credentials.email
    };

    return of(newUser);
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }
}