#import <CoreBluetooth/CoreBluetooth.h>
#import "RCTBridgeModule.h"
#import "RCTEventEmitter.h"

@interface BluetoothService : RCTEventEmitter <CBCentralManagerDelegate, RCTBridgeModule> {
  BOOL _isObserving;
  NSDictionary *stateMap;
}
@property (nonatomic, strong) CBCentralManager *centralManager;
@property int state;
+ (BluetoothService *)getBluetoothService;
- (id)initService;
+ (BOOL)getIsEnabled;
- (void)centralManagerDidUpdateState:(CBCentralManager *)central;
- (void)emitCentralState;
- (void)startObserving;
- (void)stopObserving;

- (void)applicationWillTerminate:(NSNotification *)notification;
@end
