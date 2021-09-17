import 'styled-components'

declare module 'styled-components' {
    export interface DefaultTheme {
      colors: {
        black: string
        lightBlack: string
        white: string
        gray: string
        primary: string
      }
    }
  }