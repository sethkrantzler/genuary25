uniform float uTime;
uniform sampler2D uTexture; 

varying vec2 vUv;

#define PI 3.14159265359

float stroke(float x, float s, float w) {
    float d = step(s, x+w*.5) - step(s, x-w*.5);
    return clamp(d, 0., 1.);
}

float circleSDF(vec2 uv, vec2 origin) {
    return length(uv - origin);
}

float circle(float r, vec2 uv, vec2 origin, bool invert) {
    float sdf = circleSDF(uv, origin);
    if (invert) return step(r, sdf);
    return 1.0 - step(r, sdf);
}

void main()
{
    vec2 uv = vUv;
    vec2 grid = vec2(8.0, 8.0);
    vec2 gridPos = uv * grid;
    vec2 ipos = floor(gridPos);
    vec2 fpos = fract(gridPos);
    gridPos-=vec2(4.0, 4.0);
    vec2 quadrant = mod(ipos, 2.0);
    float parity = 1.0 - step(2.0, mod(ipos.y, 4.0));
    vec4 color = texture2D(uTexture, gridPos);
    
    float brightness = dot(color.rgb, vec3(quadrant.y));

    vec4 sortedColor = vec4(color.rgb *0.5*uTime*(vUv.y+uTime*0.001), 1.0);

    gl_FragColor = sortedColor;
    //#include <colorspace_fragment>
}
