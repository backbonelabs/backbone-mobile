#import <CoreBluetooth/CoreBluetooth.h>
#import "RCTBridgeModule.h"
#import "RCTEventEmitter.h"

@interface BluetoothService : RCTEventEmitter <CBCentralManagerDelegate, RCTBridgeModule>
@property (nonatomic, strong) CBCentralManager *centralManager;
- (void)centralManagerDidUpdateState:(CBCentralManager *)central;
- (void)emitCentralState;
- (void)startObserving;
- (void)stopObserving;

@end
