<script>
  import { fade } from "svelte/transition";
  import Counterfactuals from "./Counterfactuals.svelte";
  import Samples from "./Samples.svelte";
  import Save from "./Save.svelte";
  import {
    hypotheses,
    currentHypothesis,
    upload,
    samples,
    counters,
    zoomImg,
    zoomPred,
    hoverSen,
  } from "./stores.js";

  let h = 0;
  let w = 0;
  let page = 0;
  let showHypos = false;

  let imgs = [];
  let descs = [];
  let name = "CLICK TO NAME HYPOTHESIS";
  $: hypotheses.update((d) => {
    d[$currentHypothesis].name = name;
    return d;
  });

  currentHypothesis.subscribe((d) => {
    let curr = $hypotheses[d];
    imgs = Array.from(curr.imgs);
    descs = Array.from(curr.descs);
  });
  hypotheses.subscribe((d) => {
    let curr = d[$currentHypothesis];
    imgs = Array.from(curr.imgs);
    descs = Array.from(curr.descs);
  });

  function addHypothesis() {
    hypotheses.update((l) => {
      l.push({
        name: "New Hypothesis " + l.length,
        imgs: new Set(),
        descs: new Set(),
      });
      return l;
    });
    samples.update((l) => {
      l.push([]);
      return l;
    });
    counters.update((l) => {
      l.push([]);
      return l;
    });
    currentHypothesis.set($hypotheses.length - 1);
    name = "CLICK HERE TO NAME";
    showHypos = false;
  }
</script>

<div
  class="h-top dt w-100 bb b--light-gray bg-first white"
  bind:clientHeight={h}
  bind:clientWidth={w}
>
  <div
    class="inline-flex items-center justify-center w-100"
    style="height: 2rem"
  >
    <h4 class="f5 small-caps tc mh2 pv2">hypotheses</h4>
    <div class="tooltip" data-direction="bottom">
      <div class="tooltip__initiator">
        <i class="pt1 f5 la la-info-circle" />
      </div>
      <div class="tooltip__item">
        <p>Create a new hypothesis describing a specific type of error.</p>
      </div>
    </div>
  </div>
  <div
    class="w-100 inline-flex items-center bt b--light-gray"
    style="height:2.5rem;"
  >
    <h3 class="tc pa1 w-100" contenteditable="true" bind:innerHTML={name}>
      {$hypotheses[$currentHypothesis].name.replace("<br>", "")}
    </h3>
    <button class="ma2 raised-btn" href="#0">
      <i
        class="las la-chevron-down pointer"
        on:click={(_) => (showHypos = !showHypos)}
      />
    </button>
    {#if showHypos}
      <ul
        transition:fade={{ duration: 100 }}
        class="absolute z-999 ma0 pa0 ba b--light-gray bg-first"
        style="top: {h}px; width:{w}px"
      >
        {#each $hypotheses as hypo, i}
          <li
            class="pa2 bb b--light-gray list pointer dim"
            on:click={(_) => {
              name = hypo.name.replace("<br>", "");
              currentHypothesis.set(i);
              showHypos = false;
            }}
          >
            {hypo.name.replace("<br>", "")}
            <span class="fr i">{hypo.imgs.size} reports</span>
          </li>
        {/each}
        <li
          class="pa2 b bb b--light-gray list pointer dim"
          on:click={addHypothesis}
        >
          Create a New Hypothesis
        </li>
      </ul>
    {/if}
  </div>
</div>

<div class="w-100">
  {#if imgs.length === 0}
    <p class="f6 tc pa2 ma2 ba br2 b--black-10">
      Select instances that failed for the described error
    </p>
  {/if}
  {#each imgs.slice(page * 3, page * 3 + 3) as img, i}
    <article
      class="ma1 br2 ba dark-gray b--black-10"
      on:mouseenter={(_) => hoverSen.set(descs[page * 3 + i])}
      on:mouseleave={(_) => hoverSen.set("")}
    >
      <div class="inline-flex justify-between items-center w-100">
        <img
          src="/img/{img}.jpg"
          class="ma1 db br2 br--top thumb"
          alt="hypothesis instance"
          on:mouseenter={(_) => {
            zoomImg.set(img + ".jpg");
            zoomPred.set(descs[page * 3 + i]);
          }}
          on:mouseleave={(_) => {
            zoomImg.set("");
            zoomPred.set("");
          }}
        />
        <div class="pa1">
          <p class="f6 lh-copy measure ma1 mid-gray">{descs[page * 3 + i]}</p>
        </div>
        <div class="flex flex-column tr">
          <button
            class="ma2 raised-btn"
            href="#0"
            title="Remove instance"
            on:click={(d) => {
              hypotheses.update((d) => {
                let currHyp = d[$currentHypothesis];
                currHyp.imgs.delete(img);
                currHyp.descs.delete(descs[page * 3 + i]);
                return d;
              });
            }}
          >
            <i class="red las la-times" />
          </button>
          <a href="/img/{img}.jpg" download>
            <button
              class="raised-btn mh2 mb2"
              title="Create counterfactual"
              on:click={(_) => upload.set("counter")}
            >
              <i class="c-first las la-edit" />
            </button>
          </a>
        </div>
      </div>
    </article>
  {/each}
  <div
    class="w-100 tc ph1 pb1 bb b--black-10 inline-flex items-center
    justify-center"
  >
    <button
      class="ma2 raised-btn"
      href="#0"
      on:click={(_) => (page !== 0 ? page-- : _)}
    >
      <i class="c-first las la-arrow-left" />
    </button>
    <h4 class="f6 ph2">{page + 1} / {Math.ceil(imgs.length / 3)}</h4>
    <button
      href="#0"
      class="ma2 raised-btn"
      on:click={(_) => (page + 1 < Math.ceil(imgs.length / 3) ? page++ : _)}
    >
      <i class="c-first las la-arrow-right" />
    </button>
  </div>
  <Counterfactuals />
  <Samples />
  <Save />
</div>
