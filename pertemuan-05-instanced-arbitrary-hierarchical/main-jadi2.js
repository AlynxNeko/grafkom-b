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


    /*======================== THE TRIANGLE ======================== */
    // POINTS:
    var cube_vertex = [
        -1, -1, -1, 0, 0, 0,
        1, -1, -1, 1, 0, 0,
        1,  1, -1, 1, 1, 0,
        -1,  1, -1, 0, 1, 0,
        -1, -1,  1, 0, 0, 1,
        1, -1,  1, 1, 0, 1,
        1,  1,  1, 1, 1, 1,
        -1,  1,  1, 0, 1, 1
    ];

    var cube_faces = [
        0, 1, 2, 0, 2, 3,
        4, 5, 6, 4, 6, 7,
        0, 3, 7, 0, 4, 7,
        1, 2, 6, 1, 5, 6,
        2, 3, 6, 3, 7, 6,
        0, 1, 5, 0, 4, 5
    ];

    var CUBE_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, CUBE_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(cube_vertex), GL.STATIC_DRAW);

    var CUBE_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CUBE_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(cube_faces), GL.STATIC_DRAW);

    var PROJMATRIX = LIBS.get_projection(40, CANVAS.width / CANVAS.height, 1, 100);
    var MOVEMATRIX = LIBS.get_I4();
    var VIEWMATRIX = LIBS.get_I4();

    LIBS.translateZ(VIEWMATRIX, -12);

    /*========================= DRAWING ========================= */
    GL.enable(GL.DEPTH_TEST);
    GL.depthFunc(GL.LEQUAL);
    GL.clearColor(0.0, 0.0, 0.0, 1.0);
    GL.clearDepth(1.0);

    var time_prev = 0;
    var animate = function (time) {
        GL.viewport(0, 0, CANVAS.width, CANVAS.height);
        GL.clear(GL.COLOR_BUFFER_BIT);

        var dt = time - time_prev;
        time_prev = time;

        LIBS.set_I4(MOVEMATRIX);
        var temp = LIBS.get_I4();

        // Translasi -P1 = (0, 3, 0)
        LIBS.translateY(temp, 3);
        MOVEMATRIX = LIBS.multiply(MOVEMATRIX, temp);

        // Rotasi X 90°
        temp = LIBS.get_I4();
        LIBS.rotateX(temp, Math.PI/2);
        MOVEMATRIX = LIBS.multiply(MOVEMATRIX, temp);

        // Rotasi Y -45°
        temp = LIBS.get_I4();
        LIBS.rotateY(temp, -Math.PI/4);
        MOVEMATRIX = LIBS.multiply(MOVEMATRIX, temp);

        // Rotasi Z sesuai waktu
        temp = LIBS.get_I4();
        LIBS.rotateZ(temp, time * 0.001);
        MOVEMATRIX = LIBS.multiply(MOVEMATRIX, temp);

        // Balikkan Y
        temp = LIBS.get_I4();
        LIBS.rotateY(temp, Math.PI/4);
        MOVEMATRIX = LIBS.multiply(MOVEMATRIX, temp);

        // Balikkan X
        temp = LIBS.get_I4();
        LIBS.rotateX(temp, -Math.PI/2);
        MOVEMATRIX = LIBS.multiply(MOVEMATRIX, temp);

        // Translasi balik
        temp = LIBS.get_I4();
        LIBS.translateY(temp, -3);
        MOVEMATRIX = LIBS.multiply(MOVEMATRIX, temp);

        GL.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);
        GL.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);
        GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX);

        GL.bindBuffer(GL.ARRAY_BUFFER, CUBE_VERTEX);
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 3), 0);
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4 * (3 + 3), 4 * 3);
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CUBE_FACES);
        GL.drawElements(GL.TRIANGLES, cube_faces.length, GL.UNSIGNED_SHORT, 0);


        GL.flush();
        window.requestAnimationFrame(animate);
    };
    animate(0);
}
window.addEventListener('load', main);