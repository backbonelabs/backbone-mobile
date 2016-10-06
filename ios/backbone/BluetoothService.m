#import "BluetoothService.h"
#import "RCTUtils.h"
#import "SensorDataService.h"

@implementation BluetoothService

/**
 Returns a singleton instance of BluetoothService.
 @return BluetoothService A singleton instance of BluetoothService
 */
+ (BluetoothService*)getBluetoothService {
  static BluetoothService *_bluetoothService = nil;
  
  static dispatch_once_t bluetoothServiceInitialized;
  dispatch_once(&bluetoothServiceInitialized, ^{
    _bluetoothService = [[self alloc] init];
  });
  
  return _bluetoothService;
}

- (id)init {
  self = [super init];
  
  stateMap = @{
               @"0": [NSNumber numberWithInteger:-1],
               @"1": [NSNumber numberWithInteger:1],
               @"2": [NSNumber numberWithInteger:0],
               @"3": [NSNumber numberWithInteger:-1],
               @"4": [NSNumber numberWithInteger:2],
               @"5": [NSNumber numberWithInteger:4]
               };
  
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
      NSLog(@"Bluetooth is OFF");
      [[UIApplication sharedApplication] cancelAllLocalNotifications];
    }
      break;
    case CBCentralManagerStatePoweredOn: {
      NSLog(@"Bluetooth is ON");
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
  NSLog(@"Emitting central state: %i", _state);
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

// Handler for application termination
- (void)applicationWillTerminate:(NSNotification *)notification {
  NSLog(@"Application Will Terminate");
  // Cancel all prior notifications before termination
  [[UIApplication sharedApplication] cancelAllLocalNotifications];
  
  // Close all open events and stop all sensors
  [[SensorDataService getSensorDataService] unregisterAllActivities];
  
  // Gives the app additional time before termination
  [NSThread sleepForTimeInterval:2];
}

@end
