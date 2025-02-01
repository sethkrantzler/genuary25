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

float roundedBoxSDF(vec2 uv, vec2 origin, vec2 size, float radius) {
    vec2 d = abs(uv-origin) - (size*0.5) + vec2(radius);
    return step(0.0, min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - radius);
}

float sdfBox(vec2 uv, vec2 origin, vec2 size) {
    // Translate the UV coordinate to the box's local space, us the bottom left as the origin for grid alignment
    vec2 p = uv - (origin+0.5*size);
    
    // Calculate the half size of the box
    vec2 halfSize = size * 0.5;
    
    // Calculate the distance to the edges of the box
    vec2 d = abs(p) - halfSize;
    
    // Calculate the signed distance
    float sdf = step(0.0, length(max(d, 0.0)) + min(max(d.x, d.y), 0.0));
    
    return sdf;
}


mat2 rotate2d(float _angle){
    return mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle));
}

vec2 rotateAroundPoint(vec2 point, float angle, vec2 center) {
    // Translate the point to the center
    vec2 translatedPoint = point - center;
    
    // Apply the rotation
    mat2 rotationMatrix = mat2(cos(angle), -sin(angle),
                               sin(angle), cos(angle));
    vec2 rotatedPoint = rotationMatrix * translatedPoint;
    
    // Translate the point back
    return rotatedPoint + center;
}


// we want to have 3 colors, two fun colors, and one background color
vec3 color1 = vec3(0.0, 0.6, 1.0);
vec3 color2 = vec3(0.0078, 0.494, 0.6392);
vec3 color3 = vec3(0.20, 0.20, 0.20);

void main()
{
    vec2 uv = vUv;
    float animationTime = smoothstep(0.05, 1., abs(sin(uTime*0.1*PI)));
    vec2 grid = vec2(4.0, 4.0);
    vec2 gridPos = uv * grid;
    vec2 ipos = floor(gridPos);
    vec2 fpos = fract(gridPos);
    vec3 color = vec3(1.);
    float parityX = mod(ipos.x, 2.0);
    float parityY = mod(ipos.y, 2.0);
    float direction = parityX*2. - 1.;
    fpos = rotateAroundPoint(fpos, (parityX+parityY)*PI/2., vec2(0.5));
    //fpos = rotateAroundPoint(fpos, direction*animationTime*(parityX+parityY)*PI/2., vec2(0.5));
    float tileSize = 26.5;
    float stripeWidth = 1.5/tileSize;
    float cornerSize = 6.5/tileSize;
    float stripeLength = 19.5/tileSize;
    float a = stripeWidth;
    float b = 2.5/tileSize;
    float c = 3.5/tileSize;
    float d = 4.5/tileSize;
    float e = 5.5/tileSize;
    float opacity = 1.0;;
    vec2 boxThickness = vec2(stripeWidth, stripeLength);
    //color1 = mix(color1, vec3(random(ipos.x), random(ipos.y), random(ipos.x+ipos.y)), 1.0-animationTime);
    color *= vec3(sdfBox(fpos, vec2(cornerSize, cornerSize), vec2(boxThickness.x, boxThickness.y)));

    // vertical lines
    color = vec3(sdfBox(fpos, vec2(cornerSize, b), boxThickness));
    color *= vec3(sdfBox(fpos, vec2(cornerSize+2.*stripeWidth, d), boxThickness));
    color *= vec3(sdfBox(fpos, vec2(cornerSize+4.*stripeWidth, a), boxThickness));
    color *= vec3(sdfBox(fpos, vec2(cornerSize+8.*stripeWidth, c), boxThickness));
    // // horizontal lines
    color *= vec3(sdfBox(fpos, vec2(c, cornerSize), boxThickness.yx));
    color *= vec3(sdfBox(fpos, vec2(e, cornerSize+2.*stripeWidth), boxThickness.yx));
    color *= vec3(sdfBox(fpos, vec2(a, cornerSize+4.*stripeWidth), boxThickness.yx));
    color *= vec3(sdfBox(fpos, vec2(d, cornerSize+6.*stripeWidth), boxThickness.yx));
    color *= vec3(sdfBox(fpos, vec2(b, cornerSize+8.*stripeWidth), boxThickness.yx));
    color *= sdfBox(fpos, vec2(cornerSize+6.*stripeWidth, e), boxThickness); // special block
    color += color1*(1.0-sdfBox(fpos, vec2(cornerSize+6.*stripeWidth, e), boxThickness)); // special block

    if (ipos.x == 2.0 && ipos.y == 2.0) {
        // opacity *= animationTime;
        color = mix(color, color2, step(1.0, color)); 
        color = mix(vec3(1.0), color, step(0.00001, color));
        color *= sdfBox(fpos, vec2(cornerSize+6.*stripeWidth, e), boxThickness); 
        color += color3*(1.0-sdfBox(fpos, vec2(cornerSize+6.*stripeWidth, e), boxThickness));    
    }
    gl_FragColor = vec4(color, opacity);
    #include <colorspace_fragment>
}