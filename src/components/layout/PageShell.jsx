import Topbar from './Topbar'
import Directory from './Directory'

// Envoltura de página: Topbar + contenido, con panel de Directorio
// opcional fijo a la derecha en escritorio.
export default function PageShell({ title, subtitle, withDirectory = false, actions, children }) {
  return (
    <>
      <Topbar title={title} subtitle={subtitle} />
      <div className={withDirectory ? 'mx-auto flex max-w-[1400px] gap-6 px-4 py-5 lg:px-8' : 'mx-auto max-w-[1200px] px-4 py-5 lg:px-8'}>
        <div className="min-w-0 flex-1">
          {actions && <div className="mb-4">{actions}</div>}
          {children}
        </div>

        {withDirectory && (
          <aside className="hidden w-80 shrink-0 xl:block">
            <div className="sticky top-20">
              <Directory />
            </div>
          </aside>
        )}
      </div>
    </>
  )
}
