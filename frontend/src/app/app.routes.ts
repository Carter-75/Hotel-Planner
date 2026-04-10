import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/login/signup.component';
import { ForgotPasswordComponent } from './components/login/forgot-password.component';
import { ResetPasswordComponent } from './components/login/reset-password.component';
import { ResetMessageComponent } from './components/login/reset-message.component';
import { HomeComponent } from './components/home/home.component';
import { SavedHotelsComponent } from './components/saved-hotels/saved-hotels.component';
import { SearchComponent } from './components/search/search.component';
import { AdminUsersComponent } from './components/admin-users/admin-users.component';
import { HotelAdminComponent } from './components/hotel-admin/hotel-admin.component';
import { ReviewsComponent } from './components/reviews/reviews.component';
import { AddReviewComponent } from './components/reviews/add-review.component';
import { BannedComponent } from './components/banned/banned.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'reset-message', component: ResetMessageComponent },
  { path: 'home', component: HomeComponent },
  { path: 'saved', component: SavedHotelsComponent },
  { path: 'search', component: SearchComponent },
  { path: 'admin/users', component: AdminUsersComponent },
  { path: 'admin/hotels', component: HotelAdminComponent },
  { path: 'reviews', component: ReviewsComponent },
  { path: 'add-review', component: AddReviewComponent },
  { path: 'banned', component: BannedComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
