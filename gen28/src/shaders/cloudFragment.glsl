uniform float uTime;

varying vec2 vUv;

#define PI 3.14159265359
#define ZERO 0
#define LOWQUALITY 0
//==========================================================================================
// general utilities
//==========================================================================================

float sdEllipsoidY( in vec3 p, in vec2 r )
{
    float k0 = length(p/r.xyx);
    float k1 = length(p/(r.xyx*r.xyx));
    return k0*(k0-1.0)/k1;
}
float sdEllipsoid( in vec3 p, in vec3 r )
{
    float k0 = length(p/r);
    float k1 = length(p/(r*r));
    return k0*(k0-1.0)/k1;
}

// return smoothstep and its derivative
vec2 smoothstepd( float a, float b, float x)
{
	if( x<a ) return vec2( 0.0, 0.0 );
	if( x>b ) return vec2( 1.0, 0.0 );
    float ir = 1.0/(b-a);
    x = (x-a)*ir;
    return vec2( x*x*(3.0-2.0*x), 6.0*x*(1.0-x)*ir );
}

mat3 setCamera( in vec3 ro, in vec3 ta, float cr )
{
	vec3 cw = normalize(ta-ro);
	vec3 cp = vec3(sin(cr), cos(cr),0.0);
	vec3 cu = normalize( cross(cw,cp) );
	vec3 cv = normalize( cross(cu,cw) );
    return mat3( cu, cv, cw );
}

//==========================================================================================
// hashes (low quality, do NOT use in production)
//==========================================================================================

float hash1( vec2 p )
{
    p  = 50.0*fract( p*0.3183099 );
    return fract( p.x*p.y*(p.x+p.y) );
}

float hash1( float n )
{
    return fract( n*17.0*fract( n*0.3183099 ) );
}

vec2 hash2( vec2 p ) 
{
    const vec2 k = vec2( 0.3183099, 0.3678794 );
    float n = 111.0*p.x + 113.0*p.y;
    return fract(n*fract(k*n));
}

//==========================================================================================
// noises
//==========================================================================================

// value noise, and its analytical derivatives
vec4 noised( in vec3 x )
{
    vec3 p = floor(x);
    vec3 w = fract(x);
    #if 1
    vec3 u = w*w*w*(w*(w*6.0-15.0)+10.0);
    vec3 du = 30.0*w*w*(w*(w-2.0)+1.0);
    #else
    vec3 u = w*w*(3.0-2.0*w);
    vec3 du = 6.0*w*(1.0-w);
    #endif

    float n = p.x + 317.0*p.y + 157.0*p.z;
    
    float a = hash1(n+0.0);
    float b = hash1(n+1.0);
    float c = hash1(n+317.0);
    float d = hash1(n+318.0);
    float e = hash1(n+157.0);
	float f = hash1(n+158.0);
    float g = hash1(n+474.0);
    float h = hash1(n+475.0);

    float k0 =   a;
    float k1 =   b - a;
    float k2 =   c - a;
    float k3 =   e - a;
    float k4 =   a - b - c + d;
    float k5 =   a - c - e + g;
    float k6 =   a - b - e + f;
    float k7 = - a + b + c - d + e - f - g + h;

    return vec4( -1.0+2.0*(k0 + k1*u.x + k2*u.y + k3*u.z + k4*u.x*u.y + k5*u.y*u.z + k6*u.z*u.x + k7*u.x*u.y*u.z), 
                      2.0* du * vec3( k1 + k4*u.y + k6*u.z + k7*u.y*u.z,
                                      k2 + k5*u.z + k4*u.x + k7*u.z*u.x,
                                      k3 + k6*u.x + k5*u.y + k7*u.x*u.y ) );
}

float noise( in vec3 x )
{
    vec3 p = floor(x);
    vec3 w = fract(x);
    
    #if 1
    vec3 u = w*w*w*(w*(w*6.0-15.0)+10.0);
    #else
    vec3 u = w*w*(3.0-2.0*w);
    #endif
    


    float n = p.x + 317.0*p.y + 157.0*p.z;
    
    float a = hash1(n+0.0);
    float b = hash1(n+1.0);
    float c = hash1(n+317.0);
    float d = hash1(n+318.0);
    float e = hash1(n+157.0);
	float f = hash1(n+158.0);
    float g = hash1(n+474.0);
    float h = hash1(n+475.0);

    float k0 =   a;
    float k1 =   b - a;
    float k2 =   c - a;
    float k3 =   e - a;
    float k4 =   a - b - c + d;
    float k5 =   a - c - e + g;
    float k6 =   a - b - e + f;
    float k7 = - a + b + c - d + e - f - g + h;

    return -1.0+2.0*(k0 + k1*u.x + k2*u.y + k3*u.z + k4*u.x*u.y + k5*u.y*u.z + k6*u.z*u.x + k7*u.x*u.y*u.z);
}

vec3 noised( in vec2 x )
{
    vec2 p = floor(x);
    vec2 w = fract(x);
    #if 1
    vec2 u = w*w*w*(w*(w*6.0-15.0)+10.0);
    vec2 du = 30.0*w*w*(w*(w-2.0)+1.0);
    #else
    vec2 u = w*w*(3.0-2.0*w);
    vec2 du = 6.0*w*(1.0-w);
    #endif
    
    float a = hash1(p+vec2(0,0));
    float b = hash1(p+vec2(1,0));
    float c = hash1(p+vec2(0,1));
    float d = hash1(p+vec2(1,1));

    float k0 = a;
    float k1 = b - a;
    float k2 = c - a;
    float k4 = a - b - c + d;

    return vec3( -1.0+2.0*(k0 + k1*u.x + k2*u.y + k4*u.x*u.y), 
                 2.0*du * vec2( k1 + k4*u.y,
                            k2 + k4*u.x ) );
}

float noise( in vec2 x )
{
    vec2 p = floor(x);
    vec2 w = fract(x);
    #if 1
    vec2 u = w*w*w*(w*(w*6.0-15.0)+10.0);
    #else
    vec2 u = w*w*(3.0-2.0*w);
    #endif

    float a = hash1(p+vec2(0,0));
    float b = hash1(p+vec2(1,0));
    float c = hash1(p+vec2(0,1));
    float d = hash1(p+vec2(1,1));
    
    return -1.0+2.0*(a + (b-a)*u.x + (c-a)*u.y + (a - b - c + d)*u.x*u.y);
}

//==========================================================================================
// fbm constructions
//==========================================================================================

const mat3 m3  = mat3( 0.00,  0.80,  0.60,
                      -0.80,  0.36, -0.48,
                      -0.60, -0.48,  0.64 );
const mat3 m3i = mat3( 0.00, -0.80, -0.60,
                       0.80,  0.36, -0.48,
                       0.60, -0.48,  0.64 );
const mat2 m2 = mat2(  0.80,  0.60,
                      -0.60,  0.80 );
const mat2 m2i = mat2( 0.80, -0.60,
                       0.60,  0.80 );

//------------------------------------------------------------------------------------------

float fbm_4( in vec2 x )
{
    float f = 1.9;
    float s = 0.55;
    float a = 0.0;
    float b = 0.5;
    for( int i=ZERO; i<4; i++ )
    {
        float n = noise(x);
        a += b*n;
        b *= s;
        x = f*m2*x;
    }
	return a;
}

float fbm_4( in vec3 x )
{
    float f = 2.0;
    float s = 0.5;
    float a = 0.0;
    float b = 0.5;
    for( int i=ZERO; i<4; i++ )
    {
        float n = noise(x);
        a += b*n;
        b *= s;
        x = f*m3*x;
    }
	return a;
}

vec4 fbmd_7( in vec3 x )
{
    float f = 1.92;
    float s = 0.5;
    float a = 0.0;
    float b = 0.5;
    vec3  d = vec3(0.0);
    mat3  m = mat3(1.0,0.0,0.0,
                   0.0,1.0,0.0,
                   0.0,0.0,1.0);
    for( int i=ZERO; i<7; i++ )
    {
        vec4 n = noised(x);
        a += b*n.x;          // accumulate values		
        d += b*m*n.yzw;      // accumulate derivatives
        b *= s;
        x = f*m3*x;
        m = f*m3i*m;
    }
	return vec4( a, d );
}

vec4 fbmd_8( in vec3 x )
{
    float f = 2.0;
    float s = 0.65;
    float a = 0.0;
    float b = 0.5;
    vec3  d = vec3(0.0);
    mat3  m = mat3(1.0,0.0,0.0,
                   0.0,1.0,0.0,
                   0.0,0.0,1.0);
    for( int i=ZERO; i<8; i++ )
    {
        vec4 n = noised(x);
        a += b*n.x;          // accumulate values		
        if( i<4 )
        d += b*m*n.yzw;      // accumulate derivatives
        b *= s;
        x = f*m3*x;
        m = f*m3i*m;
    }
	return vec4( a, d );
}

float fbm_9( in vec2 x )
{
    float f = 1.9;
    float s = 0.55;
    float a = 0.0;
    float b = 0.5;
    for( int i=ZERO; i<9; i++ )
    {
        float n = noise(x);
        a += b*n;
        b *= s;
        x = f*m2*x;
    }
    
	return a;
}

vec3 fbmd_9( in vec2 x )
{
    float f = 1.9;
    float s = 0.55;
    float a = 0.0;
    float b = 0.5;
    vec2  d = vec2(0.0);
    mat2  m = mat2(1.0,0.0,0.0,1.0);
    for( int i=ZERO; i<9; i++ )
    {
        vec3 n = noised(x);
        a += b*n.x;          // accumulate values		
        d += b*m*n.yz;       // accumulate derivatives
        b *= s;
        x = f*m2*x;
        m = f*m2i*m;
    }

	return vec3( a, d );
}

//==========================================================================================
// specifics to the actual painting
//==========================================================================================


//------------------------------------------------------------------------------------------
// global
//------------------------------------------------------------------------------------------

const vec3  kSunDir = vec3(-0.624695,0.468521,-0.624695);
const float kMaxTreeHeight = 4.8;
const float kMaxHeight = 840.0;

vec3 fog( in vec3 col, float t )
{
    vec3 ext = exp2(-t*0.00025*vec3(1,1.5,4)); 
    return col*ext + (1.0-ext)*vec3(0.55,0.55,0.58); // 0.55
}

//------------------------------------------------------------------------------------------
// clouds
//------------------------------------------------------------------------------------------

vec4 cloudsFbm( in vec3 pos )
{
    return fbmd_8(pos*0.0015+vec3(2.0,1.1,1.0)+0.07*vec3(-uTime,0.5*uTime,0.15*uTime));
}

vec4 cloudsMap( in vec3 pos, out float nnd )
{
    float d = abs(pos.y-900.0)-40.0;
    vec3 gra = vec3(0.0,sign(pos.y-900.0),0.0);
    
    vec4 n = cloudsFbm(pos);
    d += 400.0*n.x * (0.7+0.3*gra.y);
    
    if( d>0.0 ) return vec4(-d,0.0,0.0,0.0);
    
    nnd = -d;
    d = min(-d/100.0,0.25);
    
    //gra += 0.1*n.yzw *  (0.7+0.3*gra.y);
    
    return vec4( d, gra );
}

float terrainShadow( in vec3 ro, in vec3 rd, in float mint );

vec4 renderClouds( in vec3 ro, in vec3 rd, float tmin, float tmax, inout float resT, in vec2 px )
{
    vec4 sum = vec4(0.0);

    // bounding volume!!
    float tl = ( 600.0-ro.y)/rd.y;
    float th = (1200.0-ro.y)/rd.y;
    if( tl>0.0 ) tmin = max( tmin, tl ); else return sum;
    if( th>0.0 ) tmax = min( tmax, th );

    float t = tmin;
    //t += 1.0*hash1(gl_FragCoord.xy);
    float lastT = -1.0;
    float thickness = 0.0;
    for(int i=ZERO; i<128; i++)
    { 
        vec3  pos = ro + t*rd; 
        float nnd;
        vec4  denGra = cloudsMap( pos, nnd ); 
        float den = denGra.x;
        float dt = max(0.2,0.011*t);
        //dt *= hash1(px+float(i));
        if( den>0.001 ) 
        { 
            float kk;
            cloudsMap( pos+kSunDir*70.0, kk );
            float sha = 1.0-smoothstep(-200.0,200.0,kk); sha *= 1.5;
            
            vec3 nor = normalize(denGra.yzw);
            float dif = clamp( 0.4+0.6*dot(nor,kSunDir), 0.0, 1.0 )*sha; 
            float fre = clamp( 1.0+dot(nor,rd), 0.0, 1.0 )*sha;
            float occ = 0.2+0.7*max(1.0-kk/200.0,0.0) + 0.1*(1.0-den);
            // lighting
            vec3 lin  = vec3(0.0);
                 lin += vec3(0.70,0.80,1.00)*1.0*(0.5+0.5*nor.y)*occ;
                 lin += vec3(0.10,0.40,0.20)*1.0*(0.5-0.5*nor.y)*occ;
                 lin += vec3(1.00,0.95,0.85)*3.0*dif*occ + 0.1;

            // color
            vec3 col = vec3(0.8,0.8,0.8)*0.45;

            col *= lin;

            col = fog( col, t );

            // front to back blending    
            float alp = clamp(den*0.5*0.125*dt,0.0,1.0);
            col.rgb *= alp;
            sum = sum + vec4(col,alp)*(1.0-sum.a);

            thickness += dt*den;
            if( lastT<0.0 ) lastT = t;            
        }
        else 
        {
            dt = abs(den)+0.2;

        }
        t += dt;
        if( sum.a>0.995 || t>tmax ) break;
    }
    
    //resT = min(resT, (150.0-ro.y)/rd.y );
    if( lastT>0.0 ) resT = min(resT,lastT);
    //if( lastT>0.0 ) resT = mix( resT, lastT, sum.w );
    
    
    sum.xyz += max(0.0,1.0-0.0125*thickness)*vec3(1.00,0.60,0.40)*0.3*pow(clamp(dot(kSunDir,rd),0.0,1.0),32.0);

    return clamp( sum, 0.0, 1.0 );
}


//------------------------------------------------------------------------------------------
// terrain
//------------------------------------------------------------------------------------------

vec2 terrainMap( in vec2 p )
{
    float e = fbm_9( p/2000.0 + vec2(1.0,-2.0) );
    float a = 1.0-smoothstep( 0.12, 0.13, abs(e+0.12) ); // flag high-slope areas (-0.25, 0.0)
    e = 600.0*e + 600.0;
    
    // cliff
    e += 90.0*smoothstep( 552.0, 594.0, e );
    //e += 90.0*smoothstep( 550.0, 600.0, e );
    
    return vec2(e,a);
}

vec4 terrainMapD( in vec2 p )
{
    vec3 e = fbmd_9( p/2000.0 + vec2(1.0,-2.0) );
    e.x  = 600.0*e.x + 600.0;
    e.yz = 600.0*e.yz;

    // cliff
    vec2 c = smoothstepd( 550.0, 600.0, e.x );
	e.x  = e.x  + 90.0*c.x;
	e.yz = e.yz + 90.0*c.y*e.yz;     // chain rule
    
    e.yz /= 2000.0;
    return vec4( e.x, normalize( vec3(-e.y,1.0,-e.z) ) );
}

vec3 terrainNormal( in vec2 pos )
{
#if 1
    return terrainMapD(pos).yzw;
#else    
    vec2 e = vec2(0.03,0.0);
	return normalize( vec3(terrainMap(pos-e.xy).x - terrainMap(pos+e.xy).x,
                           2.0*e.x,
                           terrainMap(pos-e.yx).x - terrainMap(pos+e.yx).x ) );
#endif    
}

float terrainShadow( in vec3 ro, in vec3 rd, in float mint )
{
    float res = 1.0;
    float t = mint;
#ifdef LOWQUALITY
    for( int i=ZERO; i<32; i++ )
    {
        vec3  pos = ro + t*rd;
        vec2  env = terrainMap( pos.xz );
        float hei = pos.y - env.x;
        res = min( res, 32.0*hei/t );
        if( res<0.0001 || pos.y>kMaxHeight ) break;
        t += clamp( hei, 2.0+t*0.1, 100.0 );
    }
#else
    for( int i=ZERO; i<128; i++ )
    {
        vec3  pos = ro + t*rd;
        vec2  env = terrainMap( pos.xz );
        float hei = pos.y - env.x;
        res = min( res, 32.0*hei/t );
        if( res<0.0001 || pos.y>kMaxHeight  ) break;
        t += clamp( hei, 0.5+t*0.05, 25.0 );
    }
#endif
    return clamp( res, 0.0, 1.0 );
}

vec2 raymarchTerrain( in vec3 ro, in vec3 rd, float tmin, float tmax )
{
    // bounding plane
    float tp = (kMaxHeight+kMaxTreeHeight-ro.y)/rd.y;
    if( tp>0.0 ) tmax = min( tmax, tp );
    
    // raymarch
    float dis, th;
    float t2 = -1.0;
    float t = tmin; 
    float ot = t;
    float odis = 0.0;
    float odis2 = 0.0;
    for( int i=ZERO; i<400; i++ )
    {
        th = 0.001*t;

        vec3  pos = ro + t*rd;
        vec2  env = terrainMap( pos.xz );
        float hei = env.x;

        // tree envelope
        float dis2 = pos.y - (hei+kMaxTreeHeight*1.1);
        if( dis2<th ) 
        {
            if( t2<0.0 )
            {
                t2 = ot + (th-odis2)*(t-ot)/(dis2-odis2); // linear interpolation for better accuracy
            }
        }
        odis2 = dis2;
        
        // terrain
        dis = pos.y - hei;
        if( dis<th ) break;
        
        ot = t;
        odis = dis;
        t += dis*0.8*(1.0-0.75*env.y); // slow down in step areas
        if( t>tmax ) break;
    }

    if( t>tmax ) t = -1.0;
    else t = ot + (th-odis)*(t-ot)/(dis-odis); // linear interpolation for better accuracy
    
    return vec2(t,t2);
}

//------------------------------------------------------------------------------------------
// trees
//------------------------------------------------------------------------------------------

float treesMap( in vec3 p, in float rt, out float oHei, out float oMat, out float oDis )
{
    oHei = 1.0;
    oDis = 0.0;
    oMat = 0.0;
        
    float base = terrainMap(p.xz).x; 
    
    float bb = fbm_4(p.xz*0.075);

    float d = 20.0;
    vec2 n = floor( p.xz/2.0 );
    vec2 f = fract( p.xz/2.0 );
    for( int j=0; j<=1; j++ )
    for( int i=0; i<=1; i++ )
    {
        vec2  g = vec2( float(i), float(j) ) - step(f,vec2(0.5));
        vec2  o = hash2( n + g );
        vec2  v = hash2( n + g + vec2(13.1,71.7) );
        vec2  r = g - f + o;

        float height = kMaxTreeHeight * (0.4+0.8*v.x);
        float width = 0.5 + 0.2*v.x + 0.3*v.y;

        if( bb<0.0 ) width *= 0.5; else height *= 0.7;
        
        vec3  q = vec3(r.x,p.y-base-height*0.5,r.y);
        
        float k = sdEllipsoidY( q, vec2(width,0.5*height) );

        if( k<d )
        { 
            d = k;
            oMat = 0.5*hash1(n+g+111.0);
            if( bb>0.0 ) oMat += 0.5;
            oHei = (p.y - base)/height;
            oHei *= 0.5 + 0.5*length(q) / width;
        }
    }

    // distort ellipsoids to make them look like trees (works only in the distance really)
    if( rt<1200.0 )
    {
        p.y -= 600.0;
        float s = fbm_4( p*3.0 );
        s = s*s;
        float att = 1.0-smoothstep(100.0,1200.0,rt);
        d += 4.0*s*att;
        oDis = s*att;
    }
    
    return d;
}

float treesShadow( in vec3 ro, in vec3 rd )
{
    float res = 1.0;
    float t = 0.02;
#ifdef LOWQUALITY
    for( int i=ZERO; i<64; i++ )
    {
        float kk1, kk2, kk3;
        vec3 pos = ro + rd*t;
        float h = treesMap( pos, t, kk1, kk2, kk3 );
        res = min( res, 32.0*h/t );
        t += h;
        if( res<0.001 || t>50.0 || pos.y>kMaxHeight+kMaxTreeHeight ) break;
    }
#else
    for( int i=ZERO; i<150; i++ )
    {
        float kk1, kk2, kk3;
        float h = treesMap( ro + rd*t, t, kk1, kk2, kk3 );
        res = min( res, 32.0*h/t );
        t += h;
        if( res<0.001 || t>120.0 ) break;
    }
#endif
    return clamp( res, 0.0, 1.0 );
}


void main()
{
    vec2 uv = vUv;
    vec3 ro = vec3(0.0, 401.5, 6.0);
    vec3 blue = vec3(0.42,0.62,1.);
    float resT = 2000.0;
    gl_FragColor = renderClouds( ro, vec3(vUv, 1.5) , 0.0, resT, resT, vUv );
    gl_FragColor = mix(gl_FragColor, vec4(blue, 1.0), 1.0 - gl_FragColor.w);
    //#include <colorspace_fragment>
}