precision mediump float;

varying vec2 fragTexCoord; // (u,v)
uniform sampler2D sampler; // this is just order, will be texture 0

void main()
{
  gl_FragColor = texture2D(sampler, fragTexCoord);
}