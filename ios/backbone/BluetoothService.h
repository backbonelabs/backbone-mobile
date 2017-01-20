#import <CoreBluetooth/CoreBluetooth.h>
#import "RCTBridgeModule.h"
#import "RCTEventEmitter.h"
#import "Constants.h"

@interface BluetoothService : RCTEventEmitter <CBCentralManagerDelegate, CBPeripheralDelegate, RCTBridgeModule> {
  BOOL _isObserving;
  BOOL _shouldRestart;
  NSDictionary *stateMap;
  NSMutableDictionary *_servicesFound;
  NSMutableDictionary *_characteristicMap;
  NSMutableArray *_characteristicDelegates;
}

@property (nonatomic, strong) CBCentralManager *centralManager;
@property (nonatomic, copy) DictionaryHandler scanDeviceHandler;
@property (nonatomic, copy) ErrorHandler connectHandler;
@property (nonatomic, copy) ErrorHandler disconnectHandler;
@property (nonatomic, strong) CBPeripheral *currentDevice;

@property int state;
@property int currentDeviceMode;

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

- (BOOL)isDeviceReady;
- (CBCharacteristic*)getCharacteristicByUUID:(CBUUID*)uuid;

- (void)applicationWillTerminate:(NSNotification *)notification;
@end
