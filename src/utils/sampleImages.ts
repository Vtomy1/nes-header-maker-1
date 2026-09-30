export interface SampleImage {
  id: string;
  name: string;
  tag: string;
  generateDataUrl: () => string;
}

function createSampleCanvas(draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void): string {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 240;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  draw(ctx, 256, 240);
  return canvas.toDataURL('image/png');
}

export const SAMPLE_IMAGES: SampleImage[] = [
  {
    id: 'space_fighter',
    name: 'Cosmic Starfighter',
    tag: 'Sci-Fi Shmup',
    generateDataUrl: () =>
      createSampleCanvas((ctx, w, h) => {
        // Deep space background
        ctx.fillStyle = '#060614';
        ctx.fillRect(0, 0, w, h);

        // Distant stars
        for (let i = 0; i < 90; i++) {
          const sx = (i * 37 + 13) % w;
          const sy = (i * 53 + 7) % h;
          const sCol = i % 3 === 0 ? '#64B0FF' : i % 2 === 0 ? '#FFFFFF' : '#ADADAD';
          ctx.fillStyle = sCol;
          ctx.fillRect(sx, sy, (i % 5 === 0) ? 2 : 1, (i % 5 === 0) ? 2 : 1);
        }

        // Alien gas planet in background
        const grad = ctx.createRadialGradient(200, 60, 10, 200, 60, 48);
        grad.addColorStop(0, '#FE8170');
        grad.addColorStop(0.6, '#B53120');
        grad.addColorStop(1, '#6C0600');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(200, 60, 42, 0, Math.PI * 2);
        ctx.fill();

        // Planetary ring
        ctx.strokeStyle = '#EA9E22';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(200, 60, 56, 12, -0.2, 0, Math.PI * 2);
        ctx.stroke();

        // Starfighter spaceship (pixel style)
        const shipX = 96;
        const shipY = 120;

        // Engine glow
        ctx.fillStyle = '#48CDDE';
        ctx.fillRect(shipX + 16, shipY + 52, 32, 8);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(shipX + 24, shipY + 48, 16, 6);

        // Ship hull
        ctx.fillStyle = '#155FD9';
        ctx.beginPath();
        ctx.moveTo(shipX + 32, shipY);
        ctx.lineTo(shipX + 54, shipY + 44);
        ctx.lineTo(shipX + 46, shipY + 48);
        ctx.lineTo(shipX + 18, shipY + 48);
        ctx.lineTo(shipX + 10, shipY + 44);
        ctx.closePath();
        ctx.fill();

        // Wings
        ctx.fillStyle = '#ADADAD';
        ctx.fillRect(shipX - 12, shipY + 32, 22, 14);
        ctx.fillRect(shipX + 54, shipY + 32, 22, 14);

        // Red accents
        ctx.fillStyle = '#B53120';
        ctx.fillRect(shipX - 16, shipY + 36, 6, 8);
        ctx.fillRect(shipX + 74, shipY + 36, 6, 8);
        ctx.fillRect(shipX + 30, shipY + 8, 4, 18);

        // Cockpit canopy
        ctx.fillStyle = '#48CDDE';
        ctx.beginPath();
        ctx.ellipse(shipX + 32, shipY + 22, 7, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(shipX + 30, shipY + 14, 3, 6);

        // Retro HUD Title text simulation
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 14px monospace';
        ctx.fillText('STAGE 1: SECTOR-8', 64, 216);
      }),
  },
  {
    id: 'gothic_castle',
    name: 'Castlevania Keep',
    tag: 'Gothic Action',
    generateDataUrl: () =>
      createSampleCanvas((ctx, w, h) => {
        // Night sky gradient
        ctx.fillStyle = '#06001A';
        ctx.fillRect(0, 0, w, h);

        // Crimson Blood Moon
        ctx.fillStyle = '#B53120';
        ctx.beginPath();
        ctx.arc(60, 60, 36, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FE8170';
        ctx.beginPath();
        ctx.arc(54, 54, 28, 0, Math.PI * 2);
        ctx.fill();

        // Silhouette Castle & Spires
        ctx.fillStyle = '#100826';
        // Main tower
        ctx.fillRect(140, 70, 70, 170);
        // Tower battlements
        for (let b = 0; b < 5; b++) {
          ctx.fillRect(140 + b * 14, 56, 8, 14);
        }
        // Spire roof
        ctx.beginPath();
        ctx.moveTo(175, 20);
        ctx.lineTo(215, 60);
        ctx.lineTo(135, 60);
        ctx.closePath();
        ctx.fill();

        // Left smaller tower
        ctx.fillRect(100, 110, 45, 130);
        ctx.beginPath();
        ctx.moveTo(122, 75);
        ctx.lineTo(148, 110);
        ctx.lineTo(96, 110);
        ctx.closePath();
        ctx.fill();

        // Right cliff wall
        ctx.fillRect(200, 100, 56, 140);

        // Castle Windows with yellow light
        ctx.fillStyle = '#EA9E22';
        ctx.fillRect(165, 95, 12, 22);
        ctx.fillRect(165, 135, 12, 22);
        ctx.fillRect(115, 130, 10, 18);

        // Foreground graveyard / cliff
        ctx.fillStyle = '#222233';
        ctx.fillRect(0, 195, w, 45);

        // Stone fence & gravestones
        ctx.fillStyle = '#666666';
        ctx.fillRect(20, 175, 12, 20);
        ctx.fillRect(16, 181, 20, 8);

        ctx.fillRect(60, 170, 14, 25);
        ctx.fillRect(55, 177, 24, 7);

        // Flying bats
        const drawBat = (bx: number, by: number) => {
          ctx.fillStyle = '#000000';
          ctx.beginPath();
          ctx.moveTo(bx, by);
          ctx.lineTo(bx - 8, by - 6);
          ctx.lineTo(bx - 3, by + 2);
          ctx.lineTo(bx, by);
          ctx.lineTo(bx + 3, by + 2);
          ctx.lineTo(bx + 8, by - 6);
          ctx.closePath();
          ctx.fill();
        };

        drawBat(90, 40);
        drawBat(110, 55);
        drawBat(75, 70);

        ctx.fillStyle = '#B53120';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('NIGHT OF TERROR', 74, 226);
      }),
  },
  {
    id: 'cyber_sunset',
    name: 'Neo Arcade 1985',
    tag: 'Synthwave',
    generateDataUrl: () =>
      createSampleCanvas((ctx, w, h) => {
        // Deep purple sky
        ctx.fillStyle = '#1412A7';
        ctx.fillRect(0, 0, w, 140);

        // Sun
        ctx.fillStyle = '#FE6ECC';
        ctx.beginPath();
        ctx.arc(128, 110, 45, 0, Math.PI * 2);
        ctx.fill();

        // Horizontal sun slices
        ctx.fillStyle = '#1412A7';
        for (let s = 0; s < 6; s++) {
          ctx.fillRect(70, 95 + s * 8, 116, 2 + s * 0.8);
        }

        // City skyline silhouettes
        ctx.fillStyle = '#06001A';
        const buildings = [
          [10, 80, 20], [35, 60, 25], [65, 90, 18], [88, 70, 22],
          [145, 65, 24], [175, 85, 20], [200, 55, 26], [230, 75, 18]
        ];
        buildings.forEach(([bx, by, bw]) => {
          ctx.fillRect(bx, by, bw, 140 - by);
          // Windows
          ctx.fillStyle = '#48CDDE';
          for (let wy = by + 6; wy < 130; wy += 10) {
            ctx.fillRect(bx + 4, wy, 3, 4);
            ctx.fillRect(bx + bw - 7, wy, 3, 4);
          }
          ctx.fillStyle = '#06001A';
        });

        // Perspective Synthwave Grid Floor
        ctx.fillStyle = '#0B0218';
        ctx.fillRect(0, 140, w, 100);

        // Grid lines horizontal
        ctx.strokeStyle = '#FE6ECC';
        ctx.lineWidth = 1.5;
        let yPos = 140;
        let gap = 2;
        while (yPos < h) {
          ctx.beginPath();
          ctx.moveTo(0, yPos);
          ctx.lineTo(w, yPos);
          ctx.stroke();
          gap = gap * 1.35;
          yPos += gap;
        }

        // Grid lines perspective vertical
        for (let vx = -60; vx <= w + 60; vx += 24) {
          ctx.beginPath();
          ctx.moveTo(128, 140);
          ctx.lineTo(vx, h);
          ctx.stroke();
        }

        ctx.fillStyle = '#48CDDE';
        ctx.font = 'bold 13px monospace';
        ctx.fillText('CYBER DRIVE 208X', 66, 30);
      }),
  },
  {
    id: 'pixel_overworld',
    name: '8-Bit Platformer Quest',
    tag: 'Classic Platformer',
    generateDataUrl: () =>
      createSampleCanvas((ctx, w, h) => {
        // NES Blue sky
        ctx.fillStyle = '#64B0FF';
        ctx.fillRect(0, 0, w, h);

        // Fluffy clouds
        const drawCloud = (cx: number, cy: number) => {
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(cx, cy, 14, 0, Math.PI * 2);
          ctx.arc(cx + 12, cy - 6, 16, 0, Math.PI * 2);
          ctx.arc(cx + 26, cy, 14, 0, Math.PI * 2);
          ctx.fill();
        };
        drawCloud(40, 45);
        drawCloud(180, 60);

        // Green Bush / Hill
        ctx.fillStyle = '#0C9300';
        ctx.beginPath();
        ctx.arc(80, 180, 36, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#5CE430';
        ctx.beginPath();
        ctx.arc(80, 175, 30, 0, Math.PI * 2);
        ctx.fill();

        // Brick ground
        ctx.fillStyle = '#994E00';
        ctx.fillRect(0, 180, w, 60);

        // Top grass strip on ground
        ctx.fillStyle = '#5CE430';
        ctx.fillRect(0, 180, w, 6);

        // Question mark mystery blocks
        const drawBlock = (bx: number, by: number) => {
          ctx.fillStyle = '#EA9E22';
          ctx.fillRect(bx, by, 20, 20);
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(bx, by, 20, 20);
          // 4 corner bolts
          ctx.fillStyle = '#000000';
          ctx.fillRect(bx + 2, by + 2, 2, 2);
          ctx.fillRect(bx + 16, by + 2, 2, 2);
          ctx.fillRect(bx + 2, by + 16, 2, 2);
          ctx.fillRect(bx + 16, by + 16, 2, 2);
          // Question mark
          ctx.font = 'bold 12px monospace';
          ctx.fillText('?', bx + 7, by + 15);
        };

        drawBlock(80, 110);
        drawBlock(100, 110);
        drawBlock(120, 110);
        drawBlock(140, 110);

        // Green Pipe
        ctx.fillStyle = '#0C9300';
        ctx.fillRect(190, 136, 36, 44);
        ctx.fillRect(186, 124, 44, 14);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(186, 124, 44, 14);
        ctx.strokeRect(190, 138, 36, 42);

        // Pipe highlight
        ctx.fillStyle = '#BDF4AB';
        ctx.fillRect(192, 126, 4, 10);
        ctx.fillRect(195, 140, 4, 40);

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('WORLD 1-1', 96, 26);
      }),
  },
];
