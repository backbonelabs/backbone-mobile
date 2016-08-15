#import "BluetoothService.h"

@implementation BluetoothService

static BOOL _isObserving;

- (id)init {
  self = [super init];
  self.centralManager = [[CBCentralManager alloc] initWithDelegate:self queue:nil options:nil];
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
                          };
  [self sendEventWithName:@"CentralStatus" body:stateUpdate];
}

- (NSArray<NSString *> *)supportedEvents
{
  return @[@"CentralStatus"];
}

- (void)startObserving {
  _isObserving = YES;
}

- (void)stopObserving {
  _isObserving = NO;
}

@end
