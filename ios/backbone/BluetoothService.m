#import "BluetoothService.h"

@implementation BluetoothService

static BOOL _isObserving;

- (id)init {
  self = [super init];
  self.centralManager = [[CBCentralManager alloc]
                         initWithDelegate:self
                         queue:nil
                         options:@{CBCentralManagerOptionShowPowerAlertKey: @(YES)}];
  return self;
}

RCT_EXPORT_MODULE();

- (void)centralManagerDidUpdateState:(CBCentralManager *)central {
  if (_isObserving) {
    [self emitCentralState:[central state]];
  }
}

-(void)emitCentralState:(int)state {
  NSLog(@"Emitting central state: %i", state);
  NSDictionary *stateUpdate = @{
                          @"state": [NSNumber numberWithInt:state],
                          @"stateMap": @{
                              @"0": @"Unknown",
                              @"1": @"Resetting",
                              @"2": @"Unsupported",
                              @"3": @"Unauthorized",
                              @"4": @"Powered Off",
                              @"5": @"Powered On",
                              },
                          };
  [self sendEventWithName:@"BluetoothState" body:stateUpdate];
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

@end
