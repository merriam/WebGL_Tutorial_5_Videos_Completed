var vertexShaderText =
    [
        'precision mediump float;',  // medium precision
        '',
        'attribute vec2 vertPosition;', // x, y position both floats
        'attribute vec3 vertColor;', // rgb
        'varying vec3 fragColor;', // the output color
        '',
        'void main()',
        '{',
        '  fragColor = vertColor;',
        '  gl_Position = vec4(vertPosition, 0.0, 1.0);',
        '}'
    ].join('\n');

var fragmentShaderText =
    [
        'precision mediump float;',
        '',
        'varying vec3 fragColor;', // rgb
        'void main()',
        '{',
        '  gl_FragColor = vec4(fragColor, 1.0);', // red
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
        [ // x,y, r,g,b
            0.0, 0.5, 1.0, 1.0, 0.0,
            -0.5, -0.5, 0.7, 0.0, 1.0, // counter clockwise
            0.5, -0.5, 0.1, 1.0, 0.6,
            0.5, 0.1666, 1.0, 0.1, 0.3,
            -0.5, 0.1666, 0.1, 1.0, 0.1,
            0.0, -0.8333, 0.6, 0.6, 1.0
        ];

    var triangleVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);

    var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');

    gl.vertexAttribPointer(
        positionAttribLocation,  // location, or index into attributes of shader
        2, // per attribute
        gl.FLOAT, // element type
        gl.FALSE,  // not normalized, tbd
        5 * Float32Array.BYTES_PER_ELEMENT, // Size of individual vertext
        0 // Offset from the beginning of a single vertex to this attribute
    );
    gl.vertexAttribPointer(
        colorAttribLocation,  // location, or index into attributes of shader
        3, // per attribute
        gl.FLOAT, // element type
        gl.FALSE,  // not normalized, tbd
        5 * Float32Array.BYTES_PER_ELEMENT, // Size of individual vertext
        2 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
    );

    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(colorAttribLocation);

    //
    // Main render loop
    //
    gl.useProgram(program);
    gl.drawArrays(gl.TRIANGLES, 0, 6);  // with current bound buffer, draw skipping 0, 3 triangles

};

