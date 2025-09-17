// navigationRef.ts
import { createNavigationContainerRef } from "@react-navigation/native";

export const navigationRef: any = createNavigationContainerRef();

export function navigate(name: string, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as never, params as never);
  }
}
