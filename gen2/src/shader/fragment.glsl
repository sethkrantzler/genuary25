uniform float iTime;

varying vec2 vUv;

vec3 palette( in float t)
{
    vec3 d = vec3(.855, 0.602, 0.6);
    return vec3(0.5) + vec3(1.)*cos( 6.283185*(vec3(-3.5)*t+d));
}

float stroke(float x, float size, float w) {
    float d = smoothstep(size -0.01 ,size, x+w*.5) - smoothstep(size, size+0.01, x-w*.5);
    return clamp(d, 0., 1.);
}

float flowerSDF(vec2 st, int N) {
    st = st*2.-1.;
    float r = length(st*2.);
    r=sin(1.25*r+iTime);
    float a = iTime+atan(st.y,st.x);
    float v = float(N)*.5;
    return 1.0-(abs(cos(a*v))*.5+.5)/r;
}


void main()
{
    vec2 uv = vUv-0.5;
    vec2 uv0 = uv;
    vec2 grid = vec2(1.0, 1.0); // just changing y makes it kinda 3d platform
    uv+=0.01*sin(iTime);
    float q = abs(flowerSDF(uv+0.5, 5));
    q=.01/q;
    vec3 col = vec3(length(uv0));
    
    col+=palette(q);
    col*=vec3(1.0-palette(stroke(length(uv0), 1.25*abs(sin(length(uv0)+0.5*iTime)), 0.15)));

    // Output to screen
    gl_FragColor = vec4(col, smoothstep(0.1, 1.0, length(col)));
}