function ProcessStep({ n, icon, bg, label, desc }) {
    return (<div className="paw-step">
      <div className="paw-step-icon" style={{ background: bg }}>{icon}</div>
      <div className="paw-step-num">{n}</div>
      <strong>{label}</strong>
      <p>{desc}</p>
    </div>);
}
export default ProcessStep;
