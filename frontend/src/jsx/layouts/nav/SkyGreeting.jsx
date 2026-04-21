import { useState, useEffect, useRef } from "react";



const lerp = (a, b, t) => a + (b - a) * t;
const lerpC = (c1, c2, t) => c1.map((v, i) => Math.round(lerp(v, c2[i], t)));
const rgb = (c) => `rgb(${c[0]},${c[1]},${c[2]})`;
const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

const SKY_KEYS = [
    { h: 0, top: [8, 15, 40], bot: [20, 30, 70] },
    { h: 5, top: [255, 120, 50], bot: [255, 180, 80] },
    { h: 6.5, top: [100, 170, 230], bot: [170, 215, 245] },
    { h: 10, top: [65, 145, 215], bot: [140, 200, 240] },
    { h: 14, top: [55, 130, 200], bot: [130, 190, 235] },
    { h: 17, top: [80, 150, 210], bot: [145, 200, 238] },
    { h: 18, top: [220, 100, 50], bot: [255, 170, 80] },
    { h: 19.5, top: [60, 30, 80], bot: [120, 70, 140] },
    { h: 21, top: [10, 12, 35], bot: [20, 25, 65] },
    { h: 24, top: [8, 15, 40], bot: [20, 30, 70] },
];

const STARS = Array.from({ length: 22 }, (_, i) => ({
    x: 3 + ((i * 137 + 53) % 100) / 100 * 50,
    y: 2 + ((i * 97 + 17) % 100) / 100 * 40,
    r: 0.5 + ((i * 41) % 10) / 10 * 0.8,
    a: 0.4 + ((i * 23) % 10) / 10 * 0.5,
}));

const CLOUD_PUFFS = [
    { x: 8, y: 18, r: 5.5 }, { x: 14, y: 15, r: 4 }, { x: 20, y: 17, r: 5 },
    { x: 38, y: 12, r: 4.5 }, { x: 44, y: 10, r: 3.5 }, { x: 50, y: 12, r: 4 },
];

const SUB_TEXT = {
    0: "Late night grind", 1: "Late night grind", 2: "Late night grind",
    3: "Late night grind", 4: "Late night grind", 5: "Early bird today",
    6: "Early bird today", 7: "Have a great day", 8: "Have a great day",
    9: "Morning is yours", 10: "Morning is yours", 11: "Morning is yours",
    12: "Midday check-in", 13: "Midday check-in", 14: "Keep it going",
    15: "Keep it going", 16: "Keep it going", 17: "Evening is here",
    18: "Evening is here", 19: "Wind down time", 20: "Wind down time",
    21: "Almost bedtime", 22: "Almost bedtime", 23: "Late night grind",
};

function getSky(t) {
    for (let i = 0; i < SKY_KEYS.length - 1; i++) {
        const a = SKY_KEYS[i], b = SKY_KEYS[i + 1];
        if (t >= a.h && t < b.h) {
            const p = (t - a.h) / (b.h - a.h);
            return { top: lerpC(a.top, b.top, p), bot: lerpC(a.bot, b.bot, p) };
        }
    }
    return { top: SKY_KEYS[0].top, bot: SKY_KEYS[0].bot };
}

function getBodyPos(t) {
    const isMoon = t >= 19.5 || t < 5;
    let progress;
    if (!isMoon) {
        progress = Math.max(0, Math.min(1, (t - 5) / (19.5 - 5)));
    } else {
        const tA = t < 5 ? t + 24 : t;
        progress = Math.max(0, Math.min(1, (tA - 19.5) / 10));
    }
    const angle = Math.PI + progress * Math.PI;
    return { x: 28 + 18 * Math.cos(angle), y: 34 + 14 * Math.sin(angle), isMoon };
}

function drawSky(canvas) {
    const ctx = canvas.getContext("2d");
    const W = 56, H = 56, cx = 28;
    const now = new Date();
    const t = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
    const sky = getSky(t);
    const bp = getBodyPos(t);
    const isDusk = (t >= 17.5 && t < 19.5) || (t >= 5 && t < 7);

    ctx.clearRect(0, 0, W, H);

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cx, cx, 0, Math.PI * 2);
    ctx.clip();

    const gr = ctx.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, rgb(sky.top));
    gr.addColorStop(1, rgb(sky.bot));
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, W, H);

    if (bp.isMoon) {
        const fade = t < 5 ? 1 : Math.max(0, (t - 19) / 2);
        STARS.forEach(s => {
            ctx.globalAlpha = s.a * fade;
            ctx.fillStyle = "#fff";
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
    } else {
        CLOUD_PUFFS.forEach(p => {
            ctx.fillStyle = `rgba(255,255,255,${isDusk ? 0.5 : 0.65})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    if (bp.x > 0 && bp.x < W && bp.y < H + 4) {
        if (!bp.isMoon) {
            const gSun = ctx.createRadialGradient(bp.x, bp.y, 0, bp.x, bp.y, 13);
            gSun.addColorStop(0, "rgba(255,230,80,0.5)");
            gSun.addColorStop(1, "rgba(255,180,40,0)");
            ctx.fillStyle = gSun;
            ctx.beginPath();
            ctx.arc(bp.x, bp.y, 13, 0, Math.PI * 2);
            ctx.fill();

            ctx.save();
            ctx.strokeStyle = rgba([255, 240, 100], 0.55);
            ctx.lineWidth = 1.2;
            for (let i = 0; i < 12; i++) {
                const a = (i / 12) * Math.PI * 2;
                ctx.beginPath();
                ctx.moveTo(bp.x + Math.cos(a) * 6.5, bp.y + Math.sin(a) * 6.5);
                ctx.lineTo(bp.x + Math.cos(a) * 10, bp.y + Math.sin(a) * 10);
                ctx.stroke();
            }
            ctx.restore();

            ctx.fillStyle = "#FFE44D";
            ctx.beginPath();
            ctx.arc(bp.x, bp.y, 5.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "rgba(255,255,200,0.7)";
            ctx.beginPath();
            ctx.arc(bp.x - 1.5, bp.y - 1.5, 2.2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            const gMoon = ctx.createRadialGradient(bp.x, bp.y, 0, bp.x, bp.y, 12);
            gMoon.addColorStop(0, "rgba(200,215,255,0.3)");
            gMoon.addColorStop(1, "rgba(150,170,220,0)");
            ctx.fillStyle = gMoon;
            ctx.beginPath();
            ctx.arc(bp.x, bp.y, 12, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "rgb(220,230,248)";
            ctx.beginPath();
            ctx.arc(bp.x, bp.y, 5.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "rgba(0,0,0,0.15)";
            ctx.beginPath();
            ctx.arc(bp.x + 1.9, bp.y - 0.8, 4.7, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "rgb(220,230,248)";
            ctx.beginPath();
            ctx.arc(bp.x, bp.y, 5.5, 0, Math.PI * 2);
            ctx.fill();

            [[bp.x - 2.5, bp.y - 1.5, 1.2], [bp.x + 2, bp.y + 2, 0.9], [bp.x + 1.5, bp.y - 2.5, 0.7]].forEach(([cx2, cy2, r2]) => {
                ctx.fillStyle = "rgba(150,160,180,0.35)";
                ctx.beginPath();
                ctx.arc(cx2, cy2, r2, 0, Math.PI * 2);
                ctx.fill();
            });
        }
    }

    ctx.fillStyle = bp.isMoon
        ? "rgba(15,18,45,0.9)"
        : isDusk
            ? "rgba(60,30,10,0.85)"
            : "rgba(30,80,30,0.7)";
    ctx.beginPath();
    ctx.ellipse(cx, H + 2, W * 0.7, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function getGreetingInfo() {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const t = h + m / 60;
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    const mm = String(m).padStart(2, "0");

    const greeting =
        t >= 5 && t < 12 ? "Good morning" :
            t >= 12 && t < 17 ? "Good afternoon" :
                t >= 17 && t < 21 ? "Good evening" :
                    "Good night";

    return {
        time: `${h12}:${mm} ${ampm}`,
        greeting,
        sub: SUB_TEXT[h] ?? "Welcome back",
    };
}

const SkyGreeting = () => {
    const canvasRef = useRef(null);
    const [info, setInfo] = useState(getGreetingInfo);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const tick = () => {
            drawSky(canvas);
            setInfo(getGreetingInfo());
        };

        tick();
        const id = setInterval(tick, 10_000);
        return () => clearInterval(id);
    }, []);

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                userSelect: "none",
            }}
        >
            <canvas
                ref={canvasRef}
                width={56}
                height={56}
                style={{ borderRadius: "50%", flexShrink: 0, display: "block" }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                <span style={{ fontSize: "12px", color: "#7b7b7b", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    {info.time}
                </span>
                <span style={{ fontSize: "14px", fontWeight: 500 }}>
                    {info.greeting}
                </span>
                <span style={{ fontSize: "11px", color: "#888" }}>
                    {info.sub}
                </span>
            </div>
        </div>
    );
};

export default SkyGreeting;