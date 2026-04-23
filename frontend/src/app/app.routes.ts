import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/login/signup.component';
import { ForgotPasswordComponent } from './pages/login/forgot-password.component';
import { ResetPasswordComponent } from './pages/login/reset-password.component';
import { ResetMessageComponent } from './pages/login/reset-message.component';
import { HomeComponent } from './pages/home/home.component';
import { SavedHotelsComponent } from './pages/saved-hotels/saved-hotels.component';
import { AdminUsersComponent } from './pages/admin-users/admin-users.component';
import { ReviewsComponent } from './pages/reviews/reviews.component';
import { AddReviewComponent } from './pages/reviews/add-review.component';
import { BannedComponent } from './pages/banned/banned.component';
import { HotelDetailsComponent } from './pages/hotel-details/hotel-details.component';
import { adminGuard } from './guards/admin.guard';
import { saveSyncGuard } from './guards/save-sync.guard';

import { authGuard, rootGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'reset-message', component: ResetMessageComponent },
  { path: 'home', component: HomeComponent, canActivate: [authGuard, saveSyncGuard] },
  { path: 'saved', component: SavedHotelsComponent, canActivate: [authGuard, saveSyncGuard] },
  { path: 'hotel/:id', component: HotelDetailsComponent, canActivate: [authGuard, saveSyncGuard] },
  { path: 'admin/users', component: AdminUsersComponent, canActivate: [authGuard, adminGuard, saveSyncGuard] },
  { path: 'reviews', component: ReviewsComponent, canActivate: [authGuard, saveSyncGuard] },
  { path: 'add-review', component: AddReviewComponent, canActivate: [authGuard] },
  { path: 'banned', component: BannedComponent },
  { path: '', canActivate: [rootGuard], component: LoginComponent }, // Entry point
  { path: '**', redirectTo: '' }
];
