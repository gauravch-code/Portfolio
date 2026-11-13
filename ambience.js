// Optional sound: a lofi track over a soft bed of falling water.
// At night the music turns warmer and quieter. Nothing loads or plays until the visitor turns it on.

export function createAmbience() {
  let ctx, master, musicTone, musicLevel, buffers;
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
    musicTone.frequency.setTargetAtTime(night ? 2200 : 12000, ctx.currentTime, seconds / 3);
    musicLevel.gain.setTargetAtTime(night ? 0.62 : 0.8, ctx.currentTime, seconds / 3);
  }

  async function build() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    musicTone = ctx.createBiquadFilter();
    musicTone.type = "lowpass";
    musicLevel = ctx.createGain();
    musicTone.connect(musicLevel).connect(master);

    // The water sits well under the music: dulled, and about a third as loud.
    const waterTone = ctx.createBiquadFilter();
    waterTone.type = "lowpass";
    waterTone.frequency.value = 1500;
    const waterLevel = ctx.createGain();
    waterLevel.gain.value = 0.3;
    waterTone.connect(waterLevel).connect(master);

    const load = async (url) => ctx.decodeAudioData(await (await fetch(url)).arrayBuffer());
    const [music, water] = await Promise.all([load("./assets/lofi.m4a"), load("./assets/water.m4a")]);
    buffers = [
      [music, musicTone, 4],
      [water, waterTone, 2.5],
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
      master.gain.setTargetAtTime(0.6, ctx.currentTime, 1.2);
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
