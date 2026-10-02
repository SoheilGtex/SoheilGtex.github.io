// Fixed connectivity; vertex displacements are conceptual state, not telemetry.
export const ANCHORS = Object.freeze([[38,126],[125,58],[145,193],[226,113],[292,48],[327,188],[384,112]].map(Object.freeze));
export const EDGES = Object.freeze([[0,1],[0,2],[0,3],[1,3],[1,4],[2,3],[2,5],[3,4],[3,5],[4,6],[5,6]].map(Object.freeze));
export const KAPPA = 5;
export const ETA = 1.2;
export const MAX_STEP = .04;
export const MAX_DISPLACEMENT = 26;
export const restState = () => ANCHORS.map(() => [0,0]);
export function boundedOffset(x,y) {
  const length = Math.hypot(x,y);
  const scale = length > MAX_DISPLACEMENT ? MAX_DISPLACEMENT / length : 1;
  return [x*scale,y*scale];
}
// Explicit Euler for e' = -(kappa I + eta L)e; maximum graph degree is 5.
// h <= .04 < 1/(kappa + 2 eta d_max), so every eigenmode contracts.
export function relax(state,seconds,held=-1) {
  const step=Math.min(MAX_STEP,Math.max(0,seconds));
  const laplacian=state.map(() => [0,0]);
  for (const [a,b] of EDGES) for (let d=0;d<2;d++) {
    const delta=state[a][d]-state[b][d];
    laplacian[a][d]+=delta;laplacian[b][d]-=delta;
  }
  return state.map((point,i) => i===held ? [...point] : point.map((value,d) => value-step*(KAPPA*value+ETA*laplacian[i][d])));
}
export const displacementNorm = state => Math.sqrt(state.reduce((sum,[x,y]) => sum+x*x+y*y,0));
export function gaussianImpulse(random=Math.random) {
  // One clipped Gaussian impulse. No continuing random motion.
  const u=Math.max(Number.EPSILON,random()), angle=2*Math.PI*random();
  const radius=8*Math.sqrt(-2*Math.log(u));
  return boundedOffset(radius*Math.cos(angle),radius*Math.sin(angle));
}
