/*
   This is for WebGL Tutorial 3 - Texturing a 3D Cube
   https://www.youtube.com/watch?v=hpnd11doMgc

   3D textured cube,
    do rotations, set up virtual camera (a view transform),
    use project matrix (projection transform) to move to 2D.

  Uses gl-matrix library
 */

var mesh;

const InitDemo = function () {
    loadTextResource('/shader.vs.glsl', function (vsErr, vsText) {
        if (vsErr) {
            alert('Fatal error getting vertex shader (see console)');
            console.error(vsErr);
        } else {
            loadTextResource('/shader.fs.glsl', function (fsErr, fsText) {
                if (fsErr) {
                    alert('Fatal error getting vertex shader (see console)');
                    console.error(fsErr);
                } else {
                    loadJSONResource('./Susan.json', function (jsErr, modelObj) {
                        if (jsErr) {
                            alert('Fatal error getting model (see console)');
                            console.error(jsErr);
                        } else {
                            loadImage('./SusanTexture.png', function (imgErr, imgData) {
                                if (imgErr) {
                                    alert('Fatal error in loading texture image (see console)');
                                    console.error(imgErr);
                                } else {
                                    RunDemo(vsText, fsText, imgData, modelObj);
                                }
                            });
                        }
                    });
                }
            });
        }
    });
};

var RunDemo = function (vertexShaderText, fragmentShaderText, textureImg, modelObj) {
    console.log("The demo called InitDemo");
    const modelMesh = modelObj.meshes[0];
    mesh = modelMesh;  // a global for easier development

    //> Init WebGL
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
    //<


    //> Init vertex and fragment shaders
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
    //<

    //> Create buffers for model
    var modelVertices = modelMesh.vertices;

    var modelIndices = [].concat.apply([], modelMesh.faces);
    // indices flattened from [ [1,2,3], [1, 2, 4] ..] to [1,2,3,1,2,4,...]

    var modelTexCoords = modelMesh.texturecoords[0];

    var modelPosVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, modelPosVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelVertices), gl.STATIC_DRAW);

    var modelTexCoordsBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, modelTexCoordsBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelTexCoords), gl.STATIC_DRAW);

    var modelIndexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, modelIndexBufferObject);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(modelIndices), gl.STATIC_DRAW);

    //> bind vertices
    gl.bindBuffer(gl.ARRAY_BUFFER, modelPosVertexBufferObject);
    var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    gl.vertexAttribPointer(
        positionAttribLocation,  // location, or index into attributes of shader
        3, // per attribute
        gl.FLOAT, // element type
        gl.FALSE,  // not normalized, tbd
        3 * Float32Array.BYTES_PER_ELEMENT, // Size of individual vertext
        0 // Offset from the beginning of a single vertex to this attribute
    );
    gl.enableVertexAttribArray(positionAttribLocation);
    //<

    //> bind texture coords
    gl.bindBuffer(gl.ARRAY_BUFFER, modelTexCoordsBufferObject);
    var texCoordAttribLocation = gl.getAttribLocation(program, 'vertTexCoord');
    gl.vertexAttribPointer(
        texCoordAttribLocation,  // location, or index into attributes of shader
        2, // per attribute
        gl.FLOAT, // element type
        gl.FALSE,  // not normalized, tbd
        2 * Float32Array.BYTES_PER_ELEMENT, // Size of individual vertext
        0 // Offset from the beginning of a single vertex to this attribute
    );
    gl.enableVertexAttribArray(texCoordAttribLocation);
    //<

    //> create texture
    var modelTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, modelTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // set this prop to true
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); // (s,t) same as (u,v)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImg);
    gl.bindTexture(gl.TEXTURE_2D, null); // unbind buffer after it is loaded in.


    //> set main program
    gl.useProgram(program);  // tell open gl we use this program, as needed for uniformMatrix4fv

    var matWorldUniformLocation = gl.getUniformLocation(program, "mWorld");
    var matViewUniformLocation = gl.getUniformLocation(program, "mView");
    var matProjUniformLocation = gl.getUniformLocation(program, "mProj");

    var worldMatrix = new Float32Array(16);
    var viewMatrix = new Float32Array(16);
    var projMatrix = new Float32Array(16);

    mat4.identity(worldMatrix);  // graphics code often does mutate-in-place
    mat4.lookAt(viewMatrix, [0, 0, -8], [0, 0, 0], [0, 1, 0]);
    mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.clientWidth / canvas.clientHeight, 0.1, 1000.0);

    gl.uniformMatrix4fv(   // This is where we watch for magic, or bad things happen.
        matWorldUniformLocation,   // The position we had
        gl.FALSE,       // a constant we must pass
        worldMatrix);   // must be correct type
    gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
    gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);
    //<

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

        gl.bindTexture(gl.TEXTURE_2D, modelTexture);
        gl.activeTexture(gl.TEXTURE0);

        gl.drawElements(gl.TRIANGLES, modelIndices.length, gl.UNSIGNED_SHORT, 0);
        // so use elements, all the index points, index numbers are unsigned shorts, skip 0
        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);  // request it to be called, but not if tab out of focus.

};

