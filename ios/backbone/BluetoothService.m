#import "BluetoothService.h"

@implementation BluetoothService

static BOOL _isObserving;
static NSDictionary *stateMap;

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
                          @"state": [stateMap valueForKey:[NSString stringWithFormat:@"%d", state]]
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
