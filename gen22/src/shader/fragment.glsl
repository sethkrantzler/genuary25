uniform float uTime;
varying vec2 vUv;
vec3 color1, color2, color3;

float plot(vec2 uv, float pct) {
    return smoothstep(pct - 0.01, pct, uv.y)- smoothstep(pct, pct+0.01, uv.y);
}

void main() {
    color1 = vec3(0.73, 0.49, 0.34);
    color2 = vec3(0.31, 0.3, 0.46);
    color3 = vec3(1.0, 0.321, 0.34);
    vec3 strength = vec3(vUv.x);
    strength.r = pow(cos(3.14*vUv.x*0.2+uTime), 2.);
    strength.g = pow(cos(3.14*vUv.x*0.5+uTime), 2.);
    strength.b = pow(cos(3.14*vUv.x*0.8+uTime), 2.);
    vec3 color = mix(color1, color2, strength);

    color = mix(color, vec3(1.0-color.x, 1.-color.y, 1.0-color.z), plot(vUv, strength.r));
    color = mix(color, vec3(1.0-color.y, 1.-color.z, 1.0-color.x), plot(vUv, strength.g));
    color = mix(color, vec3(1.0-color.z, 1.-color.x, 1.0-color.y), plot(vUv, strength.b));

    gl_FragColor = vec4(color, 1.0);
}