import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE_INFO } from '../../../../core/constants/site-info';

@Component({
    selector: 'app-footer',
    imports: [RouterLink],
    templateUrl: './footer.html',
    styleUrl: './footer.scss',
})
export class Footer {
    info = SITE_INFO;
    ano = new Date().getFullYear();
}
