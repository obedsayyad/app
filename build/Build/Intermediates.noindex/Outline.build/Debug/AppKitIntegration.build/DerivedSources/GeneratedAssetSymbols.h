#import <Foundation/Foundation.h>

#if __has_attribute(swift_private)
#define AC_SWIFT_PRIVATE __attribute__((swift_private))
#else
#define AC_SWIFT_PRIVATE
#endif

/// The "status_bar_button_image" asset catalog image resource.
static NSString * const ACImageNameStatusBarButtonImage AC_SWIFT_PRIVATE = @"status_bar_button_image";

/// The "status_bar_button_image_connected" asset catalog image resource.
static NSString * const ACImageNameStatusBarButtonImageConnected AC_SWIFT_PRIVATE = @"status_bar_button_image_connected";

#undef AC_SWIFT_PRIVATE
