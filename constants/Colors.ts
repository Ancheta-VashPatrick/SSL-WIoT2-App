/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    chartStroke: "#044BD9",
    chartScatter: "#044BD9",
    chartScatterSelected: "#D90E04",
    chartFillA: "#0460D9",
    chartFillB: "#0460D9",
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    chartStroke: "#AED3F2",
    chartScatter: "#AED3F2",
    chartScatterSelected: "#D90E04",
    chartFillA: "#63B0F2",
    chartFillB: "#0476D9",
  },
};
