#import "BluetoothService.h"
//#import "BootLoaderService.h"
#import "RCTUtils.h"
#import "SensorDataService.h"

#import "Utilities.h"

@implementation BluetoothService

/**
 Returns a singleton instance of BluetoothService.
 @return BluetoothService A singleton instance of BluetoothService
 */
+ (BluetoothService*)getBluetoothService {
  static BluetoothService *_bluetoothService = nil;
  
  static dispatch_once_t bluetoothServiceInitialized;
  dispatch_once(&bluetoothServiceInitialized, ^{
    _bluetoothService = [[self alloc] initService];
  });
  
  return _bluetoothService;
}

- (id)initService {
  self = [super init];
  
  _characteristicDelegates = [NSMutableArray new];
  
  stateMap = @{
               @"0": [NSNumber numberWithInteger:-1],
               @"1": [NSNumber numberWithInteger:1],
               @"2": [NSNumber numberWithInteger:0],
               @"3": [NSNumber numberWithInteger:-1],
               @"4": [NSNumber numberWithInteger:2],
               @"5": [NSNumber numberWithInteger:4]
               };
  
  _servicesFound = [NSMutableDictionary new];
  
  self.centralManager = [[CBCentralManager alloc]
                         initWithDelegate:self
                         queue:nil
                         options:@{CBCentralManagerOptionShowPowerAlertKey: @(YES)}];
  
  // Listening to app termination event
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(applicationWillTerminate:)
                                               name:UIApplicationWillTerminateNotification
                                             object:nil];
  
  return self;
}

- (id)init {
  return [BluetoothService getBluetoothService];
}

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(getState:(RCTResponseSenderBlock)callback) {
  if (_state) {
    callback(@[[NSNull null], [stateMap valueForKey:[NSString stringWithFormat:@"%d", _state]]]);
  } else {
    NSDictionary *makeError = RCTMakeError(@"Error with Bluetooth", nil, @{@"state": [NSNull null]});
    callback(@[makeError]);
  }
}

- (void)centralManagerDidUpdateState:(CBCentralManager *)central {
  _state = [central state];
  
  switch (_state) {
    case CBCentralManagerStatePoweredOff: {
      DLog(@"Bluetooth is OFF");
      [[UIApplication sharedApplication] cancelAllLocalNotifications];
    }
      break;
    case CBCentralManagerStatePoweredOn: {
      DLog(@"Bluetooth is ON");
      [[UIApplication sharedApplication] cancelAllLocalNotifications];
    }
    default:
      break;
  }
  
  if (_isObserving) {
    [self emitCentralState];
  }
}

-(void)emitCentralState {
  DLog(@"Emitting central state: %i", _state);
  NSDictionary *stateUpdate = @{
                                @"state": [stateMap valueForKey:[NSString stringWithFormat:@"%d", _state]]
                                };
  [self sendEventWithName:@"BluetoothState" body:stateUpdate];
}

+ (BOOL)getIsEnabled {
  return [BluetoothService getBluetoothService].state == CBCentralManagerStatePoweredOn;
}

- (NSArray<NSString *> *)supportedEvents
{
  return @[@"BluetoothState"];
}

- (void)startObserving {
  _isObserving = YES;
}

- (void)stopObserving {
  _isObserving = NO;
}

- (void)addCharacteristicDelegate:(id<CBPeripheralDelegate>)delegate {
  if (delegate) {
    [_characteristicDelegates addObject:delegate];
  }
}

- (void)removeCharacteristicDelegate:(id<CBPeripheralDelegate>)delegate {
  [_characteristicDelegates removeObject:delegate];
}

- (void)startScanForBLEDevicesAllowDuplicates:(BOOL)duplicate handler:(DictionaryHandler)handler {
  self.scanDeviceHandler = handler;
  
  NSDictionary *options = @{
                            CBCentralManagerScanOptionAllowDuplicatesKey : [NSNumber numberWithBool:duplicate]
                            };
  
  [self.centralManager scanForPeripheralsWithServices:@[BACKBONE_SERVICE_UUID, BOOTLOADER_SERVICE_UUID] options:options];
//  [self.centralManager scanForPeripheralsWithServices:nil options:options];
}

- (void)stopScan {
  [self.centralManager stopScan];
}

- (void)selectDevice:(CBPeripheral *)device {
  if (device) {
    self.currentDevice = device;
  }
}

- (void)connectDevice:(CBPeripheral *)device completionBlock:(ErrorHandler)completionHandler {
  self.connectHandler = completionHandler;
  [self.centralManager connectPeripheral:device options:nil];
}

- (void)disconnectDevice:(ErrorHandler)completionHandler {
  if (self.currentDevice) {
    self.disconnectHandler = completionHandler;
    [self.centralManager cancelPeripheralConnection:self.currentDevice];
  }
}

- (void)centralManager:(CBCentralManager *)central didDiscoverPeripheral:(CBPeripheral *)peripheral advertisementData:(NSDictionary<NSString *, id> *)advertisementData RSSI:(NSNumber *)RSSI {
  DLog(@"New Device %@", peripheral);
//  BackboneDevice *device = [BackboneDevice new];
//  device.name = peripheral.name;
//  device.peripheral = [peripheral copy];
//  device.advertisementData = [advertisementData copy];
//  device.RSSI = [RSSI copy];
//  device.identifier = advertisementData[@"kCBAdvDataServiceUUIDs"] != nil && [advertisementData[@"kCBAdvDataServiceUUIDs"] count] > 0 ? advertisementData[@"kCBAdvDataServiceUUIDs"][0] : [NSNull null];
  
  NSDictionary *device = @{
                           @"name" : peripheral.name,
                           @"peripheral" : [peripheral copy],
                           @"advertisementData" : [advertisementData copy],
                           @"RSSI" : [RSSI copy],
                           @"identifier" : peripheral.identifier.UUIDString
//                           @"identifier" : (peripheral.identifier ? peripheral.identifier : (advertisementData[@"kCBAdvDataServiceUUIDs"] != nil && [advertisementData[@"kCBAdvDataServiceUUIDs"] count] > 0 ? advertisementData[@"kCBAdvDataServiceUUIDs"][0] : [NSNull null]))
                           };
  
  self.scanDeviceHandler(device);
}

- (void) centralManager:(CBCentralManager *)central didConnectPeripheral:(CBPeripheral *)peripheral
{
  DLog(@"didconnect %@", peripheral);
  _currentDevice = [peripheral copy];
  _currentDevice.delegate = self;
  
  [_currentDevice discoverServices:@[BACKBONE_SERVICE_UUID, BOOTLOADER_SERVICE_UUID, BATTERY_SERVICE_UUID]];
//  [_currentDevice discoverServices:nil];
}

- (void)centralManager:(CBCentralManager *)central didFailToConnectPeripheral:(CBPeripheral *)peripheral error:(nullable NSError *)error {
  self.connectHandler(error);
}

- (void) centralManager:(CBCentralManager *)central didDisconnectPeripheral:(CBPeripheral *)peripheral error:(NSError *)error {
  DLog(@"disconnect %@ %@", peripheral, error);
  if (error) {
    if (self.disconnectHandler != nil) {
      self.disconnectHandler(error);
    }
  }
  else {
//    if ([BootLoaderService getBootLoaderService].bootLoaderState == BOOTLOADER_STATE_INITIATED) {
//      [self.centralManager connectPeripheral:self.currentDevice options:nil];
//    }
//    else if (self.disconnectHandler != nil){
    if (self.disconnectHandler != nil){
      [_servicesFound removeAllObjects];
      
      self.currentDevice = nil;
      self.disconnectHandler(nil);
    }
  }
}

- (void)peripheral:(CBPeripheral *)peripheral didDiscoverServices:(NSError *)error
{
  if(error == nil) {
    DLog(@"Service : %@", peripheral.services);
    
    for (CBService *service in peripheral.services) {
      if ([service.UUID isEqual:BACKBONE_SERVICE_UUID] || [service.UUID isEqual:BATTERY_SERVICE_UUID]) {
//        [_currentDevice discoverCharacteristics:@[[CBUUID UUIDWithString:@"00000006-0010-0080-0000-805F9B34FB00"]] forService:service];
        [_currentDevice discoverCharacteristics:nil forService:service];
      }
//      else if ([service.UUID isEqual:BOOTLOADER_SERVICE_UUID]) {
//        [_currentDevice discoverCharacteristics:nil forService:service];
////        [_currentDevice discoverCharacteristics:@[[CBUUID UUIDWithString:@"00000006-0010-0080-0000-805F9B34FB00"]] forService:service];
//      }
    }
  }
  else {
  }
}

- (void)peripheral:(CBPeripheral *)peripheral didUpdateNotificationStateForCharacteristic:(CBCharacteristic *)characteristic error:(NSError *)error{
  
  if (error) {
    DLog(@"Error changing notification state: %@ %@", characteristic.UUID, error.localizedDescription);
  }
  
  // Notification has started
  if (characteristic.isNotifying) {
    DLog(@"Notification active: %@ %@", characteristic.UUID, characteristic);
  }
}

-(void)peripheral:(CBPeripheral *)peripheral didDiscoverCharacteristicsForService:(CBService *)service error:(NSError *)error {
  DLog(@"Found Characteristics");
  
  if (service.characteristics && service.characteristics.count > 0) {
    [_servicesFound setObject:@(YES) forKey:service.UUID.UUIDString];
  }

  // Check if all required services are ready
  if ([_servicesFound count] == 2) {
    self.connectHandler(nil);
  }
  
  if ([service.UUID isEqual:BACKBONE_SERVICE_UUID]) {
    for (CBCharacteristic *characteristic in service.characteristics) {
      if ([characteristic.UUID isEqual:ENTER_BOOTLOADER_CHARACTERISTIC_UUID]) {
        
      }
      else if ([characteristic.UUID isEqual:ACCELEROMETER_CHARACTERISTIC_UUID]) {
//        [self.currentDevice setNotifyValue:YES forCharacteristic:characteristic];
      }
    }
  }
  else if ([service.UUID isEqual:BOOTLOADER_SERVICE_UUID]) {
    for (CBCharacteristic *characteristic in service.characteristics) {
      if ([characteristic.UUID isEqual:BOOTLOADER_CHARACTERISTIC_UUID]) {
        
      }
    }
  }
  
  if ([_characteristicDelegates count] > 0) {
    for (id<CBPeripheralDelegate> delegate in _characteristicDelegates) {
      if ([delegate respondsToSelector:@selector(peripheral:didDiscoverCharacteristicsForService:error:)]) {
        [delegate peripheral:peripheral didDiscoverCharacteristicsForService:service error:error];
      }
    }
  }
}

- (void)peripheral:(CBPeripheral *)peripheral didWriteValueForCharacteristic:(CBCharacteristic *)characteristic error:(NSError *)error {
  if (error == nil) {
    
  }
  
  if ([_characteristicDelegates count] > 0) {
    for (id<CBPeripheralDelegate> delegate in _characteristicDelegates) {
      if ([delegate respondsToSelector:@selector(peripheral:didWriteValueForCharacteristic:error:)]) {
        [delegate peripheral:peripheral didWriteValueForCharacteristic:characteristic error:error];
      }
    }
  }
}

-(void)peripheral:(CBPeripheral *)peripheral didUpdateValueForCharacteristic:(CBCharacteristic *)characteristic error:(NSError *)error {
  if ([characteristic.UUID isEqual:ACCELEROMETER_CHARACTERISTIC_UUID]) {
//    DLog(@"CharVal %@", characteristic.value);
//    uint8_t *dataPointer = (uint8_t*) [characteristic.value bytes];
//    DLog(@"Val %x %x %x %x", dataPointer[0], dataPointer[1], dataPointer[2], dataPointer[3]);
//    
//    uint8_t tmpX[] = {dataPointer[0], dataPointer[1], dataPointer[2], dataPointer[3]};
//    uint8_t tmpY[] = {dataPointer[4], dataPointer[5], dataPointer[6], dataPointer[7]};
//    uint8_t tmpZ[] = {dataPointer[8], dataPointer[9], dataPointer[10], dataPointer[11]};
//    
//    float xAxis = [Utilities convertToFloatFromBytes:tmpX];
//    float yAxis = [Utilities convertToFloatFromBytes:tmpY];
//    float zAxis = [Utilities convertToFloatFromBytes:tmpZ];
//    
//    DLog(@"Accel %f %f %f", xAxis, yAxis, zAxis);
  }
  
  if ([_characteristicDelegates count] > 0) {
    for (id<CBPeripheralDelegate> delegate in _characteristicDelegates) {
      if ([delegate respondsToSelector:@selector(peripheral:didUpdateValueForCharacteristic:error:)]) {
        [delegate peripheral:peripheral didUpdateValueForCharacteristic:characteristic error:error];
      }
    }
  }
}

// Handler for application termination
- (void)applicationWillTerminate:(NSNotification *)notification {
  DLog(@"Application Will Terminate");
  // Cancel all prior notifications before termination
  [[UIApplication sharedApplication] cancelAllLocalNotifications];
  
  // Close all open events and stop all sensors
  [[SensorDataService getSensorDataService] unregisterAllActivities];
  
  // Gives the app additional time before termination
  [NSThread sleepForTimeInterval:2];
}

@end
