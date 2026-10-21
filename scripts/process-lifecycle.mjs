// Only processes spawned by this development session are passed here.
export function stopChild(child) {
  if (!child?.pid || child.exitCode !== null || child.signalCode !== null)
    return Promise.resolve();
  return new Promise((resolve) => {
    const timeout = setTimeout(() => child.kill("SIGKILL"), 5000);
    child.once("exit", () => {
      clearTimeout(timeout);
      resolve();
    });
    if (child.connected) {
      child.send({ type: "shutdown" }, (error) => {
        if (error) child.kill("SIGTERM");
      });
    } else {
      child.kill("SIGTERM");
    }
  });
}
