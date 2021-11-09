<script>
  import {
    currentHypothesis,
    hypotheses,
    counters,
    samples,
    upload,
  } from "./stores.js";

  function exp() {
    let arr = [];
    let currHyp = $hypotheses[$currentHypothesis];
    arr.push({
      name: currHyp.name,
      imgs: Array.from(currHyp.imgs),
      descs: Array.from(currHyp.descs),
      counters: $counters[$currentHypothesis],
      samples: $samples[$currentHypothesis],
    });

    down(arr, currHyp.name + ".json");
  }

  function expAll() {
    let hypos = [];
    $hypotheses.forEach((h, i) => {
      let currHyp = $hypotheses[i];
      hypos.push({
        name: currHyp.name,
        imgs: Array.from(currHyp.imgs),
        descs: Array.from(currHyp.descs),
        counters: $counters[i],
        samples: $samples[i],
      });
    });
    down(hypos, "allHypotheses.json");
  }

  function down(e, name) {
    let element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(e))
    );
    element.setAttribute("download", name);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
</script>

<div
  class="inline-flex justify-center items-center tc b--black-10 center pa2 mt1
  bt absolute bottom-0 mv2"
  style="width:25rem"
>
  <button class="raised-btn-txt mr3" on:click={(_) => upload.set("import")}>
    Import
  </button>
  <button class="raised-btn-txt mr3" on:click={(_) => exp()}>Export</button>
  <button class="raised-btn-txt" on:click={(_) => expAll()}>Export All</button>
</div>
