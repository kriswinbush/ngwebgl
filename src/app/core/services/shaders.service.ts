import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ShadersService {

  constructor() { }
  
  //move shaders into web assembly module
  public shader_vertex_src = `
    attribute vec3 position;
    attribute vec3 color;
    varying vec3 vColor;
    uniform mat4 Pmatrix;
    uniform mat4 Mmatrix;

    void main() {
      gl_Position = Pmatrix * Mmatrix * vec4(position, 1.0);
      vColor = color;
    }
  `;

  public shader_fragment_src = `
    precision mediump float;
    void main() {
      gl_FragColor = vec4(1.0,0.4,0.2,1.0);
    }
  `;
}
