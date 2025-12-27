export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="px-4 py-6 lg:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600">
            &copy; {currentYear} Plataforma Electoral Colombia. Todos los derechos reservados.
          </div>
          <div className="flex gap-6 text-sm text-gray-600">
            <a href="/privacidad" className="hover:text-primary-600">Privacidad</a>
            <a href="/terminos" className="hover:text-primary-600">Términos</a>
            <a href="/soporte" className="hover:text-primary-600">Soporte</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
