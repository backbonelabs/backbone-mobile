#import <CoreBluetooth/CoreBluetooth.h>
#import "RCTBridgeModule.h"
#import "RCTEventEmitter.h"
#import "Constants.h"

@interface BluetoothService : RCTEventEmitter <CBCentralManagerDelegate, CBPeripheralDelegate, RCTBridgeModule> {
  BOOL _isObserving;
  NSDictionary *stateMap;
  NSMutableDictionary *_servicesFound;
  NSMutableArray *_characteristicDelegates;
}

@property (nonatomic, strong) CBCentralManager *centralManager;
@property (nonatomic, copy) DictionaryHandler scanDeviceHandler;
@property (nonatomic, copy) ErrorHandler connectHandler;
@property (nonatomic, copy) ErrorHandler disconnectHandler;
@property (nonatomic, strong) CBPeripheral *currentDevice;

@property int state;

+ (BluetoothService *)getBluetoothService;
- (id)initService;
+ (BOOL)getIsEnabled;
- (void)emitCentralState;
- (void)startObserving;
- (void)stopObserving;

- (void)addCharacteristicDelegate:(id<CBPeripheralDelegate>)delegate;
- (void)removeCharacteristicDelegate:(id<CBPeripheralDelegate>)delegate;

- (void)startScanForBLEDevicesAllowDuplicates:(BOOL)duplicate handler:(DictionaryHandler)handler;
- (void)stopScan;
- (void)selectDevice:(CBPeripheral*)device;
- (void)connectDevice:(CBPeripheral*)device completionBlock:(ErrorHandler)completionHandler;
- (void)disconnectDevice:(ErrorHandler)completionHandler;

- (void)applicationWillTerminate:(NSNotification *)notification;
@end
