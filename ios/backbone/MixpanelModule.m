#import <Foundation/Foundation.h>
#import "MixpanelModule.h"
#import "Mixpanel/Mixpanel.h"

@implementation MixpanelModule  {
  Mixpanel* mixpanel;
}

- (id)init {
  self = [super init];
  // Retrieve singleton instance of the Mixpanel API
  mixpanel = [Mixpanel sharedInstance];
  return self;
}

RCT_EXPORT_MODULE(Mixpanel);

/**
 Tracks an event with no properties
 @param event The name of the event to send
 */
RCT_EXPORT_METHOD(track:(NSString *)event) {
  [mixpanel track:event];
}

/**
 Tracks an event with properties
 @param event The name of the event to send
 @param properties Key-value pairs of the properties to include in the event
 */
RCT_EXPORT_METHOD(trackWithProperties:(NSString *)event properties:(NSDictionary *)properties) {
  [mixpanel track:event properties:properties];
}

/**
 Creates an alias for linking a user ID to the current ID
 @param newId New ID to link to current ID
 */
RCT_EXPORT_METHOD(createAlias:(NSString *)newId) {
  [mixpanel createAlias:newId forDistinctID:mixpanel.distinctId];
}

/**
 Associates future calls to track(String) with the user identified by the given distinct ID
 @param uniqueId
 */
RCT_EXPORT_METHOD(identify:(NSString *) uniqueId) {
  [mixpanel identify:uniqueId];
}

/**
 Begins timing an event
 @param event The name of the event to track with timing
 */
RCT_EXPORT_METHOD(timeEvent:(NSString *)event) {
  [mixpanel timeEvent:event];
}

/**
 Registers properties that will be sent with every subsequent call to track:
 @param properties Super properties to register
 */
RCT_EXPORT_METHOD(registerSuperProperties:(NSDictionary *)properties) {
  [mixpanel registerSuperProperties:properties];
}

/**
 Registers super properties like registerSuperProperties:, but only
 if no other super property with the same names have already been registered
 @param properties Super properties to register
 */
RCT_EXPORT_METHOD(registerSuperPropertiesOnce:(NSDictionary *)properties) {
  [mixpanel registerSuperPropertiesOnce:properties];
}

/**
 Sets a collection of properties on a user all at once
 @param properties Key-value pair of property names and values
 */
RCT_EXPORT_METHOD(set:(NSDictionary *)properties) {
  [mixpanel.people set:properties];
}

@end
