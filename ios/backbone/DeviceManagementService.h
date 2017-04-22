#import <CoreBluetooth/CoreBluetooth.h>
#import <React/RCTEventEmitter.h>
#import <React/RCTBridgeModule.h>

@interface DeviceManagementService : RCTEventEmitter <RCTBridgeModule, CBCentralManagerDelegate> {
}

@end
