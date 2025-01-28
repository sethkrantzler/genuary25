const SlidingNoiseShader = {
    fragmentShader: `
        precision highp float;
        uniform float u_time;
        uniform vec2 u_resolution;
        uniform sampler2D u_texture;

        // Random number generation
        float rand(vec2 co) {
            return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
        }

        void main() {
            // Convert coordinates
            vec2 uv = gl_FragCoord.xy / u_resolution.xy;
            vec3 color = texture2D(u_texture, uv).rgb;

            // Check for black pixel
            if (color == vec3(0.0, 0.0, 0.0)) {
                gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
            } else {
                uv.y += u_time * 0.1; // Adjust scrolling speed here
                gl_FragColor = vec4(vec3(rand(uv)), 1.0);
            }
        }
    `
};

export default SlidingNoiseShader;
