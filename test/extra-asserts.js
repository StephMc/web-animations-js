/**
 * Copyright 2013 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

 /**
 * Features:
 *  - The menu bars and the page structure
 *  - Tests can be created via check()
 */

(function() {
// Boolean flag for whether the program is running in automatic mode
var runInAutoMode;
//Each index holds all the tests that occur at the same time
var testPacket = [];
// The parGroup all animations need to be added to to achieve 'global' pause
var parentAnimation;

// How long it takes an individual test to timeout in millisecs.
var testTimeout = 1000;
// How long it takes for the whole test system to timeout in millisecs.
var frameworkTimeout = 2000;

function testRecord(test, object, targets, time, message, cssStyle,
                    offsets, isRefTest){
  this.test = test;
  this.object = object;
  this.targets = targets;
  this.time = time;
  this.message = message;
  this.cssStyle = cssStyle;
  this.offsets = offsets;
  this.isRefTest = isRefTest;
}

// Call this function before setting up any checks.
// It generates the testing buttons and log and the testharness setup.
function setupTests(timeouts){
  // Use any user supplied timeouts
  for(var x in timeouts){
   if (x == "frameworkTimeout") frameworkTimeout = timeouts.frameworkTimeout;
   else if (x == "testTimeout") testTimeout = timeouts.testTimeout;
  }

  // Set up padding for option bar
  var padding = document.createElement('div');
  padding.id = "padding";
  document.body.appendChild(padding);

  // Generate options bar
  var optionBar = document.createElement('div');
  var select = document.createElement("select");
  select.setAttribute("id", "runType");
  var button = document.createElement("button");
  button.setAttribute("type", "button");
  button.setAttribute("onclick", "restart()");
  button.innerHTML = "Restart";
  document.body.appendChild(optionBar);
  optionBar.appendChild(select);
  optionBar.appendChild(button);

  // Generate the log div
  var log = document.createElement('div');
  log.id = "log";
  optionBar.appendChild(log);

  // Set buttons
  select.options[select.options.length] =
      new Option('Manual Run', 'Manual');
  select.options[select.options.length] =
      new Option('Auto Run', 'Auto');
  setAutoMode(window.location.href.split("?")[1] !== "Manual");

  // Set the inital selected drop down list item
  select.selectedIndex = runInAutoMode;
  setup({ explicit_done: true, timeout: frameworkTimeout});
}

// Allows tutorial harness to edit runInAutoMode
function setAutoMode(isAuto){
  runInAutoMode = isAuto;
}

// Adds each test to a list to be processed when runTests is called.
function check(object, targets, time, message){
  if(testPacket.length == 0) reparent();
  var test = async_test(message);
  test.timeout_length = testTimeout;

  // Store the inital css style of the animated object so it can be
  // used for manual flashing.
  var css = object.currentStyle || getComputedStyle(object, null);
  var offsets = [];
  offsets["top"] = getOffset(object).top - parseInt(css.top);
  offsets["left"] = getOffset(object).left- parseInt(css.left);
  if (targets.refTest == true){
    var maxTime = document.animationTimeline.children[0].animationDuration;
    // Generate a test for each time you want to check the objects.
    for (var x = 0; x < maxTime/time; x++){
      var temp = new testRecord(test, object, targets, time * x,
          "Property " + targets + " is not satisfied", css, offsets, true);
      testPacket.push(temp);
    }
    var temp = new testRecord(test, object, targets, time * x, "Property "
        + targets + " is not satisfied", css, offsets, "Last refTest");
    testPacket.push(temp);
  } else testPacket.push(new testRecord(test, object, targets, time, "Property "
        + targets + " is not satisfied", css, offsets, false));
}

// Helper function which gets the current absolute position of an object.
// From http://tiny.cc/vpbtrw
function getOffset(el) {
    var x = 0;
    var y = 0;
    while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
        x += el.offsetLeft - el.scrollLeft;
        y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
    }
    return { top: y, left: x };
}

// Put all the animations into a par group to get around global pause issue.
function reparent(){
  var childList = [];
  for (var i = 0; i < document.animationTimeline.children.length; i++) {
    childList.push(document.animationTimeline.children[i]);
  }
  parentAnimation = new ParGroup(childList);
}

//Call this after lining up the tests with check
function runTests(){
  // TODO
}

function restart(){
  // State only gets updated on init and Restart button push.
  var runType = document.getElementById("runType");
  var url = window.location.href.split("?");
  window.location.href = url[0] + "?" + runType.options[runType.selectedIndex].value;
}

///////////////////////////////////////////////////////////////////////////////
//  Exposing functions to be accessed externally                             //
///////////////////////////////////////////////////////////////////////////////
window.setupTests = setupTests;
window.check = check;
window.runTests = runTests;
window.restart = restart;
window.setAutoMode = setAutoMode;
})();