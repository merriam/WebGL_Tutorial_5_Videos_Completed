precision mediump float;  // medium precision

attribute vec3 vertPosition; // xyz position floats
attribute vec2 vertTexCoord; // 2d for texturing, (u, v)
attribute vec3 vertNormal;

varying vec2 fragTexCoord; // now passing texture coordinates
varying vec3 fragNormal;

uniform mat4 mWorld;    // uniform is global to my GPU.
uniform mat4 mView;      // mat4 is the gl-matrix 4 x 4 matrix
uniform mat4 mProj;

void main()
{
    fragTexCoord = vertTexCoord;
    fragNormal = (mWorld *   // world orientation and translation
                  vec4(vertNormal, 0.0)   // with no translation applied
                 ).xyz;  // convert back to vec3
      // vec4(vertNormal, 0.0)

    gl_Position = mProj *  mView * mWorld * vec4(vertPosition, 1.0);
    // So thats reverse order with the point at the end.
    // point moved to world coordinates, to the cubes current position, and
    // projected from camera into 2D.
}
