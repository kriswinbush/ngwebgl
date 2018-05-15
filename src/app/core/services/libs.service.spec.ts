import { TestBed, inject } from '@angular/core/testing';

import { LibsService } from './libs.service';

describe('LIBSService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LibsService]
    });
  });

  it('should be created', inject([LibsService], (service: LibsService) => {
    expect(service).toBeTruthy();
  }));
});
