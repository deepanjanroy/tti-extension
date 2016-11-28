console.log("Extension loaded");
document.onkeydown = event => {
  if (event.key == "i") {
    console.log("Interactive timestamp recorded");
    console.timeStamp("firstInteractive");
  }

  if (event.key == 's' ) {
    console.log("Begin tracing");
    console.log(chrome);
    // chrome.debug.sendCommand("Tracing.start");
  }
};

// This is the new extension code vvvvv
function main() {
  console.log("executing main :D");

  var ttiHistogramNames = [
    'firstInteractive-FMP',
    'firstInteractive-FCP',
    'firstInteractive-StartNav',
    'firstInteractive-FMP-ReverseSearch',
    'firstInteractive-FCP-ReverseSearch',
    'firstInteractive-StartNav-ReverseSearch',
    'firstInteractive-FMP-Network'
  ];

  // Global instant events are fat and easy to see. This function
  // adds a big black global instant event.
  function addGlobalInstantEvent(model, name, timestamp) {
    console.log("Adding instant event for ", timestamp);
    var e = new tr.model.InstantEvent("tti-experiment", name,
        tr.b.ColorScheme.getColorIdForReservedName("black"), timestamp);
    model.instantEvents.push(e);
  }

  function markTimeline() {
    var timelineView = document.querySelector('tr-ui-timeline-view');
    var model = timelineView.model;

    if (!model) {
      // TODO: Show a message: Please load a trace first.
      console.warn("No model found. Load a trace first?");
    }

    var histogramSet = new tr.v.HistogramSet();
    tr.metrics.sh.loadingMetric(histogramSet, model);
    console.log("histogramSet", histogramSet);

    for (var histogramName of ttiHistogramNames) {
      var values = histogramSet.getValuesNamed(histogramName);
      console.log("histogramValues for", histogramName, values);
      if (values.length > 1) {
        console.warn("More than one histogram found of ", histogramName);
        console.warn("I don't know what to do with all these.");
        continue;
      }
      if (values.length < 1) continue;

      var metricValue = values[0];
      console.log("merticValue", metricValue);
      if (metricValue.running.count > 1) {
        console.warn("More than one value was added to the histogram of ", histogramName);
        console.warn("I can't handle this yet");
        continue;
      }
      if (metricValue.running.count < 1) continue;
      console.log("processing ", histogramName);
      addGlobalInstantEvent(model, histogramName, metricValue.running.mean);
    }
  }

  markTimeline();
}

chrome.runtime.onMessage.addListener(function(request) {
  console.log("message received");
  if (request.action == "markTimeline") {
    // Much security.
    var script = document.createElement('script');
    script.textContent = '(' + main.toString() + ')()';
    (document.head || document.documentElement).appendChild(script);
  }
});
