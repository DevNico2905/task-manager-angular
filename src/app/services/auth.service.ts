import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { BehaviorSubject } from 'rxjs';
import { User } from '@supabase/supabase-js';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private supabaseService: SupabaseService) {
    this.loadUser();
  }

  private async loadUser() {
    const { data } = await this.supabaseService.client.auth.getUser();
    this.userSubject.next(data.user);

    this.supabaseService.client.auth.onAuthStateChange((_event, session) => {
      this.userSubject.next(session?.user ?? null);
    });
  }

  async signUp(email: string, password: string) {
    const { data, error } = await this.supabaseService.client.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }

  async signIn(email: string, password: string) {
    const { data, error } =
      await this.supabaseService.client.auth.signInWithPassword({
        email,
        password,
      });
    if (error) throw error;
    return data;
  }

  async signOut() {
    await this.supabaseService.client.auth.signOut();
  }

  async getUser(): Promise<User | null> {
    const { data } = await this.supabaseService.client.auth.getUser();
    return data.user;
  }
}
