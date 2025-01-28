uniform float uTime;

varying vec2 vUv;

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

float flip (float v, float pct) {
    return mix(v, 1.0-v, pct);
}

vec3 bridge(vec3 c, float d, float s, float w) {
    c *= 1.-stroke(d,s,w*2.0);
    return c + stroke(d,s,w);
}

float random (in float x) {
    return fract(sin(x)*1e4);
}

float random (in vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233)))* 43758.5453123);
}

float pattern(vec2 st, vec2 v, float t) {
    vec2 p = floor(st+v);
    return step(t, random(100.+p*.00005)+random(p.x)*0.6 );
}

void main()
{
    vec2 uv = vUv;
    uv.x = flip(vUv.x, step(0.5, vUv.y));
    vec2 offset = vec2(0.2,0.);
    vec3 color = vec3(0.);
    float left = circleSDF(uv+offset);
    float right = circleSDF(uv-offset);
    color.b += stroke(left, .4, .075);
    color.b += stroke(right, .4, .075);
    color.b = bridge(color, right, .4, .075).b;

    vec2 st = vUv;
    st *= vec2(25.,50.);
    vec2 ipos= floor(st);
    vec2 fpos = fract(st);
    vec2 vel = vec2(uTime*2.*25.0); // time
    vel *= vec2(-1.,0.0) * random(1.0+ipos.y); // direction
    color.r += pattern(st+offset,vel,0.9);
    color.g += pattern(st,vel,0.9);
    color.b += pattern(st-offset,vel,0.9);
    // color.r += pattern(st+offset,vel,0.2)*step(0.2, (mod(uTime, 5.))/5.);
    // color.g += pattern(st,vel,0.5)*step(0.2, (mod(uTime, 7.))/8.);
    // color.b += pattern(st-offset,vel,0.8)*step(0.2, (mod(uTime, 4.))/3.);
    // color.b = step(0.1, color.b);
    //color *= stroke(left*right, .4, .075);
   // color *= step(0.3, fpos.y);

    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
}