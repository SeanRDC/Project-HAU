import * as THREE from 'three';

/** Keep PCF grain attached to surfaces rather than to the moving screen. */
export function stablePixelShadows(): void {
  const chunk = THREE.ShaderChunk.shadowmap_pars_fragment;
  const screenNoise = 'interleavedGradientNoise( gl_FragCoord.xy )';
  const worldNoise = 'interleavedGradientNoise( floor( shadowCoord.xy * shadowMapSize ) )';
  if (chunk.includes(screenNoise)) THREE.ShaderChunk.shadowmap_pars_fragment = chunk.replace(screenNoise, worldNoise);
}
