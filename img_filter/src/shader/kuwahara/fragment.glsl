
uniform sampler2D uTexture;
uniform vec2 uResolution;
varying vec2 vUv;

void main() {
    vec2 uv = vUv;
    
    vec2 d = 1.0 / uResolution.xy;
    vec3 Sx = (
        1.0 * texture2D(uTexture, uv + vec2(-d.x, -d.y)).rgb +
        2.0 * texture2D(uTexture, uv + vec2(-d.x, 0.0)).rgb +
        1.0 * texture2D(uTexture, uv + vec2(-d.x, d.y)).rgb +
        -1.0 * texture2D(uTexture, uv + vec2(d.x, -d.y)).rgb +
        -2.0 * texture2D(uTexture, uv + vec2(d.x, 0.0)).rgb +
        -1.0 * texture2D(uTexture, uv + vec2(d.x, d.y)).rgb
    ) / 4.0;

    vec3 Sy = (
        1.0 * texture2D(uTexture, uv + vec2(-d.x, -d.y)).rgb +
        2.0 * texture2D(uTexture, uv + vec2(0.0, -d.y)).rgb +
        1.0 * texture2D(uTexture, uv + vec2(d.x, -d.y)).rgb +
        -1.0 * texture2D(uTexture, uv + vec2(-d.x, d.y)).rgb +
        -2.0 * texture2D(uTexture, uv + vec2(0.0, d.y)).rgb +
        -1.0 * texture2D(uTexture, uv + vec2(d.x, d.y)).rgb
    ) / 4.0;

    vec3 g = vec3(dot(Sx, Sx), dot(Sy, Sy), dot(Sx, Sy));
    
    vec4 texColor = texture2D(uTexture, uv);
    gl_FragColor = vec4(texColor.rgb * g.r, 1.0);
    #include <colorspace_fragment>

}