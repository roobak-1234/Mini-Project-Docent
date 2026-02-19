/// <reference types="nativewind/types" />
/// <reference types="expo/types" />
import "react-native-safe-area-context";

declare module "react-native-safe-area-context" {
  export interface NativeSafeAreaViewProps {
    className?: string;
  }
}


declare module "*.png" {
  const value: any;
  export = value;
}

declare module "*.jpg" {
  const value: any;
  export = value;
}

declare module "*.jpeg" {
  const value: any;
  export = value;
}

declare module "*.svg" {
  const value: any;
  export = value;
}