#import "RCTEventEmitter.h"
#import "RCTBridgeModule.h"

@interface DeviceManagementService : RCTEventEmitter <RCTBridgeModule> {
  BOOL _hasPendingConnection;
}

@end
