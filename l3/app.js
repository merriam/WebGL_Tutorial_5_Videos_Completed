/*
   This is for WebGL Tutorial 3 - Texturing a 3D Cube
   https://www.youtube.com/watch?v=hpnd11doMgc

   3D textured cube,
    do rotations, set up virtual camera (a view transform),
    use project matrix (projection transform) to move to 2D.

  Uses gl-matrix library
 */
var vertexShaderText =  // Vertex shader sets pos and color of vertex.
    [
        'precision mediump float;',  // medium precision
        '',
        'attribute vec3 vertPosition;', // xyz position floats
        'attribute vec2 vertTexCoord;', // 2d for texturing, (u, v)
        'varying vec2 fragTexCoord;', // now passing texture coordinates
        'uniform mat4 mWorld;',    // uniform is 'global to my GPU'.
        'uniform mat4 mView;',      // mat4 is the gl-matrix 4 x 4 matrix
        'uniform mat4 mProj;',
        '',
        'void main()',
        '{',
        '  fragTexCoord = vertTexCoord;',
        '  gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);',
        // So that's reverse order with the point at the end.
        // point moved to world coordinates, to the cubes current position, and
        // projected from camera into 2D.
        '}'
    ].join('\n');

var fragmentShaderText =  // shades one triangle fragment
    [
        'precision mediump float;',
        '',
        'varying vec2 fragTexCoord;', // (u,v)
        'uniform sampler2D sampler;', // this is just order, will be texture 0
        '',
        'void main()',
        '{',
        '  gl_FragColor = texture2D(sampler, fragTexCoord);',
        '}'
    ].join('\n');

var InitDemo = function () {
    console.log("The demo called InitDemo");

    var canvas = document.getElementById('the-canvas');
    var gl = canvas.getContext('webgl');
    if (!gl) {
        console.log('WebGL not supported, falling back to experimental-webgl');
        gl = canvas.getContext('experimental-webgl');
    }

    if (!gl) {
        alert('Your browser does not support WebGL');
    }

    gl.clearColor(0.75, .85, 0.8, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK); // cull the back face, or use gl.FRONT for more fun
    gl.frontFace(gl.CCW);


    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertexShader, vertexShaderText);
    gl.shaderSource(fragmentShader, fragmentShaderText);

    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
        return;
    }
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
        return;
    }

    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('ERROR linking program!', gl.getProgramInfoLog(program));
        return;
    }

    gl.validateProgram(program);  // magic extra checking
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
        console.error('ERROR validating program!', gl.getProgramParameter(program));
    }

    //
    // Create buffer
    //
    var triangleVertices =
        [ // x,y,z,    r,g,b
            0.0, 0.5, 0.0, 1.0, 1.0, 0.0,
            -0.5, -0.5, 0.0, 0.7, 0.0, 1.0, // counter clockwise
            0.5, -0.5, 0.0, 0.1, 1.0, 0.6
        ];

    // cube list of points.  2 triangles per face, one color per face.
    // stored as four points per face, with colors, and then a vertex list.
    // odd choice, but ok.
    var cubeVertices =
        [ // X, Y, Z            U, V
            // Top
            -1.0, 1.0, -1.0, 0, 0,
            -1.0, 1.0, 1.0, 0, 1,
            1.0, 1.0, 1.0, 1, 1,
            1.0, 1.0, -1.0, 1, 0,

            // Left
            -1.0, 1.0, 1.0, 0, 0,
            -1.0, -1.0, 1.0, 1, 0,
            -1.0, -1.0, -1.0, 1, 1,
            -1.0, 1.0, -1.0, 0, 1,

            // Right
            1.0, 1.0, 1.0, 1, 1,
            1.0, -1.0, 1.0, 1, 0,
            1.0, -1.0, -1.0, 0, 0,
            1.0, 1.0, -1.0, 0, 1,

            // Front
            1.0, 1.0, 1.0, 1, 1,
            1.0, -1.0, 1.0, 1, 0,
            -1.0, -1.0, 1.0, 0, 0,
            -1.0, 1.0, 1.0, 0, 1,

            // Back
            1.0, 1.0, -1.0, 0, 0,
            1.0, -1.0, -1.0, 0, 1,
            -1.0, -1.0, -1.0, 1, 1,
            -1.0, 1.0, -1.0, 1, 0,

            // Bottom
            -1.0, -1.0, -1.0, 1, 1,
            -1.0, -1.0, 1.0, 1, 0,
            1.0, -1.0, 1.0, 0, 0,
            1.0, -1.0, -1.0, 0, 1
        ];

    var cubeIndices =
        [
            // Top
            0, 1, 2,
            0, 2, 3,

            // Left
            5, 4, 6,
            6, 4, 7,

            // Right
            8, 9, 10,
            8, 10, 11,

            // Front
            13, 12, 14,
            15, 14, 12,

            // Back
            16, 17, 18,
            16, 18, 19,

            // Bottom
            21, 20, 22,
            22, 20, 23
        ];

    // var triangleVertices =
    //     [ // x,y,z,    r,g,b
    //         0.0, 0.5, 0.0,     1.0, 1.0, 0.0,
    //         -0.5, -0.5, 0.0,   0.7, 0.0, 1.0, // counter clockwise
    //         0.5, -0.5, 0.0,    0.1, 1.0, 0.6,
    //         0.5, 0.1666, 0.0,  1.0, 0.1, 0.3,
    //         -0.5, 0.1666, 0.0, 0.1, 1.0, 0.1,
    //         0.0, -0.8333, 0.0, 0.6, 0.6, 1.0
    //     ];

    var triangleVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);

    var cubeVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeVertices), gl.STATIC_DRAW);

    var cubeIndexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBufferObject);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);


    var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    var texCoordAttribLocation = gl.getAttribLocation(program, 'vertTexCoord');

    gl.vertexAttribPointer(
        positionAttribLocation,  // location, or index into attributes of shader
        3, // per attribute
        gl.FLOAT, // element type
        gl.FALSE,  // not normalized, tbd
        5 * Float32Array.BYTES_PER_ELEMENT, // Size of individual vertext
        0 // Offset from the beginning of a single vertex to this attribute
    );
    gl.vertexAttribPointer(
        texCoordAttribLocation,  // location, or index into attributes of shader
        2, // per attribute
        gl.FLOAT, // element type
        gl.FALSE,  // not normalized, tbd
        5 * Float32Array.BYTES_PER_ELEMENT, // Size of individual vertext
        3 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
    );

    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(texCoordAttribLocation);

    // create texture
    var boxTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, boxTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); // (s,t) same as (u,v)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.texImage2D(gl.TEXTURE_2D,
        0, // level of detail
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        document.getElementById('crate-image')
        /* If this causes a DOM Exception / Cross Origin, then you failed to run
           inside a web browser.
           If you "python -m http.server 8000" then "open 0.0.0.0:8000" it should work.
         */
    );
    gl.bindTexture(gl.TEXTURE_2D, null); // unbind buffer after it is loaded in.


    gl.useProgram(program);  // tell open gl we use this program, as needed for uniformMatrix4fv

    var matWorldUniformLocation = gl.getUniformLocation(program, "mWorld");
    var matViewUniformLocation = gl.getUniformLocation(program, "mView");
    var matProjUniformLocation = gl.getUniformLocation(program, "mProj");

    var worldMatrix = new Float32Array(16);
    var viewMatrix = new Float32Array(16);
    var projMatrix = new Float32Array(16);

    mat4.identity(worldMatrix);  // graphics code often does mutate-in-place
    mat4.lookAt(viewMatrix, [2, 2, -5], [0, 0, 0], [0, 1, 0]);  // look from eye=underneath, center=center, up=+y
    mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 1000.0);

    gl.uniformMatrix4fv(   // This is where we watch for magic, or bad things happen.
        matWorldUniformLocation,   // The position we had
        gl.FALSE,       // a constant we must pass
        worldMatrix);   // must be correct type
    gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
    gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);


    //
    // Main render loop
    //
    var identityMatrix = new Float32Array(16);
    mat4.identity(identityMatrix);

    var angle = 0; // keep allocating variables outside of animation loop
    var xRotationMatrix = new Float32Array(16);
    var yRotationMatrix = new Float32Array(16);
    var loop = function () {
        angle = performance.now() / 1000 / 6 * 2 * Math.PI;
        // (ms since ap start) / (1000 ms/sec) * (1/6 of a full rotation)
        // aka a full rotation every 6 seconds

        mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]);
        mat4.rotate(xRotationMatrix, identityMatrix, angle / 4, [1, 0, 0]);
        mat4.mul(worldMatrix, xRotationMatrix, yRotationMatrix);
        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

        gl.clearColor(0.75, .85, 0.8, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.bindTexture(gl.TEXTURE_2D, boxTexture);
        gl.activeTexture(gl.TEXTURE0);

        // gl.drawArrays(gl.TRIANGLES, 0, 3);  // with current bound buffer, draw skipping 0, 3 triangles
        gl.drawElements(gl.TRIANGLES, cubeIndices.length, gl.UNSIGNED_SHORT, 0);
        // so use elements, all the index points, index numbers are unsigned shorts, skip 0
        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);  // request it to be called, but not if tab out of focus.

};

