import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/portal/login')
  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/clients') || request.nextUrl.pathname.startsWith('/projects') || request.nextUrl.pathname.startsWith('/kanban') || request.nextUrl.pathname.startsWith('/quotes') || request.nextUrl.pathname.startsWith('/invoices') || request.nextUrl.pathname.startsWith('/alerts')
  const isPortalPage = request.nextUrl.pathname.startsWith('/portal/client')

  if (isDashboardPage && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isPortalPage && !session) {
    return NextResponse.redirect(new URL('/portal/login', request.url))
  }

  if (isAuthPage && session) {
    // Determine where to redirect based on user role (implementation detail: assuming role meta for now)
    const role = session.user.app_metadata?.role
    if (role === 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    // For clients, we might need a dynamic clientId here, but for now just dashboard or client specific path
    return NextResponse.next()
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
