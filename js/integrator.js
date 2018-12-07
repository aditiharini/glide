function eulerStep(current, change, timestep) {
    current.add(change.multiplyScalar(timestep));
}
