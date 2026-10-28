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

// --- Firebase / native module mocks cho Jest ---
jest.mock('firebase/app', () => ({
  getApps: jest.fn(() => []),
  getApp: jest.fn(() => ({})),
  initializeApp: jest.fn(() => ({})),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({ currentUser: null })),
  initializeAuth: jest.fn(() => ({ currentUser: null })),
  getReactNativePersistence: jest.fn(() => ({})),
  onAuthStateChanged: jest.fn(() => jest.fn()),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(() => Promise.resolve()),
  updateProfile: jest.fn(() => Promise.resolve()),
}));

jest.mock('firebase/database', () => ({
  getDatabase: jest.fn(() => ({})),
  ref: jest.fn(() => ({})),
  child: jest.fn(() => ({})),
  onValue: jest.fn(() => jest.fn()),
  off: jest.fn(),
  get: jest.fn(() => Promise.resolve({ exists: () => false })),
  set: jest.fn(() => Promise.resolve()),
  update: jest.fn(() => Promise.resolve()),
  onDisconnect: jest.fn(() => ({
    set: jest.fn(() => Promise.resolve()),
    cancel: jest.fn(() => Promise.resolve()),
  })),
  serverTimestamp: jest.fn(() => Date.now()),
  increment: jest.fn((value) => value),
  push: jest.fn(() => ({ key: 'mock-message-id' })),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  createAsyncStorage: jest.fn(() => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  })),
}));

jest.mock('@react-native-community/geolocation', () => ({
  __esModule: true,
  default: {
    setRNConfiguration: jest.fn(),
    requestAuthorization: jest.fn(),
    getCurrentPosition: jest.fn(),
  },
}));
