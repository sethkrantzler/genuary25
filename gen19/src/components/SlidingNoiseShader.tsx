import React, { forwardRef, useMemo, useEffect } from 'react';
import { Texture, Uniform, Vector2 } from 'three';
import { useThree } from '@react-three/fiber';
import { SlidingNoiseEffect } from '../effects/SlidingNoiseEffect';

const SlidingNoise = forwardRef(({ distortion = 3.0, distortion2 = 5.0, speed = 0.2, rollSpeed = 0.1 }, ref) => {
  const effect = useMemo(() => new SlidingNoiseEffect({ distortion, distortion2, speed, rollSpeed }), [
    distortion,
    distortion2,
    speed,
    rollSpeed
  ])
  return <primitive ref={ref} object={effect} dispose={null} />
})

export default SlidingNoise;
