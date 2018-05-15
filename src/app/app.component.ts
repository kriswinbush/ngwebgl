import { Component, ViewChild, ElementRef, AfterViewInit, AfterViewChecked } from '@angular/core';
import { WindowService } from './core/services/window.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements AfterViewInit, AfterViewChecked {
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

  //push motion function into its on service
  public LIBS={
    degToRad: function(angle){
      return(angle*Math.PI/180);
    },
  
    get_projection: function(angle, a, zMin, zMax) {
      var tan=Math.tan(this.degToRad(0.5*angle)),
          A=-(zMax+zMin)/(zMax-zMin),
            B=(-2*zMax*zMin)/(zMax-zMin);
  
      return [
        0.5/tan, 0 ,   0, 0,
        0, 0.5*a/tan,  0, 0,
        0, 0,         A, -1,
        0, 0,         B, 0
      ];
    },
  
    get_I4: function() {
      return [1,0,0,0,
              0,1,0,0,
              0,0,1,0,
              0,0,0,1];
    },
  
    rotateX: function(m, angle) {
      var c=Math.cos(angle);
      var s=Math.sin(angle);
      var mv1=m[1], mv5=m[5], mv9=m[9];
      m[1]=m[1]*c-m[2]*s;
      m[5]=m[5]*c-m[6]*s;
      m[9]=m[9]*c-m[10]*s;
  
      m[2]=m[2]*c+mv1*s;
      m[6]=m[6]*c+mv5*s;
      m[10]=m[10]*c+mv9*s;
    },
  
    rotateY: function(m, angle) {
      var c=Math.cos(angle);
      var s=Math.sin(angle);
      var mv0=m[0], mv4=m[4], mv8=m[8];
      m[0]=c*m[0]+s*m[2];
      m[4]=c*m[4]+s*m[6];
      m[8]=c*m[8]+s*m[10];
  
      m[2]=c*m[2]-s*mv0;
      m[6]=c*m[6]-s*mv4;
      m[10]=c*m[10]-s*mv8;
    },
  
    rotateZ: function(m, angle) {
      var c=Math.cos(angle);
      var s=Math.sin(angle);
      var mv0=m[0], mv4=m[4], mv8=m[8];
      m[0]=c*m[0]-s*m[1];
      m[4]=c*m[4]-s*m[5];
      m[8]=c*m[8]-s*m[9];
  
      m[1]=c*m[1]+s*mv0;
      m[5]=c*m[5]+s*mv4;
      m[9]=c*m[9]+s*mv8;
    },
  
  };

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

  public triangle_vertex = [
    -1,-1,-5,
    0,0,1,
    1,-1,-5,
    1,1,0,
    1,1,-5,
    1,0,0
  ];

  constructor(windowRef: WindowService) {
    this.window = windowRef.nativeWindow;
  }
  
  ngAfterViewInit() {
    
    this.ngxgl.nativeElement.height = this.window.innerHeight;
    this.ngxgl.nativeElement.width = this.window.innerWidth;

    this.PROJMATRIX = this.LIBS.get_projection(40,this.window.innerWidth/this.window.innerHeight,1,100);
    this.MOVEMATRIX = this.LIBS.get_I4();
    this.ctx = (<HTMLCanvasElement> this.ngxgl.nativeElement).getContext('webgl');

    let GL = this.ctx;

    this.SHADER_PROGRAM = this.ctx.createProgram();

    let shader_vertex = this.get_shader(this.shader_vertex_src, this.ctx.VERTEX_SHADER, 'VERTEX');
    
    let shader_fragment = this.get_shader(this.shader_fragment_src, this.ctx.FRAGMENT_SHADER, "FRAGMENT")
    
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
      this.LIBS.rotateY(this.MOVEMATRIX, dAngle);

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
