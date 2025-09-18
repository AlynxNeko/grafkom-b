import { MyObject } from "./MyObject.js";

function main() {
    /** @type {HTMLCanvasElement} */
    var CANVAS = document.getElementById("mycanvas");
    CANVAS.width = window.innerWidth;
    CANVAS.height = window.innerHeight;


    /*===================== GET WEBGL CONTEXT ===================== */
    /** @type {WebGLRenderingContext} */
    var GL;
    try {
        GL = CANVAS.getContext("webgl", { antialias: true });
    } catch (e) {
        alert("WebGL context cannot be initialized");
        return false;
    }


    /*========================= SHADERS ========================= */
    var shader_vertex_source = `
        attribute vec3 position;
        uniform mat4 Pmatrix, Vmatrix, Mmatrix;
        attribute vec3 color;
        varying vec3 vColor;

        void main(void) {
            gl_Position = Pmatrix * Vmatrix * Mmatrix * vec4(position, 1.);
            vColor = color;
        }`;


    var shader_fragment_source = `
        precision mediump float;
        varying vec3 vColor;

        void main(void) {
            gl_FragColor = vec4(vColor, 1.);
        }`;


    var compile_shader = function (source, type, typeString) {
        var shader = GL.createShader(type);
        GL.shaderSource(shader, source);
        GL.compileShader(shader);
        if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
            alert("ERROR IN " + typeString + " SHADER: " + GL.getShaderInfoLog(shader));
            return false;
        }
        return shader;
    };
    var shader_vertex = compile_shader(shader_vertex_source, GL.VERTEX_SHADER, "VERTEX");
    var shader_fragment = compile_shader(shader_fragment_source, GL.FRAGMENT_SHADER, "FRAGMENT");


    var SHADER_PROGRAM = GL.createProgram();
    GL.attachShader(SHADER_PROGRAM, shader_vertex);
    GL.attachShader(SHADER_PROGRAM, shader_fragment);


    GL.linkProgram(SHADER_PROGRAM);


    var _position = GL.getAttribLocation(SHADER_PROGRAM, "position");
    GL.enableVertexAttribArray(_position);


    var _color = GL.getAttribLocation(SHADER_PROGRAM, "color");
    GL.enableVertexAttribArray(_color);

    var _Pmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Pmatrix");
    var _Vmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Vmatrix");
    var _Mmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Mmatrix");

    GL.useProgram(SHADER_PROGRAM);

    var Object1 = new MyObject(GL, SHADER_PROGRAM, _position, _color, _Mmatrix);
    var Object2 = new MyObject(GL, SHADER_PROGRAM, _position, _color, _Mmatrix);
    var Object3 = new MyObject(GL, SHADER_PROGRAM, _position, _color, _Mmatrix);
    var Object4 = new MyObject(GL, SHADER_PROGRAM, _position, _color, _Mmatrix);
    
    Object1.childs.push(Object2);
    Object2.childs.push(Object3);
    Object3.childs.push(Object4);

    LIBS.scaleX(Object1.POSITION_MATRIX, 0.5);
    LIBS.scaleY(Object1.POSITION_MATRIX, 0.5);
    LIBS.scaleZ(Object1.POSITION_MATRIX, 0.5);

    LIBS.translateY(Object2.POSITION_MATRIX, 3);

    LIBS.translateX(Object3.POSITION_MATRIX, 3);
    LIBS.translateZ(Object4.POSITION_MATRIX, 3);

    var PROJMATRIX = LIBS.get_projection(40, CANVAS.width / CANVAS.height, 1, 100);
    // var MOVEMATRIX = LIBS.get_I4();
    var VIEWMATRIX = LIBS.get_I4();

    LIBS.translateZ(VIEWMATRIX, -12);

    /*========================= DRAWING ========================= */
    GL.enable(GL.DEPTH_TEST);
    GL.depthFunc(GL.LEQUAL);
    GL.clearColor(0.0, 0.0, 0.0, 1.0);
    GL.clearDepth(1.0);

    Object1.setup();

    var time_prev = 0;
    var animate = function (time) {
        GL.viewport(0, 0, CANVAS.width, CANVAS.height);
        GL.clear(GL.COLOR_BUFFER_BIT);

        var dt = time - time_prev;
        time_prev = time;

        LIBS.rotateY(Object1.MOVE_MATRIX, dt * 0.001);
        LIBS.rotateX(Object3.MOVE_MATRIX, dt * -0.001);
        LIBS.rotateX(Object4.MOVE_MATRIX, dt * 0.001);

        GL.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);
        GL.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);

        Object1.render(LIBS.get_I4());

        GL.flush();
        window.requestAnimationFrame(animate);
    };
    animate(0);
}
window.addEventListener('load', main);