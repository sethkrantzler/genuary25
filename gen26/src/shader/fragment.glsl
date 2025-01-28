uniform float uTime;

varying vec2 vUv;

#define PI 3.14159265359


float stroke(float x, float s, float w) {
    float d = step(s, x+w*.5) - step(s, x-w*.5);
    return clamp(d, 0., 1.);
}

float circleSDF(vec2 uv) {
    return length(uv-.5)*2.;
}

float circle(float r, vec2 uv, bool invert) {
    if (invert) return step(r, circleSDF(uv));
    return 1.0 - step(r, circleSDF(uv));
}


float random (in float x) {
    return fract(sin(x)*1e4);
}

float random (in vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233)))* 43758.5453123);
}

// we want to have 3 colors, two fun colors, and one background color
vec3 color1 = vec3(0.9725, 0.9137, 0.9137);
vec3 color2 = vec3(0.9529, 0.4667, 0.2824);
vec3 color3 = vec3(0.0863, 0.0980, 0.1451);


// determine if we are in a capsule centered along the origin
// change the quadrant of the capsule by flipping x for every coordinate change in grid y
// determine the colors to mix by the quadrant we are in aka the signs of the parity vector


// a capsule can bet determind by d = | P dot A - h (B dota A)|
// where h = min(1. , max(0., dot(P - A, B - A) / dot(B - A, B - A)))

float linesegmentSDF(vec2 uv, vec2 a, vec2 b, float w, float blur) {
    vec2 pa = uv - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    //w -= (0.08*cos(2.*h*sin(uTime)));
    float d = step(blur, length(pa - ba*h) - w);
    //return d*(cos(h*uTime));
    //return d-(cos(2.*h*uTime));
    return d;
}

float roundedBoxSDF(vec2 uv, vec2 size, float radius) {
    vec2 d = abs(uv) - (size) + vec2(radius);
    //d -= 0.25*sin(uTime);
    return step(0.0, min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - radius);
}

mat2 rotate2d(float _angle){
    return mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle));
}

void main()
{
    vec2 uv = vUv;
    vec2 grid = vec2(8.0, 8.0);
    vec2 gridPos = uv * grid;
    vec2 ipos = floor(gridPos);
    vec2 fpos = fract(gridPos);
    vec2 quadrant = mod(ipos, 2.0);
    float parity = 1.0 - step(2.0, mod(ipos.y, 4.0));
    fpos -= 0.5;
    fpos *= rotate2d(PI*parity);
    fpos += 0.5;
    quadrant = mod(quadrant + vec2(parity), 2.0);
    vec2 a = vec2((1.0 - (quadrant.y*quadrant.x)), 1.0 - quadrant.y);
    vec2 b = vec2(1.0 - (quadrant.y*quadrant.x), 0.5);
    a.x *= length(quadrant);
    b.x *= length(quadrant);
    vec3 color = vec3(0.);
    // fpos.x += 0.5*parity*sin(uTime);
    // fpos.x += 0.5*(1.0-parity)*sin(uTime);
    color = vec3(linesegmentSDF(fpos, a, b, 0.5, 0.0));
    
    // // rounded box code
    // fpos = 1.0 - quadrant - fpos; // rotate quadrant for box
    // fpos.x += mod(1.0*length(parity), 1.0);
    // fpos.x -= step(2.0, mod(ipos.x, 2.0));
    // fpos.x += 0.5*quadrant.y;
    // fpos.y += 0.5*cos(2.*uTime+PI*(quadrant.y-0.5));
    // color = vec3(roundedBoxSDF(fpos, vec2(0.5, 0.8), 0.2)*fpos.x); //cool mixing
    // // color = vec3(roundedBoxSDF(fpos, vec2(0.5, 0.8), 0.2));
    vec3 colorA = mix(mix(color1, color2, vec3(quadrant.x)), color3, vec3(quadrant.y));
    vec3 colorB = mix(mix(color2, color1, vec3(quadrant.x)), color3, 1.0-vec3(quadrant.y));
    color = mix(colorA, colorB, color);
    //color = vec3(parity);
    gl_FragColor = vec4(color, 1.0);
    //#include <colorspace_fragment>
}