import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cricket } from './cricket';

describe('Cricket', () => {
  let component: Cricket;
  let fixture: ComponentFixture<Cricket>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Cricket]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Cricket);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
