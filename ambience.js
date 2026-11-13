// Ambient sound from two real recordings: falling water and a dawn chorus.
// At night the birds fade out, the water softens, and crickets take over.
// Nothing loads or plays until the visitor turns it on.

export function createAmbience() {
  let ctx, master, waterTone, waterLevel, birdLevel, buffers;
  let mood = "dawn";
  let playing = false;
  let stopLoops = [];
  let cricketTimer;
  const rand = (a, b) => a + Math.random() * (b - a);

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

  function chirp(at, pitch, pan) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const panner = ctx.createStereoPanner();
    osc.frequency.value = pitch;
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(0.012, at + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.04);
    panner.pan.value = pan;
    osc.connect(gain).connect(panner).connect(master);
    osc.start(at);
    osc.stop(at + 0.06);
  }
  function crickets() {
    clearTimeout(cricketTimer);
    if (!playing) return;
    if (mood === "night") {
      const start = ctx.currentTime + 0.05;
      const pitch = rand(4100, 4500);
      const pan = rand(-0.7, 0.7);
      for (let burst = 0; burst < 3; burst++) {
        for (let pulse = 0; pulse < 3; pulse++) chirp(start + burst * 0.62 + pulse * 0.058, pitch, pan);
      }
    }
    cricketTimer = setTimeout(crickets, rand(1900, 3200));
  }

  function tune(seconds = 2) {
    if (!ctx) return;
    const night = mood === "night";
    const now = ctx.currentTime;
    birdLevel.gain.setTargetAtTime(night ? 0 : mood === "dawn" ? 0.9 : 0.6, now, seconds / 3);
    waterTone.frequency.setTargetAtTime(night ? 1300 : 9000, now, seconds / 3);
    waterLevel.gain.setTargetAtTime(night ? 0.5 : 0.62, now, seconds / 3);
  }

  async function build() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    waterTone = ctx.createBiquadFilter();
    waterTone.type = "lowpass";
    waterLevel = ctx.createGain();
    birdLevel = ctx.createGain();
    waterTone.connect(waterLevel).connect(master);
    birdLevel.connect(master);
    const load = async (url) => ctx.decodeAudioData(await (await fetch(url)).arrayBuffer());
    buffers = await Promise.all([load("./assets/water.m4a"), load("./assets/birds.m4a")]);
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
      stopLoops = [loop(buffers[0], waterTone, 2.5), loop(buffers[1], birdLevel, 3)];
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(0.55, ctx.currentTime, 1.1);
      crickets();
    },
    stop() {
      if (!ctx) return;
      playing = false;
      clearTimeout(cricketTimer);
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
