import { Component } from '@angular/core';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [],
  template: `
    <section id="sign-up">
        <h2>Hello, you are new.</h2>
        <p>Enter your name.</p>

        <form id="signup-form" method="POST">
            <div>
                <label for="first-name">First Name</label>
                <input type="text" id="first-name" name="first-name" required>
            </div>
            <div>
                <label for="last-name">Last Name</label>
                <input type="text" id="last-name" name="last-name" required>
            </div>
            <button type="submit">Submit</button>
        </form>
    </section>
  `,
  styles: []
})
export class SignupComponent {}
