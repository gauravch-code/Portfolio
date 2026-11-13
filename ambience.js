// Optional sound: a forest stream with birdsong, over the soft low body of a waterfall.
// At night the birds recede and the water is what remains. Nothing loads or plays until the visitor turns it on.

export function createAmbience() {
  let ctx, master, forestTone, forestLevel, buffers;
  let mood = "day";
  let playing = false;
  let stopLoops = [];

  // Equal-power fade curves, so overlapping loop ends keep a steady loudness.
  const steps = 64;
  const fadeIn = Float32Array.from({ length: steps }, (_, i) => Math.sin((i / (steps - 1)) * Math.PI * 0.5));
  const fadeOut = Float32Array.from(fadeIn).reverse();

  // Play a recording forever by overlapping each pass with the next.
  function loop(buffer, destination, fade) {
    let stopped = false;
    let timer;
    const period = buffer.duration - fade;
    const pass = (when) => {
      if (stopped) return;
      const source = ctx.createBufferSource();
      const gain = ctx.createGain();
      source.buffer = buffer;
      gain.gain.value = 0;
      gain.gain.setValueCurveAtTime(fadeIn, when, fade);
      gain.gain.setValueCurveAtTime(fadeOut, when + period, fade);
      source.connect(gain).connect(destination);
      source.start(when);
      source.stop(when + buffer.duration + 0.1);
      timer = setTimeout(() => pass(when + period), (when + period - ctx.currentTime - 1) * 1000);
    };
    pass(ctx.currentTime + 0.05);
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }

  function tune(seconds = 2.4) {
    if (!ctx) return;
    const night = mood === "night";
    forestTone.frequency.setTargetAtTime(night ? 1500 : 14000, ctx.currentTime, seconds / 3);
    forestLevel.gain.setTargetAtTime(night ? 0.6 : 0.85, ctx.currentTime, seconds / 3);
  }

  async function build() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    forestTone = ctx.createBiquadFilter();
    forestTone.type = "lowpass";
    forestLevel = ctx.createGain();
    forestTone.connect(forestLevel).connect(master);

    const fallsLevel = ctx.createGain();
    fallsLevel.gain.value = 0.75;
    fallsLevel.connect(master);

    const load = async (url) => ctx.decodeAudioData(await (await fetch(url)).arrayBuffer());
    const [forest, falls] = await Promise.all([load("./assets/forest.m4a"), load("./assets/falls.m4a")]);
    buffers = [
      [forest, forestTone, 5],
      [falls, fallsLevel, 4],
    ];
  }

  return {
    get playing() {
      return playing;
    },
    async start() {
      if (!ctx) await build();
      await ctx.resume();
      playing = true;
      tune(0.1);
      stopLoops.forEach((stop) => stop());
      stopLoops = buffers.map(([buffer, destination, fade]) => loop(buffer, destination, fade));
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(0.6, ctx.currentTime, 1.4);
    },
    stop() {
      if (!ctx) return;
      playing = false;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.35);
      setTimeout(() => {
        if (playing) return;
        stopLoops.forEach((stop) => stop());
        stopLoops = [];
        ctx.suspend();
      }, 1600);
    },
    setMood(name) {
      mood = name;
      tune();
    },
  };
}
