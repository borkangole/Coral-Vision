import Svg, { Path, Circle, Polyline, Line, Rect } from 'react-native-svg';

// Small line-icon set (24-unit grid, round caps), drawn here so the app needs
// no icon font.
const ICONS = {
  back: () => <Polyline points="15,18 9,12 15,6" />,
  chevron: () => <Polyline points="9,18 15,12 9,6" />,
  arrow: () => (
    <>
      <Line x1="5" y1="12" x2="19" y2="12" />
      <Polyline points="13,6 19,12 13,18" />
    </>
  ),
  camera: () => (
    <>
      <Path d="M3.5 8.5A2 2 0 0 1 5.5 6.5h2l1.5-2.5h6l1.5 2.5h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" />
      <Circle cx="12" cy="13" r="3.5" />
    </>
  ),
  image: () => (
    <>
      <Rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
      <Circle cx="9" cy="10" r="1.6" />
      <Path d="M20.5 15.5l-4.8-4.6L6 19.5" />
    </>
  ),
  pin: () => (
    <>
      <Path d="M12 21s-6.5-5.7-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 15.3 12 21 12 21z" />
      <Circle cx="12" cy="9.8" r="2.3" />
    </>
  ),
  map: () => (
    <>
      <Path d="M9 4.5L3.5 6.8v12.7L9 17.2l6 2.3 5.5-2.3V4.5L15 6.8z" />
      <Line x1="9" y1="4.5" x2="9" y2="17.2" />
      <Line x1="15" y1="6.8" x2="15" y2="19.5" />
    </>
  ),
  check: () => <Polyline points="5,12.5 10,17.5 19,7.5" />,
  alert: () => (
    <>
      <Path d="M10.3 4.6L3 17.5a2 2 0 0 0 1.7 3h14.6a2 2 0 0 0 1.7-3L13.7 4.6a2 2 0 0 0-3.4 0z" />
      <Line x1="12" y1="9.5" x2="12" y2="13.5" />
      <Line x1="12" y1="16.8" x2="12.01" y2="16.8" />
    </>
  ),
  scan: () => (
    <>
      <Path d="M4 8.5V6a2 2 0 0 1 2-2h2.5" />
      <Path d="M15.5 4H18a2 2 0 0 1 2 2v2.5" />
      <Path d="M20 15.5V18a2 2 0 0 1-2 2h-2.5" />
      <Path d="M8.5 20H6a2 2 0 0 1-2-2v-2.5" />
      <Circle cx="12" cy="12" r="3" />
    </>
  ),
};

export default function Icon({ name, size = 20, color = '#0B1B33', strokeWidth = 1.8 }) {
  const draw = ICONS[name];
  if (!draw) return null;
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {draw()}
    </Svg>
  );
}
