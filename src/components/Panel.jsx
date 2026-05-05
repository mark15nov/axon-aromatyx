export function Panel({ title, action, children, className = '', tight = false, accent = false }) {
  return (
    <div className={`panel ${className}`}>
      {title && (
        <div className="panel-header">
          <div className="flex items-center gap-2.5">
            {accent && <span className="w-1.5 h-1.5 rounded-full bg-steel-500" />}
            <h3 className="panel-title">{title}</h3>
          </div>
          {action}
        </div>
      )}
      <div className={tight ? '' : 'panel-body'}>{children}</div>
    </div>
  )
}
