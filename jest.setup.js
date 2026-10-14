/* eslint-env jest */
require('react-native-safe-area-context/jest/mock').default;

jest.mock('react-native-screens', () => {
  const RealComponent = require('react-native').View;
  return {
    enableScreens: jest.fn(),
    ScreenContainer: RealComponent,
    Screen: RealComponent,
    NativeScreen: RealComponent,
    NativeScreenContainer: RealComponent,
    ScreenStack: RealComponent,
    ScreenStackHeaderConfig: RealComponent,
    ScreenStackHeaderSubview: RealComponent,
  };
});

jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');
  const SvgMock = (props) => React.createElement(View, props);
  return {
    __esModule: true,
    default: SvgMock,
    Svg: SvgMock,
    Circle: SvgMock,
    Ellipse: SvgMock,
    G: SvgMock,
    Text: SvgMock,
    TSpan: SvgMock,
    TextPath: SvgMock,
    Path: SvgMock,
    Polygon: SvgMock,
    Polyline: SvgMock,
    Line: SvgMock,
    Rect: SvgMock,
    Use: SvgMock,
    Image: SvgMock,
    Symbol: SvgMock,
    Defs: SvgMock,
    LinearGradient: SvgMock,
    RadialGradient: SvgMock,
    Stop: SvgMock,
    ClipPath: SvgMock,
    Pattern: SvgMock,
    Mask: SvgMock,
  };
});

jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MockIcon = (props) => React.createElement(View, props);
  return new Proxy(
    {},
    {
      get: () => MockIcon,
    }
  );
});
