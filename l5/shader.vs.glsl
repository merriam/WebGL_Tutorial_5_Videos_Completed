precision mediump float;  // medium precision

attribute vec3 vertPosition; // xyz position floats
attribute vec2 vertTexCoord; // 2d for texturing, (u, v)
varying vec2 fragTexCoord; // now passing texture coordinates
uniform mat4 mWorld;    // uniform is global to my GPU.
uniform mat4 mView;      // mat4 is the gl-matrix 4 x 4 matrix
uniform mat4 mProj;

void main()
{
    fragTexCoord = vertTexCoord;
    gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
    // So thats reverse order with the point at the end.
    // point moved to world coordinates, to the cubes current position, and
    // projected from camera into 2D.
}
