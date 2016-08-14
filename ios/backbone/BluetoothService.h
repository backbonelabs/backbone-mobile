#import <CoreBluetooth/CoreBluetooth.h>
#import "RCTBridgeModule.h"

@interface BluetoothService : NSObject <CBCentralManagerDelegate, RCTBridgeModule>
@property CBCentralManager *centralManager;
- (void)centralManagerDidUpdateState:(CBCentralManager *)central;
@end