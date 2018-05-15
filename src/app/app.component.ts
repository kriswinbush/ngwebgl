import { Component, ViewChild, ElementRef, AfterViewInit, AfterViewChecked } from '@angular/core';
import { WindowService } from './core/services/window.service';
import { LibsService } from "./core/services/libs.service";
import { ShadersService } from "./core/services/shaders.service";
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements AfterViewInit, AfterViewChecked {
  constructor(public windowRef: WindowService, public LibsService: LibsService, public shaders: ShadersService) {
    this.window = windowRef.nativeWindow;
  }
  @ViewChild('ngxgl') ngxgl: ElementRef;
  title = 'app';
  public ctx: WebGLRenderingContext;
  public window: any;
  public SHADER_PROGRAM: any;
  public PROJMATRIX:any;
  public MOVEMATRIX:any;

  public TRIANGLE_FACES: any;
  public TRIANGLE_VERTEX: any;
  public _position: any;
  public _color: any;
  public _Pmatrix: any;
  public _Mmatrix: any;
  public time_old:any =0;

  public triangle_vertex = [
    -1,-1,-5,
    0,0,1,
    1,-1,-5,
    1,1,0,
    1,1,-5,
    1,0,0
  ];

 
  
  ngAfterViewInit() {
    
    this.ngxgl.nativeElement.height = this.window.innerHeight;
    this.ngxgl.nativeElement.width = this.window.innerWidth;
  
    this.PROJMATRIX = this.LibsService.get_projection(40,this.window.innerWidth/this.window.innerHeight,1,100);
    this.MOVEMATRIX = this.LibsService.get_I4();
    this.ctx = (<HTMLCanvasElement> this.ngxgl.nativeElement).getContext('webgl');

    let GL = this.ctx;

    this.SHADER_PROGRAM = this.ctx.createProgram();

    let shader_vertex = this.get_shader(this.shaders.shader_vertex_src, this.ctx.VERTEX_SHADER, 'VERTEX');
    
    let shader_fragment = this.get_shader(this.shaders.shader_fragment_src, this.ctx.FRAGMENT_SHADER, "FRAGMENT")
    
    this.ctx.attachShader(this.SHADER_PROGRAM, shader_vertex);
    this.ctx.attachShader(this.SHADER_PROGRAM, shader_fragment);
    this.ctx.linkProgram(this.SHADER_PROGRAM);
    
    this._Pmatrix = this.ctx.getUniformLocation(this.SHADER_PROGRAM, 'Pmatrix')
    this._Mmatrix = this.ctx.getUniformLocation(this.SHADER_PROGRAM, 'Mmatrix');

    this._position = this.ctx.getAttribLocation(this.SHADER_PROGRAM, 'position');
    this._color = this.ctx.getAttribLocation(this.SHADER_PROGRAM, "color");

    this.ctx.enableVertexAttribArray(this._position);
    this.ctx.enableVertexAttribArray(this._color);

    this.ctx.useProgram(this.SHADER_PROGRAM);

    this.TRIANGLE_VERTEX = this.ctx.createBuffer();
    this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, this.TRIANGLE_VERTEX);
    this.ctx.bufferData(this.ctx.ARRAY_BUFFER, new Float32Array(this.triangle_vertex), this.ctx.STATIC_DRAW);

    let triangle_faces = [0,1,2];
    this.TRIANGLE_FACES = this.ctx.createBuffer();
    this.ctx.bindBuffer(this.ctx.ELEMENT_ARRAY_BUFFER, this.TRIANGLE_FACES);
    this.ctx.bufferData(this.ctx.ELEMENT_ARRAY_BUFFER, new Uint16Array(triangle_faces), this.ctx.STATIC_DRAW);
    
    this.ctx.clearColor(0.0,0.0,0.0,0.0);

    //change this.ctx to GL var
    GL.enable(GL.DEPTH_TEST);
    GL.depthFunc(GL.LEQUAL);
    GL.clearDepth(1.0);
  }

  ngAfterViewChecked() {
    this.animate(0);
  }
    
    animate(time) {

      let dAngle = 0.0000009 * (time - this.time_old);
      this.LibsService.rotateY(this.MOVEMATRIX, dAngle);

      this.ctx.viewport(0.0,0.0, this.ngxgl.nativeElement.width, this.ngxgl.nativeElement.height);
      this.ctx.clear(this.ctx.COLOR_BUFFER_BIT | this.ctx.DEPTH_BUFFER_BIT);

      this.ctx.uniformMatrix4fv(this._Pmatrix, false, this.PROJMATRIX);
      this.ctx.uniformMatrix4fv(this._Mmatrix, false, this.MOVEMATRIX);

      this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, this.TRIANGLE_VERTEX);
      this.ctx.vertexAttribPointer(this._position, 3, this.ctx.FLOAT, false, 4*(3+3),0);
      this.ctx.vertexAttribPointer(this._color, 3, this.ctx.FLOAT, false, 4*(3+3),3*4);
      this.ctx.bindBuffer(this.ctx.ELEMENT_ARRAY_BUFFER,this.TRIANGLE_FACES);
      this.ctx.drawElements(this.ctx.TRIANGLES,3, this.ctx.UNSIGNED_SHORT, 0);

      this.ctx.flush();
      //run RAF outside of angular
      this.window.requestAnimationFrame((timeStamp) => {
        this.time_old = timeStamp;
        this.animate;
      });
    }
  
  get_shader(src,type, typeString) {
    let shader = this.ctx.createShader(type);
    this.ctx.shaderSource(shader, src);
    this.ctx.compileShader(shader);
    if( !this.ctx.getShaderParameter(shader, this.ctx.COMPILE_STATUS)) {
      console.log(typeString);
      console.log(this.ctx.getShaderInfoLog(shader));
      return false;
    }
    return shader;
  }
  
}
