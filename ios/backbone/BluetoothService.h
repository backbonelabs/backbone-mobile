#import <CoreBluetooth/CoreBluetooth.h>
#import "RCTBridgeModule.h"

@interface BluetoothService : NSObject <CBCentralManagerDelegate, RCTBridgeModule>
@property (nonatomic, strong) CBCentralManager *centralManager;
- (void)centralManagerDidUpdateState:(CBCentralManager *)central;
@end