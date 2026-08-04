import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SITE_INFO } from '../../../../core/constants/site-info';

@Component({
    selector: 'app-navbar',
    imports: [RouterLink, RouterLinkActive],
    templateUrl: './navbar.html',
    styleUrl: './navbar.scss',
})
export class Navbar {
    info = SITE_INFO;

    menuAberto = signal(false);

    toggleMenu() {
        this.menuAberto.update((v) => !v);
    }

    fecharMenu() {
        this.menuAberto.set(false);
    }
}
