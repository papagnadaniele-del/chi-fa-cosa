import { useEffect, useRef } from "react";

/* Riquadro per disegnare la firma con mouse, dito o penna */
export function SignaturePad({ onSave, onCancel }: { onSave: (dataUrl: string) => void; onCancel: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const dirty = useRef(false);

  useEffect(() => {
    const c = ref.current!;
    const ratio = window.devicePixelRatio || 1;
    c.width = c.offsetWidth * ratio;
    c.height = c.offsetHeight * ratio;
    const ctx = c.getContext("2d")!;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#0b2a4a";
  }, []);

  const pos = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const down = (e: React.PointerEvent) => {
    ref.current!.setPointerCapture(e.pointerId);
    drawing.current = true;
    const ctx = ref.current!.getContext("2d")!;
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };
  const move = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const ctx = ref.current!.getContext("2d")!;
    const p = pos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    dirty.current = true;
  };
  const up = () => (drawing.current = false);
  const clear = () => {
    const c = ref.current!;
    c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
    dirty.current = false;
  };

  return (
    <div className="sig-modal no-print" onClick={onCancel}>
      <div className="sig-box" onClick={(e) => e.stopPropagation()}>
        <h3>Firma del Coordinatore infermieristico</h3>
        <p>Firma nel riquadro con il mouse, il dito o la penna.</p>
        <canvas
          ref={ref}
          className="sig-canvas"
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerLeave={up}
        />
        <div className="sig-actions">
          <button type="button" className="nav-btn" onClick={clear}>Pulisci</button>
          <button type="button" className="nav-btn" onClick={onCancel}>Annulla</button>
          <button
            type="button"
            className="action-btn"
            onClick={() => dirty.current && onSave(ref.current!.toDataURL("image/png"))}
          >
            Salva firma
          </button>
        </div>
      </div>
    </div>
  );
}
