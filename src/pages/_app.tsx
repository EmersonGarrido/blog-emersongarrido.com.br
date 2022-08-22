import type { AppProps } from 'next/app'
import { ThemeProvider } from 'next-themes';
import { NProgress } from 'components';
import '../styles/globals.css'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class">
      <Component {...pageProps} />
      <NProgress />
    </ThemeProvider>
  )
}

export default MyApp
