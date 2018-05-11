precision mediump float;

varying vec2 fragTexCoord; // (u,v)
varying vec3 fragNormal;

uniform vec3 ambientLightIntensity;
uniform vec3 sunlightIntensity;
uniform vec3 sunlightDirection;

uniform sampler2D sampler; // this is just order, will be texture 0
// what does this line mean?

void main()
{
//  vec3 ambientLightIntensity = vec3(0.3, 0.3, 0.3); // soft bluish ambient
//  vec3 sunlightIntensity = vec3(0.9, 0.9, 0.9); // whitish yellow light
//  vec3 sunlightDirection = normalize(vec3(1.0, 4.0, 0.0)); // mostly down, some right, (no z)?
  vec3 surfaceNormal = normalize(fragNormal);

  vec4 texel = texture2D(sampler, fragTexCoord);
  vec3 lightIntensity = ambientLightIntensity +
                        sunlightIntensity *
                        max(0.0,   // chop so sunlight on backsides is ignored
                          dot(surfaceNormal, sunlightDirection));

  gl_FragColor = vec4(lightIntensity * texel.rgb, 1.0); // elementwise multiply
  // gl_FragColor = vec4(fragNormal, 1.0);
  //gl_FragColor = texture2D(sampler, fragTexCoord);
}