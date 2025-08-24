// Copyright 2018 The Outline Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

#ifndef Outline_Bridging_Header_h
#define Outline_Bridging_Header_h

#import <Foundation/Foundation.h>

// Make Cordova headers visible even if HEADER_SEARCH_PATHS are not yet configured.
// Prefer the umbrella header Cordova.h if available, then CDV.h, then local fallbacks.
#if __has_include(<Cordova/Cordova.h>)
  #import <Cordova/Cordova.h>
#elif __has_include(<Cordova/CDV.h>)
  #import <Cordova/CDV.h>
#elif __has_include("Cordova.h")
  #import "Cordova.h"
#elif __has_include("CDV.h")
  #import "CDV.h"
#else
  #error "Cordova headers not found. Ensure CordovaLib is added and HEADER_SEARCH_PATHS include $(BUILT_PRODUCTS_DIR)/usr/local/lib/include and $(OBJROOT)/UninstalledProducts/include."
#endif

#endif /* Outline_Bridging_Header_h */
