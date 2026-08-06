import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadImagem } from './upload-imagem';

describe('UploadImagem', () => {
  let component: UploadImagem;
  let fixture: ComponentFixture<UploadImagem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadImagem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadImagem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
