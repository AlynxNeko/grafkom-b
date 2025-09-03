function main() {
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
        attribute vec2 position;
 
        void main(void) {
            gl_Position = vec4(position, 0., 1.);
        }`;


    var shader_fragment_source = `
        precision mediump float;
        uniform vec3 uColor;
        void main(void) {
            gl_FragColor = vec4(uColor, 1.);
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
   
    GL.useProgram(SHADER_PROGRAM);
    var uniform_color = GL.getUniformLocation(SHADER_PROGRAM, "uColor");

        /*======================== THE SHAPES ======================== */
    // POINTS:
    // variabel triangle vertex menyimpan data dalam format x1, y1, x2, y2, dst.
    var triangle_vertex = [
        -1, -1, // index 0 kiri bawah canvas
        1, -1, // index 1 kanan bawah canvas
        1, 1 // index 2 kanan atas canvas
    ];


    var TRIANGLE_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, TRIANGLE_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER,
        new Float32Array(triangle_vertex),
        GL.STATIC_DRAW);

        /*========================= DRAWING ========================= */
    GL.clearColor(0.0, 0.0, 0.0, 0.0);
    var animate = function () {
        GL.viewport(0, 0, CANVAS.width, CANVAS.height);
        GL.clear(GL.COLOR_BUFFER_BIT);


        // [ ... ] Draw stuffs here
        GL.bindBuffer(GL.ARRAY_BUFFER, TRIANGLE_VERTEX);
        GL.vertexAttribPointer(_position, 2, GL.FLOAT, false, 4 * 2, 0);
        GL.uniform3f(uniform_color, 1, 1, 0);
        GL.drawArrays(GL.TRIANGLES, 0, triangle_vertex.length/2);


        GL.flush();
        window.requestAnimationFrame(animate);
    };
    animate();
}
window.addEventListener('load', main);