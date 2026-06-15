const ID_KEY = "me_body_device_id";
const NAME_KEY = "me_body_device_name";

function generateId(): string {
  const arr = new Uint8Array(12);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

export interface DeviceIdentity {
  deviceId: string;
  displayName: string;
}

export function getDeviceIdentity(): DeviceIdentity {
  if (typeof window === "undefined") return { deviceId: "server", displayName: "Server" };
  let deviceId = window.localStorage.getItem(ID_KEY);
  if (!deviceId) {
    deviceId = generateId();
    window.localStorage.setItem(ID_KEY, deviceId);
  }
  const displayName = window.localStorage.getItem(NAME_KEY) || deviceId.slice(0, 8);
  return { deviceId, displayName };
}

export function setDeviceDisplayName(name: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(NAME_KEY, name);
}

export function getDeviceId(): string {
  return getDeviceIdentity().deviceId;
}
