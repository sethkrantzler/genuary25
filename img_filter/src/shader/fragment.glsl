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
    float gridSize = 1.38;
    vec2 grid = vec2(gridSize);
    vec2 gridPos = uv * grid;
    vec2 ipos = floor(gridPos);
    vec2 fpos = fract(gridPos);
    gridPos-=vec2(gridSize*0.1, 0.15);
    vec2 quadrant = mod(ipos, 2.0);
    float parity = 1.0 - step(2.0, mod(ipos.y, gridSize*0.5));
    vec4 color = texture2D(uTexture, gridPos);
    
    float brightness = dot(color.rgb, vec3(quadrant.y));

    vec4 sortedColor = vec4(color.rgb , 1.0);

    gl_FragColor = sortedColor;
    //#include <colorspace_fragment>
}
