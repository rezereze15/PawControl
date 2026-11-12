function FeatureItem({ icon, bg, title, desc }) {
    return (<div className="paw-feature-item">
      <div className="paw-feature-icon" style={{ background: bg }}>{icon}</div>
      <strong>{title}</strong>
      <p>{desc}</p>
    </div>);
}
export default FeatureItem;
