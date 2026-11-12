export default function DataTable({ children, className = "" }) {
    return <table className={className}>{children}</table>;
}
