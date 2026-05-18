import { useEffect, useRef, useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Star {
  x: number;
  y: number;
  r: number;
  a: number;   // alpha
  speed: number;
  twinkleOffset: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────
const NAV_ITEMS = ["Work", "About", "Contact"];
const PROJECTS = [
  {
    id: "arte",
    title: "Arte",
    subtitle: "Social Media Reimagined",
    tag: "Product Design · 2026",
    desc: "An editorial social platform that prioritizes depth over dopamine — curated feeds, long-form expression, and a visual language borrowed from print media.",
    img: "/arte-preview.jpg",
    year: "2026",
    role: "Lead Designer",
    color: "#6b63ff",
  },
  {
    id: "suno",
    title: "Suno",
    subtitle: "Spotify-Inspired Music Experience",
    tag: "UI/UX · Brand · 2026",
    desc: "A Spotify-inspired music player that surfaces the emotional arc of listening — waveform moods, tempo-synced visuals, and an interface that breathes with the beat.",
    img: "/suno-preview.jpg",
    year: "2026",
    role: "Design Lead",
    color: "#f59e0b",
  },
];

const SKILLS = [
  ["Product Design", "Systems Thinking"],
  ["Motion & Interaction", "Brand Identity"],
  ["Prototyping", "Design Engineering"],
];

// ─── Hooks ───────────────────────────────────────────────────────────────────
function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? window.scrollY / total : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return progress;
}

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal, .reveal-left");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add("visible");
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

// ─── Star Canvas ─────────────────────────────────────────────────────────────
function StarCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const scrollRef = useRef(0);
  const rafRef = useRef<number>(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    const initStars = () => {
      const count = Math.floor((canvas.width * canvas.height) / 3200);
      starsRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.1 + 0.15,
        a: Math.random() * 0.7 + 0.15,
        speed: Math.random() * 0.18 + 0.04,
        twinkleOffset: Math.random() * Math.PI * 2,
      }));
    };

    const onScroll = () => {
      scrollRef.current = window.scrollY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", resize);
    resize();

    const draw = (ts: number) => {
      timeRef.current = ts;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const scrollFraction = scrollRef.current / Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1
      );

      starsRef.current.forEach((star) => {
        // Drift right as page scrolls down
        const driftX = scrollFraction * canvas.width * star.speed * 1.4;
        const px = (star.x + driftX) % canvas.width;
        // Fourier-series-inspired twinkle: sum of harmonics
        const t = ts / 1000;
        const twinkle =
          0.55 +
          0.18 * Math.sin(t * 0.9 + star.twinkleOffset) +
          0.10 * Math.sin(t * 2.3 + star.twinkleOffset * 1.7) +
          0.07 * Math.sin(t * 4.1 + star.twinkleOffset * 0.5);

        const alpha = star.a * twinkle;
        ctx.beginPath();
        ctx.arc(px, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245,244,241,${alpha.toFixed(3)})`;
        ctx.fill();
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} id="star-canvas" />;
}

// ─── Fourier Wave SVG ─────────────────────────────────────────────────────────
function FourierWave({ visible }: { visible: boolean }) {
  const points: string[] = [];
  const W = 800, H = 60, cy = H / 2;
  for (let x = 0; x <= W; x += 2) {
    const t = (x / W) * Math.PI * 2;
    const y =
      cy +
      14 * Math.sin(t) +
      6  * Math.sin(2 * t + 0.4) +
      3  * Math.sin(3 * t + 0.8) +
      1.5 * Math.sin(5 * t + 1.2) +
      0.8 * Math.sin(7 * t + 1.6);
    points.push(`${x === 0 ? "M" : "L"}${x},${y.toFixed(2)}`);
  }
  const d = points.join(" ");
  return (
    <div
      className="w-full overflow-hidden"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 0.8s ease" }}
    >
      <svg
        viewBox={`0 0 ${800} ${60}`}
        className="wave-svg w-full"
        style={{ maxWidth: 480 }}
        preserveAspectRatio="none"
      >
        <path
          d={d}
          fill="none"
          stroke="rgba(200,195,188,0.35)"
          strokeWidth="1"
          style={visible ? {} : { strokeDashoffset: 1200 }}
        />
      </svg>
    </div>
  );
}

// ─── Custom Cursor ─────────────────────────────────────────────────────────────
function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });
  const rafRef = useRef<number>(0);
  const hovering = useRef(false);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      const el = e.target as HTMLElement;
      hovering.current =
        el.closest("a, button, .case-card, .nav-link") !== null;
    };
    window.addEventListener("mousemove", onMove);

    const animate = () => {
      ring.current.x += (pos.current.x - ring.current.x) * 0.12;
      ring.current.y += (pos.current.y - ring.current.y) * 0.12;

      if (dotRef.current) {
        dotRef.current.style.left = `${pos.current.x}px`;
        dotRef.current.style.top  = `${pos.current.y}px`;
        dotRef.current.style.width  = hovering.current ? "10px" : "6px";
        dotRef.current.style.height = hovering.current ? "10px" : "6px";
      }
      if (ringRef.current) {
        ringRef.current.style.left = `${ring.current.x}px`;
        ringRef.current.style.top  = `${ring.current.y}px`;
        ringRef.current.style.width  = hovering.current ? "52px" : "32px";
        ringRef.current.style.height = hovering.current ? "52px" : "32px";
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      <div id="cursor-dot" ref={dotRef} />
      <div id="cursor-ring" ref={ringRef} />
    </>
  );
}

// ─── Scroll Progress Bar ──────────────────────────────────────────────────────
function ScrollProgress() {
  const progress = useScrollProgress();
  return (
    <div
      id="scroll-progress"
      style={{ transform: `scaleX(${progress})`, width: "100%" }}
    />
  );
}

// ─── Nav ───────────────────────────────────────────────────────────────────────
function Nav({ scrolled }: { scrolled: boolean }) {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id.toLowerCase());
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 py-7 transition-all duration-700"
      style={{
        backdropFilter: scrolled ? "blur(24px) saturate(140%)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(24px) saturate(140%)" : "none",
        background: scrolled ? "rgba(5,5,8,0.7)" : "transparent",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
      }}
    >
      {/* Wordmark */}
      <div
        className="text-sm tracking-[0.18em] uppercase cursor-pointer select-none"
        style={{ color: "var(--color-chalk)", fontWeight: 500, letterSpacing: "0.2em" }}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        Gauransh
      </div>

      {/* Nav links */}
      <div className="flex items-center gap-10">
        {NAV_ITEMS.map((item) => (
          <button
            key={item}
            className="nav-link bg-transparent border-none cursor-pointer"
            onClick={() => scrollTo(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {/* CTA */}
      <a
        href="mailto:hello@Gauransh.design"
        className="btn-magnetic text-xs tracking-widest uppercase px-5 py-2.5 rounded-sm border"
        style={{
          color: "var(--color-chalk-70)",
          borderColor: "rgba(245,244,241,0.15)",
          textDecoration: "none",
          fontSize: "11px",
          letterSpacing: "0.1em",
        }}
      >
        Available for Work
      </a>
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [parallax, setParallax] = useState(0);
  const [waveVisible, setWaveVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setParallax(window.scrollY * 0.35);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    setTimeout(() => setWaveVisible(true), 1200);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      ref={heroRef}
      id="hero"
      className="relative flex flex-col justify-center min-h-screen overflow-hidden"
      style={{ zIndex: 1 }}
    >
      {/* Hero background image with parallax */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translateY(${parallax}px) scale(1.08)`,
          transformOrigin: "center center",
          willChange: "transform",
          zIndex: 0,
        }}
      >
        <img
          src="/hero-space.jpg"
          alt=""
          aria-hidden
          className="w-full h-full object-cover"
          style={{ filter: "brightness(0.55) saturate(0.8)" }}
        />
      </div>

      {/* Gradient veil */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 40%, transparent 0%, rgba(5,5,8,0.55) 70%, rgba(5,5,8,0.95) 100%)",
          zIndex: 1,
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-64"
        style={{
          background: "linear-gradient(to bottom, transparent, var(--color-space))",
          zIndex: 1,
        }}
      />

      {/* Hero content */}
      <div
        className="relative px-10 md:px-20 lg:px-28 max-w-screen-xl mx-auto w-full"
        style={{ zIndex: 2 }}
      >
        {/* Eyebrow */}
        <p
          className="text-xs tracking-[0.22em] uppercase mb-10 reveal"
          style={{ color: "var(--color-chalk-40)", transitionDelay: "0.1s" }}
        >
          Digital Product Design
        </p>

        {/* Main headline */}
        <h1
          className="reveal"
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 300,
            fontSize: "clamp(3.2rem, 8vw, 8.5rem)",
            lineHeight: 1.02,
            letterSpacing: "-0.03em",
            color: "var(--color-chalk)",
            maxWidth: "14ch",
            transitionDelay: "0.2s",
          }}
        >
          Crafting{" "}
          <em
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontWeight: 400,
              color: "rgba(245,244,241,0.75)",
            }}
          >
            extraordinary
          </em>
          <br />
          digital experiences
        </h1>

        {/* Sub / descriptor */}
        <p
          className="reveal mt-10 max-w-md"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.125rem",
            lineHeight: 1.72,
            color: "var(--color-chalk-40)",
            transitionDelay: "0.35s",
          }}
        >
          A product design Gauransh working at the intersection of craft,
          technology, and editorial vision.
        </p>

        {/* Fourier wave */}
        <div className="mt-14 reveal" style={{ transitionDelay: "0.5s" }}>
          <FourierWave visible={waveVisible} />
        </div>

        {/* CTA row */}
        <div
          className="flex items-center gap-8 mt-12 reveal"
          style={{ transitionDelay: "0.55s" }}
        >
          <button
            className="btn-magnetic text-sm tracking-widest uppercase"
            style={{
              color: "var(--color-chalk)",
              fontWeight: 400,
              letterSpacing: "0.12em",
              fontSize: "12px",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
            onClick={() =>
              document.getElementById("work")?.scrollIntoView({ behavior: "smooth" })
            }
          >
            View Selected Work ↓
          </button>
          <span style={{ width: 64, height: 1, background: "rgba(245,244,241,0.2)" }} />
          <span
            style={{
              fontSize: "11px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--color-chalk-40)",
            }}
          >
            2 Projects
          </span>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-10 right-10 flex flex-col items-center gap-3"
        style={{ zIndex: 2 }}
      >
        <div
          style={{
            writingMode: "vertical-rl",
            fontSize: "9px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--color-chalk-30)",
          }}
        >
          Scroll
        </div>
        <div
          style={{
            width: 1,
            height: 48,
            background: "linear-gradient(to bottom, rgba(245,244,241,0.3), transparent)",
          }}
        />
      </div>
    </section>
  );
}

// ─── About ────────────────────────────────────────────────────────────────────
function About() {
  return (
    <section
      id="about"
      className="relative py-40 px-10 md:px-20 lg:px-28 max-w-screen-xl mx-auto"
      style={{ zIndex: 1 }}
    >
      {/* Section label */}
      <div className="flex items-center gap-6 mb-20 reveal">
        <span
          style={{
            fontSize: "10px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--color-chalk-30)",
          }}
        >
          01 — About
        </span>
        <div style={{ height: 1, flex: 1, background: "rgba(245,244,241,0.08)" }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
        {/* Left: Large statement */}
        <div className="lg:col-span-7">
          <h2
            className="reveal"
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 300,
              fontSize: "clamp(2rem, 4vw, 3.5rem)",
              lineHeight: 1.12,
              letterSpacing: "-0.025em",
              color: "var(--color-chalk)",
            }}
          >
            I design products that feel{" "}
            <em
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                color: "rgba(245,244,241,0.6)",
              }}
            >
              inevitable
            </em>
            {" "}— interfaces where every interaction has intention.
          </h2>

          {/* Fourier decorative rule */}
          <div className="mt-10 reveal" style={{ transitionDelay: "0.2s" }}>
            <div
              style={{
                width: "100%",
                height: 1,
                background:
                  "linear-gradient(to right, rgba(200,195,188,0.3), transparent)",
              }}
            />
          </div>

          {/* Bio text */}
          <p
            className="reveal mt-10"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.05rem",
              lineHeight: 1.8,
              color: "var(--color-chalk-40)",
              maxWidth: "54ch",
              transitionDelay: "0.3s",
            }}
          >
            Based at the frontier of design and engineering, I create digital
            products for companies that care deeply about the quality of their
            craft. My work spans product design, systems thinking, and motion —
            always in service of clarity.
          </p>
        </div>

        {/* Right: Skills & metrics */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-16">
          {/* Metrics */}
          <div className="grid grid-cols-3 gap-8 reveal" style={{ transitionDelay: "0.15s" }}>
            {[
              { num: "7+", label: "Years" },
              { num: "40+", label: "Projects" },
              { num: "12+", label: "Clients" },
            ].map(({ num, label }) => (
              <div key={label}>
                <div
                  className="counter-num"
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontWeight: 300,
                    fontSize: "clamp(2rem, 4vw, 2.8rem)",
                    letterSpacing: "-0.04em",
                    color: "var(--color-chalk)",
                    lineHeight: 1,
                  }}
                >
                  {num}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--color-chalk-30)",
                    marginTop: "0.5rem",
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>

          {/* Separator */}
          <div style={{ height: 1, background: "rgba(245,244,241,0.06)" }} />

          {/* Skills grid */}
          <div className="reveal" style={{ transitionDelay: "0.3s" }}>
            <p
              style={{
                fontSize: "10px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--color-chalk-30)",
                marginBottom: "1.25rem",
              }}
            >
              Expertise
            </p>
            <div className="flex flex-col gap-3">
              {SKILLS.map((row, i) => (
                <div key={i} className="flex gap-3">
                  {row.map((skill) => (
                    <span
                      key={skill}
                      style={{
                        fontSize: "12px",
                        color: "var(--color-chalk-70)",
                        letterSpacing: "0.04em",
                        padding: "0.35rem 0.85rem",
                        border: "1px solid rgba(245,244,241,0.1)",
                        borderRadius: "2px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Case Study Card ──────────────────────────────────────────────────────────
function CaseCard({ project, index }: { project: typeof PROJECTS[0]; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="reveal"
      style={{ transitionDelay: `${0.1 + index * 0.18}s` }}
    >
      {/* Project number */}
      <div
        className="flex items-center justify-between mb-5"
        style={{
          fontSize: "10px",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--color-chalk-30)",
        }}
      >
        <span>0{index + 1}</span>
        <span>{project.year}</span>
      </div>

      {/* Card image */}
      <div
        className="case-card shimmer"
        style={{ height: "clamp(280px, 40vw, 520px)", borderRadius: "3px" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <img
          src={project.img}
          alt={project.title}
          className="card-img absolute inset-0 w-full h-full object-cover"
          style={{ position: "absolute" }}
        />
        <div className="card-overlay" />
        <div className="card-meta">
          <div className="card-tag mb-2">{project.tag}</div>
          <h3
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 300,
              fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
              letterSpacing: "-0.025em",
              color: "var(--color-chalk)",
              lineHeight: 1.1,
              margin: "0 0 0.5rem",
            }}
          >
            {project.title}
          </h3>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: "1rem",
              color: "rgba(245,244,241,0.6)",
              margin: "0 0 1.5rem",
            }}
          >
            {project.subtitle}
          </p>
          <div className="card-arrow flex items-center gap-3">
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: "1px solid rgba(245,244,241,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                color: "var(--color-chalk)",
              }}
            >
              ↗
            </div>
            <span
              style={{
                fontSize: "11px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--color-chalk-70)",
              }}
            >
              View Case Study
            </span>
          </div>
        </div>
      </div>

      {/* Card desc below */}
      <div
        className="mt-6"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: "2rem",
          alignItems: "start",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "0.9rem",
            lineHeight: 1.75,
            color: "var(--color-chalk-40)",
            maxWidth: "52ch",
          }}
        >
          {project.desc}
        </p>
        <div
          style={{
            fontSize: "11px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--color-chalk-30)",
            textAlign: "right",
            paddingTop: "0.2rem",
          }}
        >
          <div>{project.role}</div>
        </div>
      </div>

      {/* Accent rule with project color */}
      <div
        className="mt-6"
        style={{
          height: 1,
          background: `linear-gradient(to right, ${project.color}40, transparent)`,
          transition: "opacity 0.4s ease",
          opacity: hovered ? 1 : 0.4,
        }}
      />
    </div>
  );
}

// ─── Work ─────────────────────────────────────────────────────────────────────
function Work() {
  return (
    <section
      id="work"
      className="relative py-40 px-10 md:px-20 lg:px-28 max-w-screen-xl mx-auto"
      style={{ zIndex: 1 }}
    >
      {/* Section header */}
      <div className="flex items-center gap-6 mb-6 reveal">
        <span
          style={{
            fontSize: "10px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--color-chalk-30)",
          }}
        >
          02 — Selected Work
        </span>
        <div style={{ height: 1, flex: 1, background: "rgba(245,244,241,0.08)" }} />
      </div>

      <h2
        className="reveal mb-24"
        style={{
          fontFamily: "var(--font-sans)",
          fontWeight: 300,
          fontSize: "clamp(2.4rem, 5vw, 4.5rem)",
          letterSpacing: "-0.03em",
          lineHeight: 1.05,
          color: "var(--color-chalk)",
        }}
      >
        Featured{" "}
        <em
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            color: "rgba(245,244,241,0.55)",
          }}
        >
          projects
        </em>
      </h2>

      {/* Cards grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-10">
        {PROJECTS.map((proj, i) => (
          <CaseCard key={proj.id} project={proj} index={i} />
        ))}
      </div>
    </section>
  );
}

// ─── Contact ──────────────────────────────────────────────────────────────────
function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  const inputStyle: React.CSSProperties = {
    background: "transparent",
    border: "none",
    borderBottom: "1px solid rgba(245,244,241,0.12)",
    color: "var(--color-chalk)",
    fontFamily: "var(--font-sans)",
    fontSize: "1rem",
    padding: "0.75rem 0",
    outline: "none",
    width: "100%",
    transition: "border-color 0.3s ease",
    letterSpacing: "0.01em",
  };

  return (
    <section
      id="contact"
      className="relative py-40 px-10 md:px-20 lg:px-28 max-w-screen-xl mx-auto"
      style={{ zIndex: 1 }}
    >
      {/* Section label */}
      <div className="flex items-center gap-6 mb-20 reveal">
        <span
          style={{
            fontSize: "10px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--color-chalk-30)",
          }}
        >
          03 — Contact
        </span>
        <div style={{ height: 1, flex: 1, background: "rgba(245,244,241,0.08)" }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
        {/* Left */}
        <div className="lg:col-span-5">
          <h2
            className="reveal"
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 300,
              fontSize: "clamp(2rem, 4vw, 3.5rem)",
              letterSpacing: "-0.025em",
              lineHeight: 1.1,
              color: "var(--color-chalk)",
            }}
          >
            Let's make something{" "}
            <em
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                color: "rgba(245,244,241,0.55)",
              }}
            >
              remarkable
            </em>
          </h2>

          <p
            className="reveal mt-8"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1rem",
              lineHeight: 1.75,
              color: "var(--color-chalk-40)",
              maxWidth: "42ch",
              transitionDelay: "0.15s",
            }}
          >
            I'm currently open to new collaborations. If you have a project in
            mind, I'd love to hear about it.
          </p>

          {/* Social links */}
          <div
            className="reveal flex flex-col gap-4 mt-14"
            style={{ transitionDelay: "0.25s" }}
          >
            {[
              { label: "Twitter / X", href: "#" },
              { label: "Dribbble", href: "#" },
              { label: "LinkedIn", href: "#" },
              { label: "Read.cv", href: "#" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="nav-link"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  fontSize: "12px",
                  color: "var(--color-chalk-40)",
                  textDecoration: "none",
                }}
              >
                <span style={{ opacity: 0.3 }}>→</span>
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* Right: form */}
        <div className="lg:col-span-7 reveal" style={{ transitionDelay: "0.2s" }}>
          {sent ? (
            <div
              className="flex flex-col items-start justify-center h-full gap-4"
              style={{ minHeight: 320 }}
            >
              <div
                style={{
                  fontSize: "clamp(2rem, 4vw, 3rem)",
                  fontFamily: "var(--font-sans)",
                  fontWeight: 300,
                  letterSpacing: "-0.03em",
                  color: "var(--color-chalk)",
                }}
              >
                Message received ✦
              </div>
              <p
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1rem",
                  color: "var(--color-chalk-40)",
                  lineHeight: 1.7,
                }}
              >
                Thank you for reaching out. I'll be in touch within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-2">
                  <label
                    style={{
                      fontSize: "10px",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "var(--color-chalk-30)",
                    }}
                  >
                    Name
                  </label>
                  <input
                    style={inputStyle}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                    onFocus={(e) => (e.target.style.borderBottomColor = "rgba(245,244,241,0.5)")}
                    onBlur={(e) => (e.target.style.borderBottomColor = "rgba(245,244,241,0.12)")}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label
                    style={{
                      fontSize: "10px",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "var(--color-chalk-30)",
                    }}
                  >
                    Email
                  </label>
                  <input
                    style={inputStyle}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    onFocus={(e) => (e.target.style.borderBottomColor = "rgba(245,244,241,0.5)")}
                    onBlur={(e) => (e.target.style.borderBottomColor = "rgba(245,244,241,0.12)")}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  style={{
                    fontSize: "10px",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "var(--color-chalk-30)",
                  }}
                >
                  Message
                </label>
                <textarea
                  style={{
                    ...inputStyle,
                    resize: "none",
                    minHeight: 140,
                  }}
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  placeholder="Tell me about your project..."
                  required
                  onFocus={(e) => (e.target.style.borderBottomColor = "rgba(245,244,241,0.5)")}
                  onBlur={(e) => (e.target.style.borderBottomColor = "rgba(245,244,241,0.12)")}
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="btn-magnetic"
                  style={{
                    fontSize: "12px",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--color-space)",
                    background: "var(--color-chalk)",
                    border: "none",
                    cursor: "pointer",
                    padding: "1rem 2.5rem",
                    borderRadius: "2px",
                    fontFamily: "var(--font-sans)",
                    fontWeight: 500,
                  }}
                >
                  Send Message →
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer
      className="relative py-14 px-10 md:px-20 lg:px-28 max-w-screen-xl mx-auto"
      style={{
        zIndex: 1,
        borderTop: "1px solid rgba(245,244,241,0.06)",
      }}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div
          style={{
            fontSize: "11px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--color-chalk-30)",
          }}
        >
          © {new Date().getFullYear()} Gauransh — All rights reserved
        </div>
        <div
          style={{
            fontSize: "11px",
            letterSpacing: "0.1em",
            color: "var(--color-chalk-30)",
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
          }}
        >
          Designed & engineered with intention
        </div>
      </div>
    </footer>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [scrolled, setScrolled] = useState(false);
  useReveal();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Trigger initial reveals
  useEffect(() => {
    setTimeout(() => {
      document.querySelectorAll(".reveal, .reveal-left").forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.92) {
          (el as HTMLElement).classList.add("visible");
        }
      });
    }, 80);
  }, []);

  return (
    <div style={{ background: "var(--color-space)", minHeight: "100vh", position: "relative" }}>
      {/* Ambient star canvas */}
      <StarCanvas />

      {/* Scroll progress */}
      <ScrollProgress />

      {/* Custom cursor (desktop only) */}
      <Cursor />

      {/* Navigation */}
      <Nav scrolled={scrolled} />

      {/* Main content */}
      <main style={{ position: "relative", zIndex: 2 }}>
        <Hero />

        {/* Section divider */}
        <div style={{ zIndex: 1, position: "relative" }}>
          <div className="section-sep" />
        </div>

        <About />

        <div style={{ zIndex: 1, position: "relative" }}>
          <div className="section-sep" />
        </div>

        <Work />

        <div style={{ zIndex: 1, position: "relative" }}>
          <div className="section-sep" />
        </div>

        <Contact />
      </main>

      <Footer />
    </div>
  );
}
