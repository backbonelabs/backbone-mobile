#import "BluetoothService.h"
#import "DeviceInformationService.h"
#import "BootLoaderService.h"
#import <React/RCTUtils.h>

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
  
  _state = CBCentralManagerStateUnknown;
  _currentDeviceMode = DEVICE_MODE_UNKNOWN;
  _currentDeviceIdentifier = @"";
  
  stateMap = @{
               @"0": [NSNumber numberWithInteger:-1],
               @"1": [NSNumber numberWithInteger:1],
               @"2": [NSNumber numberWithInteger:0],
               @"3": [NSNumber numberWithInteger:-1],
               @"4": [NSNumber numberWithInteger:2],
               @"5": [NSNumber numberWithInteger:4]
               };
  
  _servicesFound = [NSMutableDictionary new];
  _characteristicMap = [NSMutableDictionary new];
  
  _shouldRestart = NO;
  
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

/**
 Returns the current Bluetooth state (based on the custom state map) to a callback
 @param callback The Bluetooth state is passed in the second argument as a key of a dictionary
 */
RCT_EXPORT_METHOD(getState:(RCTResponseSenderBlock)callback) {
  callback(@[[NSNull null], @{
                              @"state": [stateMap valueForKey:[NSString stringWithFormat:@"%d", _state]]
                              }]);
}

- (void)centralManagerDidUpdateState:(CBCentralManager *)central {
  _state = [central state];
  
  switch (_state) {
    case CBCentralManagerStatePoweredOff: {
      DLog(@"Bluetooth is OFF");
    }
      break;
    case CBCentralManagerStatePoweredOn: {
      DLog(@"Bluetooth is ON");
    }
    default:
      break;
  }
  
  if (_isObserving) {
    [self emitCentralState];
  }
}

- (void)emitCentralState {
  DLog(@"Emitting central state: %i", _state);
  NSDictionary *stateUpdate = @{
                                @"state": [stateMap valueForKey:[NSString stringWithFormat:@"%d", _state]]
                                };
  [self sendEventWithName:@"BluetoothState" body:stateUpdate];
}

- (void)emitDeviceState {
  int deviceState = (int)(self.currentDevice == nil ? CBPeripheralStateDisconnected : _currentDevice.state);
  
  DLog(@"Emitting device state: %d", deviceState);
  NSDictionary *stateUpdate = @{
                                @"state": @(deviceState)
                                };
  [self sendEventWithName:@"DeviceState" body:stateUpdate];
}

+ (BOOL)getIsEnabled {
  return [BluetoothService getBluetoothService].state == CBCentralManagerStatePoweredOn;
}

- (NSArray<NSString *> *)supportedEvents
{
  return @[@"BluetoothState", @"DeviceState"];
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
  if ([self.centralManager isScanning]) {
    [self.centralManager stopScan];
  }
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
  self.disconnectHandler = completionHandler;
  
  if (self.currentDevice && (self.currentDevice.state == CBPeripheralStateConnected || self.currentDevice.state == CBPeripheralStateConnecting)) {
    [self.centralManager cancelPeripheralConnection:self.currentDevice];
  }
  else if (completionHandler) {
    self.disconnectHandler(nil);
    self.disconnectHandler = nil;
  }
}

- (BOOL)isDeviceReady {
  return self.currentDevice != nil && self.currentDevice.state == CBPeripheralStateConnected;
}

- (BOOL)shouldRestart {
  return _shouldRestart;
}

- (CBCharacteristic*)getCharacteristicByUUID:(CBUUID *)uuid {
  if (uuid == nil) return nil;
  return _characteristicMap[uuid];
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

- (void)centralManager:(CBCentralManager *)central didConnectPeripheral:(CBPeripheral *)peripheral
{
  DLog(@"didconnect %@", peripheral);
  _currentDevice = [peripheral copy];
  _currentDevice.delegate = self;

  _currentDeviceIdentifier = [peripheral.identifier.UUIDString copy];
  
  [_currentDevice discoverServices:@[BACKBONE_SERVICE_UUID, BOOTLOADER_SERVICE_UUID, BATTERY_SERVICE_UUID]];
}

- (void)centralManager:(CBCentralManager *)central didFailToConnectPeripheral:(CBPeripheral *)peripheral error:(nullable NSError *)error {
  DLog(@"Did fail connect %@", error);
  if (self.connectHandler) {
    self.connectHandler(error);
    self.connectHandler = nil;
  }
}

- (void) centralManager:(CBCentralManager *)central didDisconnectPeripheral:(CBPeripheral *)peripheral error:(NSError *)error {
  DLog(@"disconnect %@ %@", peripheral, error);
  [_servicesFound removeAllObjects];
  [_characteristicMap removeAllObjects];
  
  if ([BootLoaderService getBootLoaderService].bootLoaderState == BOOTLOADER_STATE_INITIATED) {
    DLog(@"Reconnect %@", self.currentDevice);
    // Reconnect right away to proceed with the actual firmware update
    [self.centralManager connectPeripheral:self.currentDevice options:nil];
  }
  else if ([BootLoaderService getBootLoaderService].bootLoaderState == BOOTLOADER_STATE_ON && _shouldRestart) {
    // Reconnect after switching back to normal services
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, 3 * NSEC_PER_SEC), dispatch_get_main_queue(), ^{
      DLog(@"Reconnect Restart %@", self.currentDevice);
      [self.centralManager connectPeripheral:self.currentDevice options:nil];
    });
  }
  else if ([BootLoaderService getBootLoaderService].bootLoaderState == BOOTLOADER_STATE_UPDATED) {
    // Delay of 3 seconds added before reconnecting
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, 3 * NSEC_PER_SEC), dispatch_get_main_queue(), ^{
      DLog(@"Reconnect Updated %@", self.currentDevice);
      // Firmware upgrade finished, reconnect to the normal Backbone service
      [self.centralManager connectPeripheral:self.currentDevice options:nil];
    });
  }
  else {
    if (error) {
      if (self.disconnectHandler != nil) {
        self.currentDevice = nil;
        self.disconnectHandler(error);
        self.disconnectHandler = nil;
      }
    }
    else {
      if (self.disconnectHandler != nil) {
        self.currentDevice = nil;
        self.disconnectHandler(nil);
        self.disconnectHandler = nil;
      }
    }
    
    // Emit the device disconnection event
    [self emitDeviceState];
  }
}

- (void)peripheral:(CBPeripheral *)peripheral didDiscoverServices:(NSError *)error
{
  if(error == nil) {
    DLog(@"Service : %@", peripheral.services);
    
    for (CBService *service in peripheral.services) {
      if ([service.UUID isEqual:BACKBONE_SERVICE_UUID] || [service.UUID isEqual:BATTERY_SERVICE_UUID]) {
        self.currentDeviceMode = DEVICE_MODE_BACKBONE;
        
        [_currentDevice discoverCharacteristics:nil forService:service];
      }
      else if ([service.UUID isEqual:BOOTLOADER_SERVICE_UUID]) {
        self.currentDeviceMode = DEVICE_MODE_BOOTLOADER;
        
        [_currentDevice discoverCharacteristics:nil forService:service];
      }
    }
  }
  else {
  }
}

- (void)peripheral:(CBPeripheral *)peripheral didUpdateNotificationStateForCharacteristic:(CBCharacteristic *)characteristic error:(NSError *)error{
  
  if (error) {
    DLog(@"Error changing notification state: %@ %@", characteristic.UUID, error.localizedDescription);
  }
  
  if ([_characteristicDelegates count] > 0) {
    for (id<CBPeripheralDelegate> delegate in _characteristicDelegates) {
      if ([delegate respondsToSelector:@selector(peripheral:didUpdateNotificationStateForCharacteristic:error:)]) {
        [delegate peripheral:peripheral didUpdateNotificationStateForCharacteristic:characteristic error:error];
      }
    }
  }
  
  // Notification has started
  if (characteristic.isNotifying) {
    DLog(@"Notification active: %@ %@", characteristic.UUID, characteristic);
  }
}

- (void)peripheral:(CBPeripheral *)peripheral didDiscoverCharacteristicsForService:(CBService *)service error:(NSError *)error {
  DLog(@"Found Characteristics");
  
  if (service.characteristics && service.characteristics.count > 0) {
    [_servicesFound setObject:@(YES) forKey:service.UUID.UUIDString];
  }
  
  if (_shouldRestart) _shouldRestart = NO;
  
  // Check if all required services are ready
  if (self.currentDeviceMode == DEVICE_MODE_BACKBONE) {
    if ([_servicesFound count] == 2) {
      // Check for pending notification of a successful firmware update
      if ([BootLoaderService getBootLoaderService].bootLoaderState == BOOTLOADER_STATE_UPDATED) {
        // Successfully restarted after upgrading firmware
        DLog(@"Firmware Updated Successfully");
        DLog(@"CURRENT DEVICE %i", self.currentDeviceMode);
        [[BootLoaderService getBootLoaderService] firmwareUpdated];
        [[DeviceInformationService getDeviceInformationService] refreshDeviceTestStatus];
        [self emitDeviceState];
      }
      else if (self.connectHandler) {
        self.connectHandler(nil);
        self.connectHandler = nil;
      }
      else {
        [self emitDeviceState];
      }
        
      [BootLoaderService getBootLoaderService].bootLoaderState = BOOTLOADER_STATE_OFF;
    }
  }
  else if (self.currentDeviceMode == DEVICE_MODE_BOOTLOADER) {
    if ([_servicesFound count] == 1) {
      if ([BootLoaderService getBootLoaderService].bootLoaderState == BOOTLOADER_STATE_OFF) {
        // Device booted into BootLoaderMode outside of firmware update flow
        // In this case, the app should attempt to issue an Exit command to retry resetting into normal services
        _shouldRestart = YES;
      }
      else if ([BootLoaderService getBootLoaderService].bootLoaderState == BOOTLOADER_STATE_ON) {
        // The attempt to reset back into normal services failed
        // The app should inform the React side to initiate firmware update flow
        _shouldRestart = NO;
        
        if (self.connectHandler) {
          self.connectHandler(nil);
          self.connectHandler = nil;
        }
        else {
          [self emitDeviceState];
        }
      }
      else if ([BootLoaderService getBootLoaderService].bootLoaderState == BOOTLOADER_STATE_UPLOADING) {
        DLog(@"Abort previous firmware update");
        // Connection was restored after a lost connection when a firmware update was running
        // Reset back to initial bootloader state
        [BootLoaderService getBootLoaderService].bootLoaderState = BOOTLOADER_STATE_ON;
        
        if (self.connectHandler) {
          self.connectHandler(nil);
          self.connectHandler = nil;
        }
        else {
          [self emitDeviceState];
        }
      }
    }
  }
  
  // BluetoothService should keep track of currently active services and characteristics
  for (CBCharacteristic *characteristic in service.characteristics) {
    [_characteristicMap setObject:characteristic forKey:characteristic.UUID];
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

- (void)peripheral:(CBPeripheral *)peripheral didUpdateValueForCharacteristic:(CBCharacteristic *)characteristic error:(NSError *)error {
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
  // Gives the app additional time before termination
  [NSThread sleepForTimeInterval:2];
}

@end
