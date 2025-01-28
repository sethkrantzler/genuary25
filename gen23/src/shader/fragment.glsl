uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;

varying float vElevation;
varying vec2 vUv;

void main()
{
    vec3 color = mix(vec3(0.04), vec3(0.21), fract(vUv.y*2.5));
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
}