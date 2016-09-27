#import "BluetoothService.h"
#import "RCTUtils.h"

@implementation BluetoothService

static int _state;
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
