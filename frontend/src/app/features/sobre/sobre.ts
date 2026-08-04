import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE_INFO } from '../../core/constants/site-info';

@Component({
    selector: 'app-sobre',
    imports: [RouterLink],
    templateUrl: './sobre.html',
    styleUrl: './sobre.scss',
})
export class Sobre {
    info = SITE_INFO;
}
