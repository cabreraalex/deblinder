<script>
  import { fade } from "svelte/transition";
  import {
    upload,
    samples,
    counters,
    currentHypothesis,
    hypotheses,
    preds,
  } from "./stores.js";

  let drop;
  let over = false;

  // OPTIONS: 'counter' 'sample' 'import'
  export let type;
  function handleDrop(e) {
    let dt = e.dataTransfer;
    let files = dt.files;
    handleFiles(files);
  }

  function handleFiles(files) {
    if (type === "sample") {
      [...files].forEach(uploadSample);
    } else if (type === "counter") {
      [...files].forEach(uploadCounter);
    } else {
      [...files].forEach(importHypo);
    }
    upload.set("");
  }

  function importHypo(f) {
    let reader = new FileReader();
    reader.onload = function (event) {
      var hyp = JSON.parse(event.target.result);
      console.log(hyp);
      hyp.forEach((h) => {
        hypotheses.update((l) => {
          l.push({
            name: h.name,
            imgs: new Set(h.imgs),
            descs: new Set(h.descs),
          });
          return l;
        });
        samples.update((l) => {
          l.push(h.samples);
          return l;
        });
        counters.update((l) => {
          l.push(h.counters);
          return l;
        });
      });
    };
    reader.readAsText(f);
  }

  function uploadSample(file) {
    let url = "/sample";
    let formData = new FormData();

    formData.append("file", file);

    fetch(url, {
      method: "POST",
      body: formData,
    })
      .then((d) => d.json())
      .then((d) => {
        samples.update((arr) => {
          let thisArr = arr[$currentHypothesis];
          thisArr.push({
            name: d.name,
            pred: d.pred,
            corr: -1,
          });
          return arr;
        });
        preds.update((m) => {
          m.set(d.name, d.pred);
          return m;
        });
      });
  }

  function uploadCounter(file) {
    let url = "/counter";
    let formData = new FormData();

    formData.append("file", file);

    fetch(url, {
      method: "POST",
      body: formData,
    })
      .then((d) => d.json())
      .then((d) => {
        counters.update((arr) => {
          let thisArr = arr[$currentHypothesis];
          thisArr.push({
            name: d.name,
            og: d.og,
            mod: d.mod,
            corr: -1,
          });
          return arr;
        });
        preds.update((m) => {
          m.set(d.name, d.mod);
          return m;
        });
      });
  }

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  $: drop ? mount() : "";

  function mount() {
    ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
      drop.addEventListener(eventName, preventDefaults, false);
    });
    drop.addEventListener("drop", handleDrop, false);
    ["dragenter", "dragover"].forEach((eventName) => {
      drop.addEventListener(eventName, (_) => (over = true), false);
    });
    ["dragleave", "drop"].forEach((eventName) => {
      drop.addEventListener(eventName, (_) => (over = false), false);
    });
  }
</script>

{#if $upload.length !== 0}
  <div
    transition:fade={{ duration: 200 }}
    class="flex flex-column item-center justify-center absolute h-50 br2 z-999
    bg-light-gray ba bw1 br2 bc b--black-10 {over ? 'b--dashed' : ''}"
    style="width: 37.5%; top: 20%; left: 18.5%"
    bind:this={drop}
  >
    <form class="tc">
      {#if type === "sample"}
        <h4 class="f4 tc v-mid mb4">Drag additional images here to upload</h4>
      {:else if type === "counter"}
        <h4 class="f4 tc v-mid mb4">Drag modified image here to upload</h4>
      {:else}
        <h4 class="f4 tc v-mid mb4">
          Drag hypothesis JSON file here to upload
        </h4>
      {/if}
      <input
        class=""
        type="file"
        id="fileElem"
        multiple
        on:change={function () {
          handleFiles(this.files);
        }}
      />
    </form>
    <button
      class="raised-btn-txt center m-content mt2"
      on:click={(_) => upload.set("")}
    >
      Cancel
    </button>
  </div>
{/if}
