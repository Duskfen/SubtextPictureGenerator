import 'subtextPictureGenerator/styles/globals.css'
import "subtextPictureGenerator/styles/slider.css"
import "subtextPictureGenerator/styles/switch.css"
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
