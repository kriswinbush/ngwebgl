import { TestBed, inject } from '@angular/core/testing';

import { ShadersService } from './shaders.service';

describe('ShadersService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ShadersService]
    });
  });

  it('should be created', inject([ShadersService], (service: ShadersService) => {
    expect(service).toBeTruthy();
  }));
});
