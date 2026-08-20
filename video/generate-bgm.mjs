import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.dirname(here);
const outputPath = path.resolve(process.argv[2] || path.join(projectDir, 'dist', 'diana-theme-original-bgm.wav'));
const sampleRate = 48000;
const duration = 45;
const frames = sampleRate * duration;
const left = new Float32Array(frames);
const right = new Float32Array(frames);
const beat = 60 / 92;
const bar = beat * 4;

const midi = (note) => 440 * 2 ** ((note - 69) / 12);
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function addTone({ start, length, note, amplitude, decay = 2.8, pan = 0, bell = false }) {
  const first = Math.max(0, Math.floor(start * sampleRate));
  const last = Math.min(frames, Math.ceil((start + length) * sampleRate));
  const frequency = midi(note);
  const leftGain = Math.sqrt((1 - pan) / 2);
  const rightGain = Math.sqrt((1 + pan) / 2);
  for (let frame = first; frame < last; frame += 1) {
    const t = frame / sampleRate - start;
    const attack = clamp(t / .018, 0, 1);
    const release = clamp((length - t) / .18, 0, 1);
    const envelope = attack * release * Math.exp(-t * decay);
    const fundamental = Math.sin(2 * Math.PI * frequency * t);
    const shimmer = bell
      ? .34 * Math.sin(2 * Math.PI * frequency * 2.01 * t) + .13 * Math.sin(2 * Math.PI * frequency * 3.98 * t)
      : .12 * Math.sin(2 * Math.PI * frequency * 2 * t);
    const value = (fundamental + shimmer) * envelope * amplitude;
    left[frame] += value * leftGain;
    right[frame] += value * rightGain;
  }
}

const chords = [
  [60, 64, 67],
  [57, 60, 64],
  [53, 57, 60],
  [55, 59, 62]
];
const arpeggios = [
  [72, 76, 79, 76, 74, 79, 76, 72],
  [69, 72, 76, 72, 71, 76, 72, 69],
  [65, 69, 72, 69, 67, 72, 69, 65],
  [67, 71, 74, 71, 69, 74, 71, 67]
];

for (let barIndex = 0, start = 0; start < duration; barIndex += 1, start += bar) {
  const chordIndex = barIndex % chords.length;
  const chord = chords[chordIndex];
  chord.forEach((note, index) => addTone({
    start,
    length: Math.min(bar + .28, duration - start),
    note,
    amplitude: .052,
    decay: .26,
    pan: (index - 1) * .32
  }));
  addTone({ start, length: Math.min(bar, duration - start), note: chord[0] - 12, amplitude: .04, decay: .8, pan: -.08 });

  arpeggios[chordIndex].forEach((note, step) => {
    const noteStart = start + step * beat / 2;
    if (noteStart >= duration) return;
    addTone({
      start: noteStart,
      length: Math.min(.82, duration - noteStart),
      note,
      amplitude: step % 4 === 0 ? .075 : .055,
      decay: 4.6,
      pan: step % 2 === 0 ? -.18 : .18,
      bell: true
    });
  });
}

[.42, 1.18, 2.02, 23.22, 23.78, 35.22, 35.75, 41.2, 42.05, 43.1].forEach((start, index) => {
  addTone({ start, length: 1.4, note: [84, 88, 91][index % 3], amplitude: .048, decay: 3.8, pan: index % 2 ? .46 : -.46, bell: true });
});

let peak = 0;
for (let frame = 0; frame < frames; frame += 1) {
  const t = frame / sampleRate;
  const fade = Math.min(clamp(t / 1.1, 0, 1), clamp((duration - t) / 1.7, 0, 1));
  left[frame] *= fade;
  right[frame] *= fade;
  peak = Math.max(peak, Math.abs(left[frame]), Math.abs(right[frame]));
}
const gain = .78 / Math.max(peak, .001);

const wav = Buffer.allocUnsafe(44 + frames * 4);
wav.write('RIFF', 0);
wav.writeUInt32LE(wav.length - 8, 4);
wav.write('WAVE', 8);
wav.write('fmt ', 12);
wav.writeUInt32LE(16, 16);
wav.writeUInt16LE(1, 20);
wav.writeUInt16LE(2, 22);
wav.writeUInt32LE(sampleRate, 24);
wav.writeUInt32LE(sampleRate * 4, 28);
wav.writeUInt16LE(4, 32);
wav.writeUInt16LE(16, 34);
wav.write('data', 36);
wav.writeUInt32LE(frames * 4, 40);
for (let frame = 0; frame < frames; frame += 1) {
  wav.writeInt16LE(Math.round(clamp(left[frame] * gain, -1, 1) * 32767), 44 + frame * 4);
  wav.writeInt16LE(Math.round(clamp(right[frame] * gain, -1, 1) * 32767), 46 + frame * 4);
}

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, wav);
console.log(JSON.stringify({ outputPath, sampleRate, channels: 2, duration, peak: .78 }, null, 2));
