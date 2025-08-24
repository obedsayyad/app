#import "MainViewController.h"

@implementation MainViewController

- (void)viewDidLoad {
    [super viewDidLoad];
#if TARGET_OS_MACCATALYST
    self.view.backgroundColor = [UIColor systemBackgroundColor];
#else
    self.view.backgroundColor = [UIColor whiteColor];
#endif
}

@end