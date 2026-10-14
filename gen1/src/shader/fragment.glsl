uniform float uTime;

varying vec2 vUv;

#define PI 3.14159265359
#define STYLE true

vec3 palette( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d )
{
    return a + b*cos( 6.283185*(c*t+d) );
}


vec3 colorA = vec3(0.5); // contrast
vec3 colorB = vec3(0.5); // brightness
vec3 colorC = vec3(1.0); // phase so it has to be in int or .5 to be cont.
vec3 colorD = vec3(0.48, 0.144, 0.93); // main hues

void main()
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = vUv;
    vec2 grid = vec2(1.0, 10.0);
    if (STYLE) {
        grid.x+=8.;
    }
    uv*=grid;
    vec2 ipos = floor(uv);
    vec2 fpos = fract(uv);
    vec3 col = vec3(0.);
    
    if (STYLE) {
        col = palette(fpos.x, colorA, colorB, colorC+0.5*smoothstep(-1., 1., sin(2.*3.14159*(ipos.y/grid.y)+uTime)), colorD);
        col *= step(0.05,fpos.y);
        col *= step(0.05,1.0 - fpos.y);
        col *= smoothstep(0., 0.05,fpos.x);
        col *= smoothstep(0., 0.05,1.0-fpos.x);
    } else {
        col = palette(fpos.x, colorA, colorB, colorC+0.5*smoothstep(-1., 1., sin(10.*3.14159*(ipos.y/grid.y)+uTime)), colorD);
        col *= step(0.1,fpos.y);
        col *= smoothstep(0., 0.01,fpos.x);
        col *= smoothstep(0., 0.01,1.0-fpos.x);
    }

    // Output to screen
    gl_FragColor = vec4(col,1.0);
}