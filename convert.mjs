import ffmpegPath from 'ffmpeg-static';
import { execSync } from 'child_process';
import path from 'path';

try {
  console.log('Converting to GIF...');
  execSync(`"${ffmpegPath}" -y -i public/raw_demo.webm -vf "fps=10,scale=800:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -loop 0 public/demo.gif`);
  console.log('Done!');
} catch (e) {
  console.error(e);
}
