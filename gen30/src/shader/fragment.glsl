uniform float uTime;
uniform sampler2D uStarbucksPointsTexture; 
uniform int uNumStarbucks;
uniform sampler2D uChipotlePointsTexture; 
uniform int uNumChipotle; 

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
    vec3 color = vec3(0.0);

    for (int i = 0; i < uNumStarbucks; i++) {
        float index = float(i) / float(uNumStarbucks);
        vec2 texCoord = vec2(index, 0.0);
        
        vec4 pointData = texture2D(uStarbucksPointsTexture, texCoord);
        vec2 point = pointData.yx;

        // Draw circle at the sampled point position
        color += vec3(0.1, 0.64, 0.23)*circle(0.0025*(1.+cos(uTime-PI*0.5)), uv, point, false);
    }

    for (int i = 0; i < uNumChipotle; i++) {
        float index = float(i) / float(uNumChipotle);
        vec2 texCoord = vec2(index, 0.0);
        
        vec4 pointData = texture2D(uChipotlePointsTexture, texCoord);
        vec2 point = pointData.yx;

        // Draw circle at the sampled point position
        color += vec3(0.7, 0.34, 0.12)*circle(0.0025*(1.+sin(uTime+PI)), uv, point, false);
    }
    gl_FragColor = vec4(color, 1.0);
}
